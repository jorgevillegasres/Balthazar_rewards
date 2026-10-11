import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,apply,rollover,dayKey} from '../app/lib/domain.ts';
import {createBackup,parseBackup} from '../lib/backup.ts';
const now=Date.parse('2026-10-11T15:00:00Z');
const seed=()=>apply(fresh(now),{id:'seed',type:'capture',tasks:[{title:'Principal A'},{title:'Principal B'}]},now);
const command=(s,type,fields={},at=now)=>apply(s,{id:crypto.randomUUID(),type,...fields},at);

test('capture permits matching pending titles in separate families and rejects duplicates within a family',()=>{
 let s=seed();const [a,b]=s.tasks;
 s=command(s,'capture',{tasks:[{title:'Revisar',parentId:a.id},{title:'Revisár',parentId:b.id},{title:'Revisar'}]});
 assert.equal(s.tasks.length,5);
 for(const parentId of [a.id,b.id,''])assert.throws(()=>command(s,'capture',{tasks:[{title:'REVISAR',parentId}]}),/título/);
});
for(const type of ['resume','extend']){
 test(`${type} rejects a task dependency introduced during pause without changing the input`,()=>{
  let s=seed();const [a,b]=s.tasks;s=command(s,'start',{taskId:a.id});s=command(s,'pause',{},now+1000);
  s=command(s,'editTask',{taskId:a.id,title:a.title,dependency:b.id});const before=structuredClone(s);
  assert.throws(()=>command(s,type),/depende/);assert.deepEqual(s,before);
 });
 test(`${type} rechecks parent dependency after editing while child focus is paused`,()=>{
  let s=seed();const [a,b]=s.tasks;s=command(s,'capture',{tasks:[{title:'Revisar',parentId:a.id}]});
  s=command(s,'start',{taskId:s.tasks[2].id});s=command(s,'pause',{},now+1000);
  s=command(s,'editTask',{taskId:a.id,title:a.title,dependency:b.id});
  assert.throws(()=>command(s,type),/dependencia de la tarea principal/);
 });
 test(`${type} resumes a paused task after its new dependency is completed`,()=>{
  let s=seed();const [a,b]=s.tasks;s=command(s,'start',{taskId:a.id});s=command(s,'pause',{},now+1000);
  s=command(s,'editTask',{taskId:a.id,title:a.title,dependency:b.id});s=command(s,'complete',{taskId:b.id});
  assert.equal(command(s,type).focus.started,now);
 });
}
test('manual reward creation refuses the backup capacity but editing remains available',()=>{
 let s=seed();s.rewards=Array.from({length:2000},(_,i)=>({...s.rewards[0],id:`r${i}`}));const before=structuredClone(s);
 assert.throws(()=>command(s,'reward',{name:'Nueva',cost:1,category:'Personal'}),/recompensas/);assert.deepEqual(s,before);
 s=command(s,'reward',{rewardId:'r0',name:'Editada',cost:1,category:'Personal'});assert.equal(parseBackup(createBackup(s,now),now).rewards.length,2000);
});
test('redemption at capacity refuses to debit points or trim history',()=>{
 const s=seed();s.points=1000;s.redemptions=Array.from({length:20000},(_,i)=>({id:`r${i}`,name:'Café',cost:1,at:now}));const before=structuredClone(s);
 assert.throws(()=>command(s,'redeem',{rewardId:'coffee'}),/canjes/);assert.deepEqual(s,before);
});
test('finishing focus at session capacity refuses XP, timer changes and history loss',()=>{
 let s=seed();s=command(s,'start',{taskId:s.tasks[0].id});s.sessions=Array.from({length:50000},()=>({taskId:s.tasks[0].id,seconds:1,at:now,kind:'normal'}));const before=structuredClone(s);
 assert.throws(()=>command(s,'finishFocus',{},now+60000),/sesiones/);assert.deepEqual(s,before);
});
test('creating an area at capacity refuses while renaming preserves a restorable state',()=>{
 let s=fresh(now);s.areas=Array.from({length:100},(_,i)=>`Área ${i}`);
 assert.throws(()=>command(s,'area',{name:'Extra'}),/áreas/);
 s=command(s,'area',{oldName:'Área 0',name:'Renombrada'});assert.equal(parseBackup(createBackup(s,now),now).areas.length,100);
});
test('rollover refuses new day history beyond backup capacity before mutating the input',()=>{
 const s=fresh(now);const today=s.lastDay;s.days=Object.fromEntries(Array.from({length:10000},(_,i)=>[dayKey(now-i*86400000),structuredClone(s.days[today])]));const before=structuredClone(s);
 assert.throws(()=>rollover(s,now+86400000),/días/);assert.deepEqual(s,before);
});
test('backup roundtrip compares lastDay to the profile timezone with an injectable clock',()=>{
 const s=fresh(now);s.profile.timezone='Pacific/Kiritimati';rollover(s,now);assert.equal(s.lastDay,'2026-10-12');
 assert.equal(parseBackup(createBackup(s,now),now).lastDay,s.lastDay);
 const future=createBackup(s,now);future.state.lastDay='2026-10-13';future.state.days['2026-10-13']=structuredClone(s.days[s.lastDay]);assert.throws(()=>parseBackup(future,now),/fechas/);
});
test('the last reward, redemption and session accepted at each capacity remain importable',()=>{
 let s=seed();s.rewards=Array.from({length:1999},(_,i)=>({...s.rewards[0],id:`r${i}`}));
 s=command(s,'reward',{name:'Última recompensa',cost:1,category:'Personal'});
 s.redemptions=Array.from({length:19999},(_,i)=>({id:`redeemed${i}`,name:'Café',cost:1,at:now}));s.points=1;
 s=command(s,'redeem',{rewardId:s.rewards.at(-1).id});
 s.sessions=Array.from({length:49999},()=>({taskId:s.tasks[0].id,seconds:1,at:now,kind:'normal'}));
 s=command(s,'start',{taskId:s.tasks[0].id});s=command(s,'finishFocus',{},now+60000);
 const restored=parseBackup(createBackup(s,now+60000),now+60000);
 assert.equal(restored.rewards.length,2000);assert.equal(restored.redemptions.length,20000);assert.equal(restored.sessions.length,50000);assert.equal(restored.points,0);
});
test('rollover refuses auto-finish at session capacity before closing days or awarding XP',()=>{
 let s=seed();s=command(s,'start',{taskId:s.tasks[0].id});s.sessions=Array.from({length:50000},()=>({taskId:s.tasks[0].id,seconds:1,at:now,kind:'normal'}));const before=structuredClone(s);
 assert.throws(()=>rollover(s,now+86400000),/sesiones/);assert.deepEqual(s,before);
});
test('a paused focus restored from backup still rechecks newly edited dependencies',()=>{
 let s=seed();const [a,b]=s.tasks;s=command(s,'start',{taskId:a.id});s=command(s,'pause',{},now+1000);
 s=command(s,'editTask',{taskId:a.id,title:a.title,dependency:b.id});s=parseBackup(createBackup(s,now),now);
 assert.throws(()=>command(s,'resume'),/depende/);assert.throws(()=>command(s,'extend'),/depende/);
});
