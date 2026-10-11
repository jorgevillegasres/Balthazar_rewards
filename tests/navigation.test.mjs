import test from 'node:test';
import assert from 'node:assert/strict';
import {mobileItems,secondaryPages,missionView} from '../lib/navigation.ts';
test('mobile navigation exposes five stable controls',()=>assert.deepEqual(mobileItems,['Hoy','Misiones','Balta','Rutinas','Más']));
test('More preserves secondary destinations',()=>assert.deepEqual(secondaryPages,['Proyectos','Propósitos','Recompensas','Actividad','Perfil']));
test('project entry initializes its grid and retains selected project context',()=>{assert.deepEqual(missionView('Proyectos',''),{initialTab:'Proyectos',initialProject:''});assert.deepEqual(missionView('Proyectos','p1'),{initialTab:'Proyectos',initialProject:'p1'});assert.deepEqual(missionView('Misiones','p1'),{initialTab:'Vista general',initialProject:'p1'});});
import {navigateTo} from '../lib/navigation.ts';
import {captureProject,missionFiltersFor,createDialogFocusReturn} from '../lib/ui-state.ts';
test('mission filters survive view remount and remain independent per page',()=>{
 const saved={tab:'Inbox',search:'contrato',area:'Trabajo',showSubtasks:true};
 const state={owner:'account-a',views:{Misiones:saved}};
 assert.deepEqual(missionFiltersFor(state,'account-a','Misiones'),saved);
 assert.deepEqual(missionFiltersFor(state,'account-a','Proyectos'),{tab:'Proyectos',search:'',area:'Todas',showSubtasks:false});
});
test('mission filters never cross account boundaries',()=>{
 const state={owner:'account-a',views:{Misiones:{tab:'Inbox',search:'privado',area:'Trabajo',showSubtasks:true}}};
 assert.deepEqual(missionFiltersFor(state,'account-b','Misiones'),{tab:'Vista general',search:'',area:'Todas',showSubtasks:false});
});
test('a chained dialog returns to its external opener after the whole flow closes',()=>{
 const events=[],opener={isConnected:true,focus:()=>events.push('external')},focus=createDialogFocusReturn();
 const first=focus.enter(opener),firstCleanup=focus.leave(first);
 const second=focus.enter(null);firstCleanup();assert.deepEqual(events,[]);
 focus.leave(second)();assert.deepEqual(events,['external']);
});
test('dialog cleanup respects a navigation focus destination and disconnected openers',()=>{
 const events=[],target={isConnected:true,focus:()=>events.push('external')},focus=createDialogFocusReturn();
 focus.leave(focus.enter(target))(false);assert.deepEqual(events,[]);
 target.isConnected=false;focus.leave(focus.enter(target))();assert.deepEqual(events,[]);
});
test('a removed dialog opener falls back to a stable page destination',()=>{
 const events=[],opener={isConnected:false,focus:()=>events.push('removed')},fallback={isConnected:true,focus:()=>events.push('heading')},focus=createDialogFocusReturn();
 focus.leave(focus.enter(opener))(true,fallback);assert.deepEqual(events,['heading']);
});
test('capture honors explicitly selecting no project from a project context',()=>{
 const form=new FormData();form.set('projectId','');
 assert.equal(captureProject(form,'p1'),'');
});
test('capture only falls back when the project field is absent',()=>{
 assert.equal(captureProject(new FormData(),'p1'),'p1');
 const form=new FormData();form.set('projectId','p2');assert.equal(captureProject(form,'p1'),'p2');
});
test('reselecting the current section retains project context; another section clears it',()=>{
 assert.deepEqual(navigateTo({page:'Proyectos',project:'p1'},'Proyectos'),{page:'Proyectos',project:'p1'});
 assert.deepEqual(navigateTo({page:'Proyectos',project:'p1'},'Misiones'),{page:'Misiones',project:''});
});
