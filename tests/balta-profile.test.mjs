import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,apply} from '../app/lib/domain.ts';
import {createBackup,parseBackup} from '../lib/backup.ts';
import {createRepository} from '../lib/state-repository.ts';

const now=Date.now();
const profile={preferredName:'J',workingStyle:'Una cosa a la vez',humor:'lively',support:'balanced',useInAssistant:true};
const act=(s,a,t=now)=>apply(s,{id:crypto.randomUUID(),...a},t);
const remember=(s,text='Prefiero bloques cortos',extra={})=>act(s,{type:'baltaRemember',text,confirmed:true,...extra});
function storage(){const rows=new Map();return {read:async id=>structuredClone(rows.get(id)||null),insert:async(id,state)=>{if(!rows.has(id))rows.set(id,{state:structuredClone(state),revision:0})},cas:async(id,revision,state)=>{if(rows.get(id)?.revision!==revision)return false;rows.set(id,{state:structuredClone(state),revision:revision+1});return true}}}

test('default reads and assistant context are detached and exclude account identity and record metadata',async()=>{
 const core=await import('../lib/balta-profile.ts').catch(()=>({}));assert.equal(typeof core.getBalta,'function','profile core is available');
 const s=fresh(now),before=structuredClone(s),defaults=core.getBalta(s);
 assert.deepEqual(defaults,{profile:{preferredName:'',workingStyle:'',humor:'lively',support:'balanced',useInAssistant:false},memories:[]});
 defaults.profile.preferredName='Changed';assert.deepEqual(s,before);assert.equal(core.baltaContext(s),null);
 let configured=act(remember(s),{type:'baltaProfile',profile});
 const context=core.baltaContext(configured);
 assert.deepEqual(context,{preferredName:'J',workingStyle:'Una cosa a la vez',humor:'lively',support:'balanced',memories:[{text:'Prefiero bloques cortos'}]});
 context.preferredName='Changed';context.memories[0].text='Injected';assert.deepEqual(configured.balta.profile,profile);assert.equal(configured.balta.memories[0].text,'Prefiero bloques cortos');
 configured=act(configured,{type:'baltaProfile',profile:{...profile,useInAssistant:false}});assert.equal(core.baltaContext(configured),null);assert.equal(configured.balta.memories.length,1);
});

test('profile stores chosen preferences without changing identity, tasks or economy',()=>{
 const original=fresh(now),before=structuredClone(original),s=act(original,{type:'baltaProfile',profile});
 assert.deepEqual(s.balta.profile,profile);
 assert.deepEqual(original,before);
 for(const key of ['profile','tasks','projects','rewards','points','xp','streak','victories'])assert.deepEqual(s[key],before[key]);
 for(const invalid of [{...profile,preferredName:'x'.repeat(61)},{...profile,workingStyle:'x'.repeat(601)},{...profile,humor:'mean'},{...profile,useInAssistant:'true'},{...profile,extra:'hidden'}])assert.throws(()=>act(s,{type:'baltaProfile',profile:invalid}));
});
test('memories require literal confirmation, reject canonical duplicates and leave failed state intact',()=>{
 const original=fresh(now);
 for(const confirmed of [undefined,false,'true'])assert.throws(()=>act(original,{type:'baltaRemember',text:'Recordar',confirmed}));
 assert.equal(original.balta,undefined);
 const s=remember(original,'  Prefiero café  '),before=structuredClone(s);
 assert.equal(s.balta.memories[0].text,'Prefiero café');
 for(const text of ['PREFIERO CAFE!','', 'x'.repeat(401)])assert.throws(()=>remember(s,text));
 assert.deepEqual(s,before);
});
test('editing preserves identity and creation time and capacity permits editing only existing memories',()=>{
 let s=remember(fresh(now));const memory=s.balta.memories[0];
 s=act(s,{type:'baltaRemember',memoryId:memory.id,text:'Texto editado',confirmed:true},now+5);
 assert.deepEqual(s.balta.memories[0],{...memory,text:'Texto editado',updated:now+5});
 assert.throws(()=>remember(s,'Otra',{memoryId:'missing'}));
 for(let i=1;i<20;i++)s=remember(s,'Recuerdo '+i);
 const before=structuredClone(s);assert.throws(()=>remember(s,'Veintiuno'));assert.deepEqual(s,before);
 assert.equal(remember(s,'Edición',{memoryId:memory.id}).balta.memories.length,20);
 assert.throws(()=>remember(s,'Recuerdo 1',{memoryId:memory.id}));
});
test('deletions require confirmation and preserve preferences',()=>{
 let s=act(remember(fresh(now)),{type:'baltaProfile',profile});const memoryId=s.balta.memories[0].id;
 for(const type of ['baltaForget','baltaForgetAll'])assert.throws(()=>act(s,{type,memoryId}));
 assert.throws(()=>act(s,{type:'baltaForget',memoryId:'missing',confirmed:true}));
 s=act(s,{type:'baltaForget',memoryId,confirmed:true});assert.deepEqual(s.balta.memories,[]);assert.deepEqual(s.balta.profile,profile);
 s=act(remember(s),{type:'baltaForgetAll',confirmed:true});assert.deepEqual(s.balta.memories,[]);
});
test('backup preserves personalization and accepts legacy absence while rejecting invalid memory records',()=>{
 const s=act(remember(fresh(now)),{type:'baltaProfile',profile});
 assert.deepEqual(parseBackup(JSON.parse(JSON.stringify(createBackup(s,now))),now).balta,s.balta);
 assert.equal(parseBackup(createBackup(fresh(now),now),now).balta,undefined);
 for(const alter of [b=>b.memories.push({...b.memories[0]}),b=>b.memories[0].updated=Number.MAX_SAFE_INTEGER+1,b=>b.memories[0].created=-1,b=>b.memories=Array.from({length:21},(_,i)=>({...b.memories[0],id:String(i)})),b=>b.profile.extra='bad']){
  const backup=createBackup(s,now);alter(backup.state.balta);assert.throws(()=>parseBackup(backup,now));
 }
});
test('repository personalization obeys CAS, retry idempotence and owner isolation',async()=>{
 const repo=createRepository(storage());await repo.read('a');
 const command={id:'memory-command',type:'baltaRemember',text:'Memoria privada',confirmed:true};
 const winner=await repo.mutate('a',0,command);assert.equal(winner.revision,1);
 const retry=await repo.mutate('a',0,command);assert.equal(retry.revision,1);assert.equal(retry.state.balta.memories.length,1);
 assert.equal((await repo.read('b')).state.balta,undefined);
 await assert.rejects(repo.mutate('a',0,{...command,id:'stale',text:'Otra'}),/CONFLICT/);
 const results=await Promise.allSettled([repo.mutate('a',1,{...command,id:'one',text:'Uno'}),repo.mutate('a',1,{...command,id:'two',text:'Dos'})]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.match(results.find(r=>r.status==='rejected').reason.message,/CONFLICT/);
});
test('import cannot overwrite configured preferences or disabled memories',async()=>{
 for(const command of [{type:'baltaProfile',profile:{...profile,useInAssistant:false}},{type:'baltaRemember',text:'Privado',confirmed:true}]){
  const repo=createRepository(storage());await repo.read('a');await repo.mutate('a',0,{id:'configure',...command});
  await assert.rejects(repo.import('a',1,createBackup(fresh())),/EMPTY_REQUIRED/);
 }
 const repo=createRepository(storage()),state=remember(fresh());assert.deepEqual((await repo.import('new',0,createBackup(state))).state.balta,state.balta);
});
