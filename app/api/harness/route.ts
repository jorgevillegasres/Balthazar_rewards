import {createHash} from 'node:crypto';

import type {SupabaseClient} from '@supabase/supabase-js';

import {authenticated} from '../../../lib/auth';

import {repository} from '../../../lib/repository';

import {isSameOrigin} from '../../../lib/access';

import {buildContext,validateProposal} from '../../../lib/assistant';

import {askOpenAI} from '../../../lib/openai';

import {harnessRequestSchema,canExecute,proposalCommand} from '../../../lib/harness';

import {reserveOperation,readOperation,updateOperation} from '../../../lib/operation-store';

export const dynamic='force-dynamic';

const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});

export async function GET(request:Request){


 try{const auth=await authenticated();if(!auth)return json({error:'Vuelve a entrar.',signIn:true},401);

 const id=new URL(request.url).searchParams.get('id');if(!id||!harnessRequestSchema.shape.operationId.safeParse(id).success)return json({error:'Operación inválida.'},400);

 const op=await readOperation(auth.client,auth.user.id,id);if(!op)return json({error:'Operación no encontrada.'},404);

 const snapshot=await repository(auth.client).read(auth.user.id);const receipt=snapshot.state.activity?.find(a=>a.id===id);

 return json({operationId:id,proposal:op.proposal,revision:op.revision,status:receipt?receipt.status:op.status,...(receipt?snapshot:{}),code:op.code});

 }catch{return json({error:'No pudimos comprobar la operación. Reintenta con el mismo ID.'},503)}

}

export async function POST(request:Request){

 if(!isSameOrigin(request))return json({error:'Solicitud no permitida.'},403);

 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Formato inválido.'},415);

 let operationId='',owner='',client:SupabaseClient|null=null,reserved=false;

 try{

 const auth=await authenticated();if(!auth)return json({error:'Vuelve a entrar.',signIn:true},401);client=auth.client;owner=auth.user.id;

 const raw=await request.text();if(raw.length>16000)return json({error:'Texto demasiado largo.'},413);

 const parsed=harnessRequestSchema.safeParse(JSON.parse(raw));if(!parsed.success)return json({error:'Revisa los datos y el consentimiento.'},400);

 const input=parsed.data;operationId=input.operationId;

 if(input.kind==='capture'&&!input.text.trim())return json({error:'Describe lo que quieres capturar.'},400);

 const requestHash=createHash('sha256').update(JSON.stringify(input)).digest('hex');

 const existing=await readOperation(client,owner,operationId);

 const repo=repository(client),snapshot=await repo.read(owner);

 if(existing){if(existing.request_hash!==requestHash)return json({error:'Este ID corresponde a otra solicitud.'},409);

 const receipt=snapshot.state.activity?.find(a=>a.id===operationId);return json({operationId,proposal:existing.proposal,revision:existing.revision,status:receipt?receipt.status:existing.status,...(receipt?snapshot:{}),code:existing.code},existing.proposal||receipt?200:202)}

 if(snapshot.revision!==input.revision)return json({error:'Tu espacio cambió. Actualiza y consulta de nuevo.',conflict:true},409);

 const context=buildContext(snapshot.state,input);

 if(input.kind==='day'&&!(context as {candidates:unknown[]}).candidates.length)return json({error:'No hay misiones disponibles.'},400);

 const key=process.env.OPENAI_API_KEY;if(!key)return json({error:'La asistencia con IA aún no está configurada.'},503);

 await reserveOperation(client,owner,operationId,{kind:input.kind,source:input.source,revision:input.revision,requestHash});reserved=true;

 const {data:allowance,error}=await client.rpc('balthazar_reserve_ai');if(error)throw Error('AI_QUOTA_UNAVAILABLE');if(typeof allowance!=='number'||allowance<=0){await updateOperation(client,owner,operationId,{status:'failed',code:'QUOTA'});return json({error:'Alcanzaste el límite diario de consultas.',operationId},429)}

 const proposal=validateProposal(snapshot.state,input,await askOpenAI(context,key));

 // Persist the draft before any domain write. Provider output is never authority.

 await updateOperation(client,owner,operationId,{proposal,summary:proposal.summary.slice(0,300),status:'pending'});

 if(!canExecute(input,proposal,snapshot.state))return json({proposal,revision:input.revision,operationId,status:'pending',remaining:allowance-1});

 const command=proposalCommand(snapshot.state,input,proposal);

 const result=await repo.mutate(owner,input.revision,{id:operationId,type:'baltaAction',operationId,source:input.source,summary:proposal.summary.slice(0,300),inputRevision:input.revision,command});

 try{await updateOperation(client,owner,operationId,{status:'executed',code:''})}catch{/* The atomic state receipt is authoritative. */}

 return json({proposal,operationId,status:'executed',...result,remaining:allowance-1});

 }catch(e){const code=e instanceof Error?e.message:'UNKNOWN';

 if(code==='OPERATION_EXISTS')return json({error:'Esta operación ya se está procesando. Consulta su ID.',operationId},409);

 if(reserved&&operationId&&owner&&client){try{await updateOperation(client!,owner,operationId,{status:code==='CONFLICT'?'rejected':'failed',code:['CONFLICT','TASK_UNAVAILABLE','PROJECT_UNAVAILABLE','DUPLICATE_TASK','AI_QUOTA_UNAVAILABLE','AI_RATE_LIMIT','AI_REFUSAL'].includes(code)?code:'INVALID_PROPOSAL'})}catch{}}

 const conflict=['CONFLICT','TASK_UNAVAILABLE','PROJECT_UNAVAILABLE'].includes(code);

 return json({error:conflict?'Tu espacio cambió. Revisa la propuesta antes de continuar.':code==='DUPLICATE_TASK'?'La propuesta contiene tareas repetidas. Revisa el borrador.':'No pudimos completar la operación. Consulta su ID antes de reintentar.',operationId,conflict},e instanceof SyntaxError?400:conflict?409:503);

 }

}
