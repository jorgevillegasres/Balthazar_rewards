import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,apply,available} from '../app/lib/domain.ts';
import {createBackup,parseBackup} from '../lib/backup.ts';
const setup=()=>apply(fresh(),{id:'seed',type:'capture',tasks:[{title:'Preparar clase'},{title:'Preparar ejercicios'}]});
test('conversion preserves identity and sessions, inherits project and removes child from daily selection',()=>{
 let s=setup();s=apply(s,{id:'project',type:'project',name:'Curso',area:'Docencia'});s.tasks[0].projectId=s.projects[0].id;s.tasks[0].area='Docencia';const [parent,child]=s.tasks;s.sessions.push({taskId:child.id,seconds:60,at:Date.now(),kind:'normal'});
 s=apply(s,{id:'convert',type:'reparent',taskId:child.id,parentId:parent.id});assert.equal(s.tasks[1].parentId,parent.id);assert.equal(s.tasks[1].area,'Docencia');assert.equal(s.tasks[1].projectId,s.projects[0].id);assert.equal(s.sessions[0].taskId,child.id);s.tasks[1].status='PLANIFICADA';assert.equal(available(s.tasks[1],s),false);
});
test('children complete without mission points or daily victories and parent requires explicit confirmation',()=>{
 let s=setup();const [p,c]=s.tasks;s=apply(s,{id:'convert',type:'reparent',taskId:c.id,parentId:p.id});assert.throws(()=>apply(s,{id:'early',type:'complete',taskId:p.id,resultConfirmed:true}));
 s=apply(s,{id:'child-done',type:'complete',taskId:c.id});assert.equal(s.points,0);assert.equal(s.xp,0);assert.equal(s.days[s.lastDay].done.length,0);assert.ok(!s.tasks[0].completed);
 assert.throws(()=>apply(s,{id:'no-confirm',type:'complete',taskId:p.id}));s=apply(s,{id:'parent-done',type:'complete',taskId:p.id,resultConfirmed:true});assert.ok(s.points>0);const points=s.points;s=apply(s,{id:'again',type:'complete',taskId:p.id,resultConfirmed:true});assert.equal(s.points,points);
});
test('conversion rejects cycles, additional levels, completed history and active focus',()=>{
 let s=setup();const [p,c]=s.tasks;s=apply(s,{id:'convert',type:'reparent',taskId:c.id,parentId:p.id});assert.throws(()=>apply(s,{id:'cycle',type:'reparent',taskId:p.id,parentId:c.id}));assert.throws(()=>apply(s,{id:'self',type:'reparent',taskId:p.id,parentId:p.id}));
 s=apply(s,{id:'focus',type:'start',taskId:c.id});assert.throws(()=>apply(s,{id:'detach',type:'reparent',taskId:c.id,parentId:''}));
 let completed=setup();completed=apply(completed,{id:'done',type:'complete',taskId:completed.tasks[1].id});assert.throws(()=>apply(completed,{id:'history',type:'reparent',taskId:completed.tasks[1].id,parentId:completed.tasks[0].id}));
});
test('new children inherit parent fields and remain in its group when edited',()=>{
 let s=setup();const p=s.tasks[0];s=apply(s,{id:'new-child',type:'capture',tasks:[{title:'Ensayar',parentId:p.id,area:'Trabajo'}]});const c=s.tasks[2];assert.equal(c.parentId,p.id);assert.equal(c.area,p.area);
 s=apply(s,{id:'edit-child',type:'editTask',taskId:c.id,title:c.title,area:'Trabajo',minutes:10});assert.equal(s.tasks[2].area,p.area);
});
test('parent cannot wait on its child and closing a child does not complete legacy steps implicitly',()=>{
 let s=setup();const [p,c]=s.tasks;s=apply(s,{id:'convert',type:'reparent',taskId:c.id,parentId:p.id});assert.throws(()=>apply(s,{id:'dependency',type:'editTask',taskId:p.id,title:p.title,dependency:c.id}));
 s.tasks[1].steps=['Revisar'];assert.throws(()=>apply(s,{id:'unfinished',type:'complete',taskId:c.id}));s=apply(s,{id:'step',type:'step',taskId:c.id});s=apply(s,{id:'done',type:'complete',taskId:c.id});assert.ok(s.tasks[1].completed);
});
test('backup preserves hierarchy and links and rejects invalid parents',()=>{
 let s=setup();s=apply(s,{id:'convert',type:'reparent',taskId:s.tasks[1].id,parentId:s.tasks[0].id});s=apply(s,{id:'link',type:'supportLink',taskId:s.tasks[0].id,name:'Clase',url:'https://example.com/clase'});const restored=parseBackup(createBackup(s));assert.equal(restored.tasks[1].parentId,s.tasks[0].id);assert.equal(restored.tasks[0].supportLinks[0].url,'https://example.com/clase');
 const broken=createBackup(s);broken.state.tasks[1].parentId='missing';assert.throws(()=>parseBackup(broken));const loop=createBackup(s);loop.state.tasks[0].parentId=s.tasks[1].id;assert.throws(()=>parseBackup(loop));
});
test('support links allow only web URLs and can be added to completed tasks',()=>{let s=setup();const id=s.tasks[0].id;assert.throws(()=>apply(s,{id:'bad-link',type:'supportLink',taskId:id,name:'Bad',url:'javascript:alert(1)'}));s=apply(s,{id:'done',type:'complete',taskId:id});s=apply(s,{id:'link',type:'supportLink',taskId:id,name:'Documento',url:'https://example.com'});assert.equal(s.tasks[0].supportLinks.length,1);});
test('subtask checks can be corrected until parent result is confirmed',()=>{
 let s=setup();const [p,c]=s.tasks;s=apply(s,{id:'convert',type:'reparent',taskId:c.id,parentId:p.id});s=apply(s,{id:'done',type:'complete',taskId:c.id});s=apply(s,{id:'undo',type:'reopenSubtask',taskId:c.id});assert.equal(s.tasks[1].completed,undefined);assert.equal(s.points,0);s=apply(s,{id:'done-again',type:'complete',taskId:c.id});s=apply(s,{id:'parent',type:'complete',taskId:p.id,resultConfirmed:true});assert.throws(()=>apply(s,{id:'undo-closed',type:'reopenSubtask',taskId:c.id}));
});
test('conversion keeps past daily assignments intact',()=>{let s=setup();const [p,c]=s.tasks;s.days['2026-01-01']={...s.days[s.lastDay],missions:[c.id,'','']};s=apply(s,{id:'convert',type:'reparent',taskId:c.id,parentId:p.id});assert.equal(s.days['2026-01-01'].missions[0],c.id);});
test('archived children do not bypass explicit result confirmation',()=>{let s=setup();const [p,c]=s.tasks;s=apply(s,{id:'convert',type:'reparent',taskId:c.id,parentId:p.id});s=apply(s,{id:'archive',type:'status',taskId:c.id,status:'ARCHIVADA'});assert.throws(()=>apply(s,{id:'no-confirm',type:'complete',taskId:p.id}));});
test('focused families cannot be restructured and archiving parent stops child focus',()=>{
 let s=setup();const [p,c]=s.tasks;s=apply(s,{id:'convert',type:'reparent',taskId:c.id,parentId:p.id});s=apply(s,{id:'focus-parent',type:'start',taskId:p.id});assert.throws(()=>apply(s,{id:'new-child',type:'capture',tasks:[{title:'Otra acción',parentId:p.id}]}));assert.throws(()=>apply(s,{id:'detach',type:'reparent',taskId:c.id,parentId:''}));
 s=apply(s,{id:'finish',type:'finishFocus'});s=apply(s,{id:'focus-child',type:'start',taskId:c.id});s=apply(s,{id:'archive-parent',type:'status',taskId:p.id,status:'ARCHIVADA'});assert.equal(s.focus,null);
});
