import test from 'node:test';

import assert from 'node:assert/strict';

import {fresh,apply} from '../app/lib/domain.ts';

import {harnessRequestSchema,canExecute,proposalCommand,transcriptionForTurn} from '../lib/harness.ts';

const input={kind:'capture',revision:0,consent:true,text:'Crea una tarea para leer',projectId:'',source:'text',mode:'auto',operationId:'12345678-1234-4234-8234-123456789abc'};

const proposal={summary:'Leer',questions:[],tasks:[{title:'Leer',area:'Trabajo',projectId:'',due:'',minutes:15,nextAction:'Abrir libro'}],items:[],steps:[],nextAction:''};
test('out-of-order and assistant voice transcripts cannot authorize the latest turn',()=>{const event={type:'conversation.item.input_audio_transcription.completed',item_id:'latest',transcript:'Crea una tarea'};assert.equal(transcriptionForTurn('latest',event),event.transcript);assert.equal(transcriptionForTurn('newer',event),null);assert.equal(transcriptionForTurn('',event),null);assert.equal(transcriptionForTurn('latest',{...event,type:'response.output_audio_transcript.done'}),null)});
test('voice plans cannot invent available duration or energy',()=>{const s=fresh(),plan={...proposal,tasks:[],items:[{taskId:'one',minutes:15,reason:'Prioridad'}]},r={...input,kind:'day',source:'voice',minutes:25,energy:'media'};assert.equal(canExecute({...r,userText:'Aplica el plan del día'},plan,s),false);assert.equal(canExecute({...r,userText:'Aplica el plan de 20 minutos'},plan,s),false);assert.equal(canExecute({...r,userText:'Aplica el plan de 25 minutos'},plan,s),true);assert.equal(canExecute({...r,energy:'alta',userText:'Aplica el plan de 25 minutos'},plan,s),false);assert.equal(canExecute({...r,energy:'baja',userText:'Aplica el plan de 25 minutos con energía baja'},plan,s),true)});

test('closed catalog and consent are mandatory',()=>{assert.throws(()=>harnessRequestSchema.parse({...input,kind:'sql'}));assert.throws(()=>harnessRequestSchema.parse({...input,consent:false}));assert.throws(()=>harnessRequestSchema.parse({...input,operationId:'no'}))});

test('only positive explicit requests in auto mode execute',()=>{assert.equal(canExecute(input,proposal),true);for(const text of ['¿Crea una tarea?','No crees una tarea','Podrías crear una tarea','Crea una tarea pero no la guardes','Crea una tarea para mañana','Crea una tarea; ¿es buena idea?'])assert.equal(canExecute({...input,text},proposal),false,text);assert.equal(canExecute({...input,mode:'review'},proposal),false);assert.equal(canExecute({...input,projectId:undefined},proposal),false)});

test('essential questions and voice model text never grant authority',()=>{assert.equal(canExecute(input,{...proposal,questions:['¿Qué libro?']}),false);assert.equal(canExecute({...input,source:'voice',userText:'¿Qué puedo hacer?'},proposal),false);assert.equal(canExecute({...input,source:'voice',userText:'Crea una tarea para leer sin proyecto'},proposal),true);assert.equal(canExecute({...input,source:'voice',userText:''},proposal),false)});

test('duplicate titles cannot become capture commands',()=>{const s=fresh();assert.throws(()=>proposalCommand(s,input,{...proposal,tasks:[...proposal.tasks,...proposal.tasks]}),/DUPLICATE/)});

test('task conversion inherits parent and preserves its steps',()=>{const s=apply(fresh(),{id:'seed',type:'capture',tasks:[{title:'Informe',area:'Trabajo',projectId:'',steps:['Ya existente']}]});const t=s.tasks[0];const command=proposalCommand(s,{...input,kind:'task',taskId:t.id},{...proposal,tasks:[],nextAction:'Empezar',steps:['Investigar','Redactar']});assert.equal(command.type,'capture');assert.equal(command.tasks[0].parentId,t.id);assert.equal(command.tasks[0].area,t.area);assert.deepEqual(t.steps,['Ya existente']);assert.equal(command.tasks[0].projectId,t.projectId)});



