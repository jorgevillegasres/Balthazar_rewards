import test from 'node:test';
import assert from 'node:assert/strict';
import {memoryDraftForTurn} from '../lib/voice-memory.ts';
import {fresh} from '../app/lib/domain.ts';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';

test('memory requires authoritative current transcription and an explicit instruction',()=>{
 for(const transcript of ['Recuerda que prefiero listas','Guarda este recuerdo: prefiero listas','No olvides que prefiero listas','Balta, recuerda que prefiero listas']){
  assert.deepEqual(memoryDraftForTurn('turn-1',transcript,{text:'  Prefiero listas  '},8,'operation-1'),{kind:'memory',text:'Prefiero listas',summary:'Recuerdo propuesto. Revisa el texto y pulsa Guardar recuerdo.',questions:[],revision:8,operationId:'operation-1'});
 }
 for(const transcript of ['Prefiero listas','No recuerdes que prefiero listas','No guardes este recuerdo: prefiero listas','¿Recuerda que prefiero listas?','Puedes recordar que prefiero listas','Recuerda que prefiero listas, pero no guardes nada','Si digo recuerda que, ¿lo guardas?','No olvides que'])assert.throws(()=>memoryDraftForTurn('turn-1',transcript,{text:'Prefiero listas'},8,'operation-1'),/explícita/);
 assert.throws(()=>memoryDraftForTurn('','Recuerda que prefiero listas',{text:'Prefiero listas'},8,'operation-1'),/transcripción/);
 assert.throws(()=>memoryDraftForTurn('turn-1','',{text:'Prefiero listas'},8,'operation-1'),/transcripción/);
});
test('model draft input cannot carry confirmations or exceed a single bounded memory',()=>{
 for(const input of [{text:' '},{text:'x'.repeat(401)},{text:'Prefiero listas',confirmed:true}])assert.throws(()=>memoryDraftForTurn('turn-1','Recuerda que prefiero listas',input,8,'operation-1'));
});

test('synthetic voice protocol only proposes memory and never posts it to harness even in auto mode',async(t)=>{
 const reactUrl='data:text/javascript,'+encodeURIComponent('export const states=[]; export function useState(value){const index=states.push(value)-1;return [value,next=>{states[index]=typeof next==="function"?next(states[index]):next}]} export function useRef(value){return {current:value}} export function useEffect(){}');
 const hooks=await import(reactUrl);
 const hookUrl=new URL('../app/components/useVoice.ts',import.meta.url);
 let source=await readFile(hookUrl,'utf8');
 source=source.replace(/from 'react'/,"from '"+reactUrl+"'").replace(/from '(\.\.\/\.\.\/lib\/[^']+)'/g,(_,path)=>"from '"+new URL(path+'.ts',hookUrl).href+"'");
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 const {useVoice}=await import('data:text/javascript,'+encodeURIComponent(compiled));
 const sent=[],requests=[];let channel;
 const nav=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}}});
 t.after(()=>{if(nav)Object.defineProperty(globalThis,'navigator',nav);else delete globalThis.navigator});
 t.mock.method(globalThis,'setTimeout',()=>0);t.mock.method(globalThis,'clearTimeout',()=>{});
 t.mock.method(globalThis,'fetch',async(url,options)=>{requests.push({url,options});assert.equal(url,'/api/voice');return Response.json(JSON.parse(options.body).action==='start'?{ticket:'fixture',deadline:Date.now()+300000,sdp:'answer'}:{});});
 const originalRTC=globalThis.RTCPeerConnection,originalAudio=globalThis.Audio;
 globalThis.Audio=class {pause(){} async play(){}};
 globalThis.RTCPeerConnection=class {addTrack(){} createDataChannel(){return channel={readyState:'open',send(value){sent.push(JSON.parse(value))},close(){}}} async createOffer(){return {sdp:'offer'}} async setLocalDescription(){} async setRemoteDescription(){} close(){}};
 t.after(()=>{globalThis.RTCPeerConnection=originalRTC;globalThis.Audio=originalAudio});
 const voice=useVoice(fresh(),12,async()=>{assert.fail('Memory draft must not refresh or save')},true,'fixture-owner');
 await voice.start();channel.onopen();
 const emit=event=>channel.onmessage({data:JSON.stringify(event)});
 const call=id=>emit({type:'response.done',response:{output:[{type:'function_call',name:'remember_information',call_id:id,arguments:JSON.stringify({text:'Prefiero listas'})}]}});
 const output=()=>JSON.parse(sent.findLast(event=>event.type==='conversation.item.create').item.output);
 await emit({type:'input_audio_buffer.speech_started',item_id:'turn-1'});
 await emit({type:'conversation.item.input_audio_transcription.completed',item_id:'old-turn',transcript:'Recuerda que prefiero listas'});
 await call('without-transcription');assert.match(output().error,/transcripción/);assert.equal(hooks.states[5],null);
 await emit({type:'conversation.item.input_audio_transcription.completed',item_id:'turn-1',transcript:'Recuerda que prefiero listas'});
 await call('valid');const draft=hooks.states[5];assert.equal(draft.kind,'memory');assert.equal(draft.revision,12);assert.equal(draft.text,'Prefiero listas');assert.match(output().status,/No guardado/);assert.ok(draft.operationId);
 await call('same-turn');assert.match(output().error,/este turno/);assert.equal(hooks.states[5],draft);
 for(let i=2;i<=4;i++){await emit({type:'input_audio_buffer.speech_started',item_id:'turn-'+i});await emit({type:'conversation.item.input_audio_transcription.completed',item_id:'turn-'+i,transcript:'Guarda este recuerdo: prefiero listas'});await call('valid-'+i);assert.match(output().status,/No guardado/);}
 await emit({type:'input_audio_buffer.speech_started',item_id:'turn-5'});await emit({type:'conversation.item.input_audio_transcription.completed',item_id:'turn-5',transcript:'Recuerda que prefiero listas'});await call('over-budget');assert.match(output().error,/seis propuestas/);
 assert.ok(requests.every(request=>request.url==='/api/voice'));assert.equal(sent.at(-1).type,'response.create');voice.end();
});
