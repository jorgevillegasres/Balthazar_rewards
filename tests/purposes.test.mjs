import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,apply,rollover} from '../app/lib/domain.ts';
const now=Date.parse('2026-10-10T17:00:00Z');
const act=(s,a)=>apply(s,{id:crypto.randomUUID(),...a},now);
const purpose=(s,extra={})=>act(s,{type:'purpose',title:'Terminar mi tesis',area:'Maestría',description:'Entregar el documento',...extra});
const project=s=>act(s,{type:'project',name:'Documento',area:'Maestría'});

test('old states normalize purposes idempotently without changing progress',()=>{
 const s=fresh(now);delete s.purposes;s.points=400;s.xp=700;const old=structuredClone(s);
 const normalized=rollover(structuredClone(s),now);
 assert.deepEqual(normalized.purposes,[]);assert.equal(normalized.points,400);assert.equal(normalized.xp,700);
 assert.deepEqual(rollover(structuredClone(normalized),now),normalized);assert.deepEqual(s,old);
});
test('purpose creation and edit preserve identity and economy',()=>{
 const before=fresh(now);const s=purpose(before,{due:'2026-12-01'}),p=s.purposes[0];
 assert.equal(p.status,'active');assert.equal(p.due,'2026-12-01');assert.equal(before.purposes?.length||0,0);
 const edited=purpose(s,{purposeId:p.id,title:'Entregar tesis'});
 assert.equal(edited.purposes.length,1);assert.equal(edited.purposes[0].id,p.id);assert.equal(edited.purposes[0].title,'Entregar tesis');
 assert.equal(edited.points,before.points);assert.equal(edited.xp,before.xp);assert.deepEqual(edited.rewards,before.rewards);
});
test('purpose validates dates, existing areas, text and collection limits atomically',()=>{
 const s=fresh(now);
 for(const extra of [{title:''},{title:'a'.repeat(161)},{description:'a'.repeat(1001)},{area:'Unknown'},{due:'2026-02-30'},{due:'abc'},{status:'complete'},{purposeId:'missing'}])assert.throws(()=>purpose(s,extra));
 let full=s;for(let i=0;i<100;i++)full=purpose(full,{title:'Propósito '+i});
 assert.throws(()=>purpose(full),/100/);assert.equal(full.purposes.length,100);
 assert.equal(purpose(full,{purposeId:full.purposes[0].id,title:'Editar al límite'}).purposes.length,100);
});
test('project links validate references and archive has no cascade',()=>{
 let s=project(purpose(fresh(now)));s=act(s,{type:'capture',tasks:[{title:'Redactar',projectId:s.projects[0].id}]});
 const p=s.purposes[0],pr=s.projects[0],tasks=structuredClone(s.tasks);
 s=act(s,{type:'linkPurpose',projectId:pr.id,purposeId:p.id});assert.equal(s.projects[0].purposeId,p.id);
 assert.throws(()=>act(s,{type:'linkPurpose',projectId:'missing',purposeId:p.id}));
 assert.throws(()=>act(s,{type:'linkPurpose',projectId:pr.id,purposeId:'missing'}));
 s=act(s,{type:'purpose',purposeId:p.id,status:'archived'});assert.equal(s.purposes[0].status,'archived');
 assert.equal(s.projects[0].purposeId,p.id);assert.deepEqual(s.tasks,tasks);
 s=act(s,{type:'purpose',purposeId:p.id,status:'active'});assert.equal(s.purposes[0].status,'active');
 s=act(s,{type:'linkPurpose',projectId:pr.id,purposeId:''});assert.equal(s.projects[0].purposeId,undefined);
});
test('renaming an area also updates purposes',()=>{
 const s=act(purpose(fresh(now)),{type:'area',oldName:'Maestría',name:'Investigación'});
 assert.equal(s.purposes[0].area,'Investigación');
});
test('attention selects main pending tasks once and recognizes dependency blocks',async()=>{
 const {attention}=await import('../lib/purposes.ts');
 let s=act(fresh(now),{type:'capture',tasks:[{title:'Vencida',due:'2026-10-09'},{title:'Hoy',due:'2026-10-10'},{title:'Bloqueada'},{title:'Terminada'}]});
 const [overdue,today,blocked,done]=s.tasks;overdue.status='BLOQUEADA';today.status='PLANIFICADA';blocked.status='PLANIFICADA';blocked.dependency=overdue.id;done.status='COMPLETADA';done.completed=now;
 s.tasks.push({...overdue,id:'child',parentId:overdue.id},{...overdue,id:'cancelled',status:'CANCELADA'},{...overdue,id:'archived',status:'ARCHIVADA'});
 const snapshot=structuredClone(s),rows=attention(s,now);
 assert.deepEqual(rows.map(r=>r.task.id).sort(),[overdue.id,blocked.id].sort());
 assert.deepEqual(rows.find(r=>r.task.id===overdue.id).reasons,['Vencida','Bloqueada']);assert.deepEqual(s,snapshot);
});
test('purpose metrics count only main active and completed tasks across linked projects',async()=>{
 const {purposeMetrics}=await import('../lib/purposes.ts');
 let s=project(purpose(fresh(now)));s=act(s,{type:'linkPurpose',projectId:s.projects[0].id,purposeId:s.purposes[0].id});
 s=act(s,{type:'capture',tasks:[{title:'Principal',projectId:s.projects[0].id},{title:'Resultado',projectId:s.projects[0].id}]});
 const [main,done]=s.tasks;done.status='COMPLETADA';done.completed=now;
 s.tasks.push({...main,id:'child',parentId:main.id},{...main,id:'cancelled',status:'CANCELADA'},{...main,id:'archived',status:'ARCHIVADA'},{...main,id:'outside',projectId:''});
 const snapshot=structuredClone(s),m=purposeMetrics(s,s.purposes[0].id);
 assert.equal(m.projects.length,1);assert.equal(m.completed,1);assert.equal(m.active,1);assert.equal(m.total,2);assert.equal(m.percent,50);assert.deepEqual(s,snapshot);
 assert.equal(purposeMetrics(s,'none').total,0);
});
