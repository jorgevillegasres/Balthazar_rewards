import test from 'node:test';
import assert from 'node:assert/strict';
import {overviewGroups,missionBlocked} from '../lib/mission-overview.ts';
const task=(id,extra={})=>({id,title:id,status:'PLANEADA',completed:0,parentId:'',projectId:'',area:'Personal',created:1,dependency:'',...extra});
const fixture=()=>({tasks:[task('p1',{projectId:'a'}),task('p2',{projectId:'b'}),task('inbox',{status:'INBOX'}),task('blocked',{dependency:'p1'}),task('done',{completed:1,status:'COMPLETADA'}),task('archived',{status:'ARCHIVADA'}),task('child',{parentId:'p1',projectId:'a'}),task('hidden-child',{parentId:'archived'})],projects:[]});
const ids=groups=>groups.flatMap(g=>g.tasks.map(t=>t.id));
test('overview unites pending roots across projects and excludes closed tasks',()=>{
 const s=fixture(),before=JSON.stringify(s),g=overviewGroups(s,{});
 assert.deepEqual(ids(g),['p1','p2','blocked','inbox']);
 assert.deepEqual(g.map(x=>x.name),['Disponibles','Bloqueadas','Por organizar']);
 assert.equal(JSON.stringify(s),before);
});
test('subtasks are optional and exclude closed or missing families',()=>{
 const s=fixture();s.tasks.push(task('orphan',{parentId:'missing'}),task('completed-child',{parentId:'p1',completed:1}));
 assert.deepEqual(ids(overviewGroups(s,{showSubtasks:true})),['p1','p2','child','blocked','inbox']);
});
test('own and inherited dependencies block until their prerequisite is completed',()=>{
 const s=fixture();s.tasks.find(t=>t.id==='p1').dependency='p2';
 assert.equal(missionBlocked(s,s.tasks.find(t=>t.id==='child')),true);
 s.tasks.find(t=>t.id==='p2').completed=1;
 assert.equal(missionBlocked(s,s.tasks.find(t=>t.id==='child')),false);
 s.tasks.find(t=>t.id==='p1').status='BLOQUEADA';
 assert.equal(missionBlocked(s,s.tasks.find(t=>t.id==='child')),true);
});
test('search finds child and parent context; area filter is respected',()=>{
 const s=fixture();s.tasks.find(t=>t.id==='p2').area='Trabajo';
 assert.deepEqual(ids(overviewGroups(s,{query:'child'})),['p1']);
 assert.deepEqual(ids(overviewGroups(s,{query:'p1',showSubtasks:true})),['p1','child']);
 assert.deepEqual(ids(overviewGroups(s,{area:'Trabajo'})),['p2']);
 assert.deepEqual(ids(overviewGroups(s,{query:'nothing'})),[]);
});
