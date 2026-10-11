import test from 'node:test';
import assert from 'node:assert/strict';
import {mobileItems,secondaryPages,missionView} from '../lib/navigation.ts';
test('mobile navigation exposes five stable controls',()=>assert.deepEqual(mobileItems,['Hoy','Misiones','Balta','Rutinas','Más']));
test('More preserves secondary destinations',()=>assert.deepEqual(secondaryPages,['Proyectos','Propósitos','Recompensas','Actividad','Perfil']));
test('project entry initializes its grid and retains selected project context',()=>{assert.deepEqual(missionView('Proyectos',''),{initialTab:'Proyectos',initialProject:''});assert.deepEqual(missionView('Proyectos','p1'),{initialTab:'Proyectos',initialProject:'p1'});assert.deepEqual(missionView('Misiones','p1'),{initialTab:'Activas',initialProject:'p1'});});
import {navigateTo} from '../lib/navigation.ts';
test('reselecting the current section retains project context; another section clears it',()=>{
 assert.deepEqual(navigateTo({page:'Proyectos',project:'p1'},'Proyectos'),{page:'Proyectos',project:'p1'});
 assert.deepEqual(navigateTo({page:'Proyectos',project:'p1'},'Misiones'),{page:'Misiones',project:''});
});
