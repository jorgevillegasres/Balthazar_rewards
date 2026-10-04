import {authenticated} from '../../../lib/auth';
import {repository} from '../../../lib/repository';
import {isSameOrigin} from '../../../lib/access';
import {requestSchema,buildContext,validateProposal} from '../../../lib/assistant';
import {askOpenAI,AIError} from '../../../lib/openai';
import {ZodError} from 'zod';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function POST(request:Request){
 if(!isSameOrigin(request))return json({error:'Solicitud no permitida.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Formato inválido.'},415);
 let stage='request';
 try{
  const auth=await authenticated();if(!auth)return json({error:'Tu sesión terminó. Vuelve a entrar.',signIn:true},401);
  const raw=await request.text();if(raw.length>12000)return json({error:'El texto es demasiado largo.'},413);
  const parsed=requestSchema.safeParse(JSON.parse(raw));if(!parsed.success)return json({error:'Revisa los datos y acepta el envío de contexto.'},400);
  const input=parsed.data;
  if(input.kind==='capture'&&!input.text.trim())return json({error:'Escribe primero lo que tienes pendiente.'},400);
  const key=process.env.OPENAI_API_KEY;if(!key)return json({error:'La asistencia con IA aún no está activada. Falta configurar la clave de OpenAI en Render. Puedes seguir usando las funciones manuales.'},503);
  stage='state';const snapshot=await repository(auth.client).read(auth.user.id);
  if(snapshot.revision!==input.revision)return json({error:'Tu espacio cambió. Actualízalo y vuelve a consultar.',conflict:true},409);
  stage='context';const context=buildContext(snapshot.state,input);
  if(input.kind==='day'&&!(context as {candidates:unknown[]}).candidates.length)return json({error:'No hay misiones disponibles. Captura una tarea o revisa sus dependencias.'},400);
  stage='quota';const {data:allowance,error}=await auth.client.rpc('balthazar_reserve_ai');if(error)throw Error('AI_QUOTA_UNAVAILABLE');
  if(typeof allowance!=='number'||allowance<=0)return json({error:'Alcanzaste las 20 consultas de hoy. El límite se renueva a medianoche de Bogotá; tus funciones manuales siguen disponibles.'},429);
  stage='provider';const rawProposal=await askOpenAI(context,key);
  stage='validation';const proposal=validateProposal(snapshot.state,input,rawProposal);
  return json({proposal,revision:snapshot.revision,remaining:allowance-1});
 }catch(e){
  const name=e instanceof Error?e.message:'';
  if(e instanceof SyntaxError)return json({error:'Solicitud inválida.'},400);
  if(name==='PROJECT_UNAVAILABLE')return json({error:'El proyecto elegido ya no está disponible. Actualiza tu espacio.',conflict:true},409);
  if(name==='TASK_UNAVAILABLE')return json({error:'Esta misión ya no está disponible. Actualiza tu espacio.'},409);
  const reference=crypto.randomUUID().slice(0,8);
  const knownErrors=new Set(['AI_RATE_LIMIT','AI_PROVIDER','AI_REFUSAL','AI_INVALID_RESPONSE','AI_QUOTA_UNAVAILABLE','INVALID_PROPOSAL']);
  console.error('balthazar_assistant_failure',JSON.stringify({reference,stage,code:knownErrors.has(name)?name:e instanceof ZodError?'SCHEMA_VALIDATION':e instanceof Error&&['TimeoutError','AbortError'].includes(e.name)?'TIMEOUT':'OTHER',...(e instanceof AIError?{provider:e.diagnostic}:{}),...(e instanceof ZodError?{issues:e.issues.map(issue=>({code:issue.code,path:issue.path.filter(part=>typeof part==='number'||['summary','questions','tasks','items','nextAction','steps','title','area','projectId','due','minutes','taskId','reason'].includes(part as string))}))}:{})}));
  const error=name==='AI_RATE_LIMIT'?'OpenAI no pudo atender la consulta. Revisa el saldo y los límites de tu cuenta o intenta más tarde.':name==='AI_REFUSAL'?'No se pudo generar esta propuesta. Prueba con una descripción más concreta.':e instanceof Error&&(e.name==='TimeoutError'||e.name==='AbortError')?'La consulta tardó demasiado. No se cambió tu progreso. Puedes intentar de nuevo.':name==='AI_QUOTA_UNAVAILABLE'?'No pudimos comprobar el límite diario. Intenta más tarde.':'No pudimos obtener una propuesta válida. No se cambió tu progreso. Intenta de nuevo o continúa manualmente.';
  return json({error:`${error} Referencia: ${reference}.`},503);
 }
}
