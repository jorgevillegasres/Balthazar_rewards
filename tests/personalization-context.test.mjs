import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,apply} from '../app/lib/domain.ts';
import {buildContext} from '../lib/assistant.ts';
import {voiceContext} from '../lib/voice.ts';

function state(enabled=true){
 const s=apply(fresh(),{id:'seed',type:'capture',tasks:[{title:'Leer un artículo'}]});
 s.profile.name='ACCOUNT_NAME_PRIVATE';
 s.balta={profile:{preferredName:'Capitán',workingStyle:'Me ayudan bloques cortos',humor:'lively',support:'balanced',useInAssistant:enabled},memories:[{id:'memory-1',text:'Prefiero estudiar por la mañana',created:1,updated:2}]};
 return s;
}
test('enabled personalization accompanies capture, task and day advice without sending account identity',()=>{
 const s=state();
 for(const kind of ['capture','task','day']){
  const context=buildContext(s,{kind,taskId:s.tasks[0].id,projectId:'',minutes:25,energy:'media'});
  assert.equal(context.personalization?.preferredName,'Capitán');
  assert.deepEqual(context.personalization?.memories,[{text:'Prefiero estudiar por la mañana'}]);
  const json=JSON.stringify(context);assert.ok(!json.includes('ACCOUNT_NAME_PRIVATE'));assert.ok(!json.includes('memory-1'));assert.ok(!json.includes('created'));assert.ok(!json.includes('updated'));
 }
});
test('disabled personalization excludes all saved notes and alias from every text operation',()=>{
 const s=state(false),before=structuredClone(s.balta);
 for(const kind of ['capture','task','day']){
  const context=buildContext(s,{kind,taskId:s.tasks[0].id,projectId:'',minutes:25,energy:'media'});
  assert.equal(context.personalization,undefined);
  const json=JSON.stringify(context);assert.ok(!json.includes('Capitán'));assert.ok(!json.includes('bloques cortos'));assert.ok(!json.includes('Prefiero estudiar'));
 }
 assert.deepEqual(s.balta,before);
});
test('old spaces do not transmit a personalization profile or invent remembered information',()=>{
 const s=fresh();assert.equal(buildContext(s,{kind:'capture',projectId:''}).personalization,undefined);
 assert.equal(s.balta,undefined);
});
test('voice context uses the same enabled profile and excludes it immediately after disabling',()=>{
 const s=state(),voice=voiceContext(s);
 assert.deepEqual(voice.personalization,buildContext(s,{kind:'capture',projectId:''}).personalization);
 assert.ok(!JSON.stringify(voice).includes('ACCOUNT_NAME_PRIVATE'));
 s.balta.profile.useInAssistant=false;assert.equal(voiceContext(s).personalization,undefined);
});
