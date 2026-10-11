import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh} from '../app/lib/domain.ts';
import {createRepository} from '../lib/state-repository.ts';
import {createBackup,parseBackup} from '../lib/backup.ts';
import {allowedEmail,isSameOrigin} from '../lib/access.ts';
import {MAX_BACKUP_BYTES,MAX_BACKUP_REQUEST_BYTES,BACKUP_SIZE_ERROR,readBackupRequest} from '../lib/backup-transfer.ts';
import {shiftDate} from '../lib/routines.ts';

test('maximum routine history with maximum Unicode titles fits the shared backup transfer limit',async()=>{
 const state=fresh(),title='漢'.repeat(160),description='漢'.repeat(1000);
 state.routines=Array.from({length:100},(_,i)=>({id:String(i).padStart(100,'漢'),title,description,area:'Personal',projectId:'',weekdays:[0,1,2,3,4,5,6],startDate:shiftDate(state.lastDay,-365),minutes:120,briefMinutes:120,status:'active'}));
 state.routineEntries=state.routines.flatMap(r=>Array.from({length:366},(_,i)=>({routineId:r.id,date:shiftDate(state.lastDay,-i),status:'completed',mode:'normal',title,minutes:120,at:Date.now()})));
 const file=JSON.stringify(createBackup(state),null,2),fileBytes=Buffer.byteLength(file,'utf8');
 assert.ok(fileBytes>2000000);
 assert.ok(fileBytes<=MAX_BACKUP_BYTES,'maximum valid routine history must fit the client file limit');
 const body=JSON.stringify({revision:0,backup:JSON.parse(file)});
 assert.ok(Buffer.byteLength(body,'utf8')<=MAX_BACKUP_REQUEST_BYTES);
 const received=JSON.parse(await readBackupRequest(new Request('https://example.com/api/backup',{method:'POST',body})));
 assert.equal(parseBackup(received.backup).routineEntries.length,36600);
});
test('backup body limit counts actual UTF-8 bytes even when Content-Length understates them',async()=>{
 const request=new Request('https://example.com/api/backup',{method:'POST',headers:{'Content-Length':'1'},body:'漢漢漢'});
 await assert.rejects(readBackupRequest(request,8),new RegExp(BACKUP_SIZE_ERROR.replace('.','\\.')));
});
test('backup body limit accepts its exact byte boundary',async()=>{
 const request=new Request('https://example.com/api/backup',{method:'POST',body:'漢漢漢'});
 assert.equal(await readBackupRequest(request,9),'漢漢漢');
});
test('oversized backup streams stop before consuming the remaining body',async()=>{
 let cancelled=false;
 const stream=new ReadableStream({start(controller){for(let i=0;i<3;i++)controller.enqueue(new TextEncoder().encode('漢'));controller.close()},cancel(){cancelled=true}});
 const request=new Request('https://example.com/api/backup',{method:'POST',body:stream,duplex:'half'});
 await assert.rejects(readBackupRequest(request,4),{message:BACKUP_SIZE_ERROR});
 assert.equal(cancelled,true);
});

test('public origin is accepted behind Render proxy without trusting forwarded headers',()=>{
 const publicOrigin='https://balthazar-rewards.onrender.com';
 const request=origin=>new Request('http://localhost:10000/api/auth',{headers:{origin,'x-forwarded-host':'evil.example','x-forwarded-proto':'https'}});
 assert.equal(isSameOrigin(request(publicOrigin),publicOrigin),true);
 assert.equal(isSameOrigin(request('https://evil.example'),publicOrigin),false);
 assert.equal(isSameOrigin(request('http://localhost:10000'),publicOrigin),false);
 assert.equal(isSameOrigin(request(publicOrigin),'invalid'),false);
 assert.equal(isSameOrigin(new Request('http://localhost:10000/api/auth',{headers:{origin:publicOrigin,'sec-fetch-site':'cross-site'}}),publicOrigin),false);
});

function memory(){const rows=new Map();return {read:async id=>structuredClone(rows.get(id)||null),insert:async(id,state)=>{if(!rows.has(id))rows.set(id,{state:structuredClone(state),revision:0})},cas:async(id,revision,state)=>{if(rows.get(id)?.revision!==revision)return false;rows.set(id,{state:structuredClone(state),revision:revision+1});return true}}}
test('concurrent commands preserve one winner and reject stale revision',async()=>{const repo=createRepository(memory());await repo.read('a');const results=await Promise.allSettled([repo.mutate('a',0,{id:'one',type:'energy',value:'alta'}),repo.mutate('a',0,{id:'two',type:'energy',value:'baja'})]);assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(results.find(x=>x.status==='rejected').reason.message,'CONFLICT')});
test('retried capture is idempotent and users stay isolated',async()=>{const repo=createRepository(memory());const command={id:'retry',type:'capture',tasks:[{title:'Preparar migración'}]};await repo.read('a');await repo.mutate('a',0,command);const replay=await repo.mutate('a',0,command);assert.equal(replay.state.tasks.length,1);assert.equal(replay.revision,1);assert.equal((await repo.read('b')).state.tasks.length,0)});
test('backup roundtrip preserves balances and pauses running timer',()=>{const state=fresh();state.points=123;state.focus={taskId:'t',started:Date.now()-5000,seconds:0,target:1500,kind:'normal'};state.tasks.push({id:'t',title:'Leer',description:'',area:'Personal',projectId:'',status:'EN_CURSO',created:Date.now(),due:'',estimated:25,actual:0,importance:3,difficulty:3,resistance:3,energy:'media',nextAction:'',steps:[],stepsDone:0,points:0,xp:0,dependency:''});const backup=createBackup(state);const restored=parseBackup(JSON.parse(JSON.stringify(backup)));assert.equal(restored.points,123);assert.equal(restored.focus.started,null);assert.ok(restored.focus.seconds>=5);assert.equal(state.focus.started===null,false)});
test('backup rejects unknown version, negative balance and broken references',()=>{const backup=createBackup(fresh());assert.throws(()=>parseBackup({...backup,version:99}));assert.throws(()=>parseBackup({...backup,state:{...backup.state,points:-1}}));assert.throws(()=>parseBackup({...backup,state:{...backup.state,focus:{taskId:'missing',started:null,seconds:0,target:1500,kind:'normal'}}}))});
test('import cannot overwrite existing progress and imported commands do not replay',async()=>{const repo=createRepository(memory());await repo.read('a');await repo.mutate('a',0,{id:'captured',type:'capture',tasks:[{title:'Existente'}]});await assert.rejects(repo.import('a',1,createBackup(fresh())),/EMPTY_REQUIRED/);const restored=await repo.import('b',0,createBackup(fresh()));assert.equal(restored.revision,1)});
test('access fails closed and cross-origin writes are refused',()=>{assert.equal(allowedEmail('Jorge@EXAMPLE.com','jorge@example.com'),true);assert.equal(allowedEmail('other@example.com','jorge@example.com'),false);assert.equal(allowedEmail('jorge@example.com',''),false);assert.equal(isSameOrigin(new Request('https://balthazar.example/api',{headers:{origin:'https://evil.example'}}),'https://balthazar.example'),false);assert.equal(isSameOrigin(new Request('https://balthazar.example/api',{headers:{origin:'https://balthazar.example'}}),'https://balthazar.example'),true)});