test('voice references must be grounded in the actual user transcription',()=>{const s=fresh();s.projects=[{id:'p1',name:'Informe',area:'Trabajo'}];assert.equal(canExecute({...input,source:'voice',projectId:'p1',userText:'Crea una tarea para leer'},proposal,s),false);assert.equal(canExecute({...input,source:'voice',projectId:'p1',userText:'Crea una tarea para leer en el proyecto Informe'},proposal,s),true)});


// Exercise the real route with infrastructure isolated; domain validation remains real.
import fs from 'node:fs/promises';
import ts from 'typescript';
import {buildContext,validateProposal} from '../lib/assistant.ts';
const source=await fs.readFile(new URL('../app/api/harness/route.ts',import.meta.url),'utf8');
const moduleSource=source.replace(/^import .* from '\.\.\/.*';$/gm,line=>{
 const names=line.match(/import \{([^}]+)\}/)?.[1];return names?'const {'+names+'}=globalThis.__harnessTestDependencies;':'';
});
const js=ts.transpileModule(moduleSource,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const origin='https://harness.test';
function fixture({authenticated=true,sameOrigin=true,quota=20,revision=0,failDraft=false}={}){
 let state=fresh();state.activity=[];let rev=revision,provider=0,mutations=0,reservations=0;const records=new Map();
 const client={rpc:async()=>({data:quota,error:null})};
 const repo={read:async()=>({state,revision:rev}),mutate:async(_owner,expected,command)=>{mutations++;assert.equal(expected,rev);state=apply(state,command);rev++;return {state,revision:rev}}};
 globalThis.__harnessTestDependencies={authenticated:async()=>authenticated?{client,user:{id:'owner'}}:null,isSameOrigin:()=>sameOrigin,repository:()=>repo,buildContext,validateProposal,harnessRequestSchema,canExecute,proposalCommand,askOpenAI:async()=>{provider++;return proposal},readOperation:async(_client,owner,id)=>{assert.equal(owner,'owner');return records.get(id)||null},reserveOperation:async(_client,owner,id,input)=>{reservations++;const row={id,user_id:owner,...input,request_hash:input.requestHash,status:'pending',proposal:null,code:''};records.set(id,row);return row},updateOperation:async(_client,owner,id,fields)=>{if(failDraft&&fields.proposal)throw Error('OPERATION_STORAGE');const row={...records.get(id),...fields};records.set(id,row);return row}};
 return {records,repo,counts:()=>({provider,mutations,reservations})};
}
async function route(){return import('data:text/javascript;base64,'+Buffer.from(js+'\n//'+crypto.randomUUID()).toString('base64'))}
const post=body=>new Request(origin+'/api/harness',{method:'POST',headers:{'content-type':'application/json',origin},body:JSON.stringify(body)});
test('route refuses unauthenticated and foreign origin without AI or writes',async()=>{for(const options of [{authenticated:false},{sameOrigin:false}]){const f=fixture(options),r=await route();assert.ok([401,403].includes((await r.POST(post(input))).status));assert.deepEqual(f.counts(),{provider:0,mutations:0,reservations:0})}});
test('stale revision is refused before quota reservation or provider',async()=>{const f=fixture({revision:1}),r=await route();assert.equal((await r.POST(post(input))).status,409);assert.deepEqual(f.counts(),{provider:0,mutations:0,reservations:0})});
test('same operation ID returns executed receipt without another AI call or mutation',async()=>{const old=process.env.OPENAI_API_KEY;process.env.OPENAI_API_KEY='fake-test-key';try{const f=fixture(),r=await route();let response=await r.POST(post(input));assert.equal(response.status,200);assert.equal((await response.json()).status,'executed');response=await r.POST(post(input));assert.equal((await response.json()).status,'executed');assert.deepEqual(f.counts(),{provider:1,mutations:1,reservations:1});const lookup=await r.GET(new Request(origin+'/api/harness?id='+input.operationId));assert.equal((await lookup.json()).status,'executed')}finally{if(old===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=old}});
test('unpersisted draft and exhausted quota never mutate domain',async()=>{const old=process.env.OPENAI_API_KEY;process.env.OPENAI_API_KEY='fake-test-key';try{for(const options of [{failDraft:true},{quota:0}]){const f=fixture(options),r=await route();const response=await r.POST(post(input));assert.ok([429,503].includes(response.status));assert.equal(f.counts().mutations,0)}}finally{if(old===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=old}});

test('imperatives for another action and conditional requests stay pending',()=>{for(const text of ['Crea un poema sobre leer','Crea una tarea si puedes','Crea una tarea para leer en dos días'])assert.equal(canExecute({...input,text},proposal),false,text);const plan={...proposal,tasks:[],items:[{taskId:'one',minutes:15,reason:'Prioridad'}]};assert.equal(canExecute({...input,kind:'day',text:'Organiza un picnic'},plan),false);assert.equal(canExecute({...input,kind:'day',text:'Aplica el plan del día'},plan),true)});

import {voiceContext,voiceToolInput} from '../lib/voice.ts';
test('text and voice contexts bound purposes and child task fields without private data',()=>{const s=apply(fresh(),{id:'parentseed',type:'capture',tasks:[{title:'Principal'}]});s.purposes=Array.from({length:30},(_,i)=>({id:'purpose'+i,title:'T'.repeat(200),description:'D'.repeat(1000),area:'Trabajo',due:'',status:'active'}));s.purposes.push({id:'archived',title:'SECRET_ARCHIVED',description:'',area:'Trabajo',due:'',status:'archived'});s.projects=[{id:'p',name:'Proyecto',area:'Trabajo',description:'',purposeId:'purpose0'}];s.tasks.push(...Array.from({length:30},(_,i)=>({...s.tasks[0],id:'child'+i,parentId:s.tasks[0].id,title:'C'.repeat(300),nextAction:'N'.repeat(500)})));s.profile.name='PRIVATE_NAME';const c=buildContext(s,{kind:'task',taskId:s.tasks[0].id});assert.equal(c.purposes.length,20);assert.equal(c.subtasks.length,20);assert.equal(c.subtasks[0].title.length,160);assert.equal(c.subtasks[0].nextAction.length,300);assert.equal(c.purposes[0].description.length,300);const v=voiceContext(s);assert.equal(v.purposes.length,20);assert.equal(v.projects[0].purposeId,'purpose0');for(const context of [c,v]){assert.ok(!JSON.stringify(context).includes('PRIVATE_NAME'));assert.ok(!JSON.stringify(context).includes('SECRET_ARCHIVED'))}});


test('short voice reference names do not match arbitrary words',()=>{const s=fresh();s.projects=[{id:'p1',name:'A',area:'Trabajo'}];assert.equal(canExecute({...input,source:'voice',projectId:'p1',userText:'Crea una tarea para leer'},proposal,s),false);assert.equal(canExecute({...input,source:'voice',projectId:'p1',userText:'Crea una tarea para el proyecto Agua'},proposal,s),false);assert.equal(canExecute({...input,source:'voice',projectId:'p1',userText:'Crea una tarea para el proyecto A'},proposal,s),true)});

test('undone receipt is authoritative on lookup and exact-ID replay',async()=>{const old=process.env.OPENAI_API_KEY;process.env.OPENAI_API_KEY='fake-test-key';try{const f=fixture(),r=await route();await r.POST(post(input));const snapshot=await f.repo.read('owner');snapshot.state.activity[0].status='undone';const replay=await r.POST(post(input));assert.equal((await replay.json()).status,'undone');const lookup=await r.GET(new Request(origin+'/api/harness?id='+input.operationId));assert.equal((await lookup.json()).status,'undone');assert.equal(f.counts().mutations,1)}finally{if(old===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=old}});

test('voice cancellation preserves the ID across panels and a late known success resolves it',async()=>{
 const hookSource=await fs.readFile(new URL('../app/components/useVoice.ts',import.meta.url),'utf8');
 const compiled=ts.transpileModule(hookSource.replace(/^import .* from .*;$/gm,line=>{const names=line.match(/import \{([^}]+)\}/)?.[1];return names?'const {'+names+'}=globalThis.__voiceCancellationTest;':''}),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 const original={fetch:globalThis.fetch,navigator:Object.getOwnPropertyDescriptor(globalThis,'navigator'),Audio:globalThis.Audio,RTCPeerConnection:globalThis.RTCPeerConnection,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};
 let channel,body,finish,failRequest,notifyRequest,mediaCalls=0,refreshes=0;
 globalThis.__voiceCancellationTest={useState:value=>[value,()=>{}],useRef:value=>({current:value}),useEffect:()=>{},voiceToolInput,transcriptionForTurn};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:async()=>{mediaCalls++;return {getTracks:()=>[{stop(){}}],getAudioTracks:()=>[]}}}}});
 globalThis.Audio=class{play(){return Promise.resolve()}pause(){}};
 globalThis.RTCPeerConnection=class{addTrack(){}createDataChannel(){channel={readyState:'open',send(){},close(){}};return channel}async createOffer(){return {sdp:'v=0'}}async setLocalDescription(){}async setRemoteDescription(){}close(){}};
 globalThis.setTimeout=()=>0;globalThis.clearTimeout=()=>{};
 globalThis.fetch=async(url,options={})=>{
  if(url==='/api/voice'){const request=JSON.parse(options.body);return Response.json(request.action==='start'?{sdp:'v=0',ticket:'test',deadline:Date.now()+300000}:{})}
  if(url==='/api/harness'){assert.equal(options.keepalive,true);assert.equal(options.signal,undefined);body=JSON.parse(options.body);return new Promise((resolve,reject)=>{finish=resolve;failRequest=reject;notifyRequest()})}
  assert.equal(url,'/api/harness?id='+body.operationId);return Response.json({operationId:body.operationId,revision:0,status:'executed',proposal});
 };
 try{
  const {useVoice}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64')),refresh=async()=>{refreshes++};
  async function issue(hook){await hook.start();await channel.onmessage({data:JSON.stringify({type:'input_audio_buffer.speech_started',item_id:'turn'})});await channel.onmessage({data:JSON.stringify({type:'conversation.item.input_audio_transcription.completed',item_id:'turn',transcript:'Crea una tarea para leer sin proyecto'})});return channel.onmessage({data:JSON.stringify({type:'response.done',response:{output:[{type:'function_call',name:'capture_tasks',call_id:crypto.randomUUID(),arguments:JSON.stringify({text:'leer',projectId:''})}]}})});}
  const first=useVoice(fresh(),0,refresh,true,'owner-cancellation'),requested=new Promise(resolve=>{notifyRequest=resolve});const running=issue(first);await requested;assert.ok(body?.operationId);first.end();failRequest(new TypeError('Network lost'));await running;
  const reopened=useVoice(fresh(),0,refresh,true,'owner-cancellation');assert.equal(reopened.uncertain,true);assert.equal(reopened.canRetry,false);const before=mediaCalls;await reopened.start();assert.equal(mediaCalls,before);assert.equal(useVoice(fresh(),0,refresh,true,'other-owner').uncertain,false);await reopened.checkOperation();assert.equal(useVoice(fresh(),0,refresh,true,'owner-cancellation').uncertain,false);
  body=null;const late=useVoice(fresh(),0,refresh,true,'owner-late'),lateRequested=new Promise(resolve=>{notifyRequest=resolve});const awaiting=issue(late);await lateRequested;assert.ok(body?.operationId);late.end();finish(Response.json({operationId:body.operationId,revision:1,status:'executed',proposal}));await awaiting;assert.equal(useVoice(fresh(),0,refresh,true,'owner-late').uncertain,false);assert.equal(refreshes,2);
 }finally{globalThis.fetch=original.fetch;Object.defineProperty(globalThis,'navigator',original.navigator);globalThis.Audio=original.Audio;globalThis.RTCPeerConnection=original.RTCPeerConnection;globalThis.setTimeout=original.setTimeout;globalThis.clearTimeout=original.clearTimeout;delete globalThis.__voiceCancellationTest;}
});
