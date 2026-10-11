import {z} from 'zod';
import type {State,Command} from '../app/lib/domain.ts';
const id=z.string().min(1).max(100), ref=z.string().max(100), n=z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const status=z.enum(['INBOX','PLANIFICADA','HOY','EN_CURSO','PAUSADA','BLOQUEADA','COMPLETADA','CANCELADA','ARCHIVADA']);
const snapshot=z.object({supportVersion:n.optional(),id,title:z.string().max(160),description:z.string().max(1000),area:z.string().max(80),projectId:ref,parentId:ref.optional(),status,created:n,due:z.string().max(10),estimated:n.max(480),actual:n.max(10080),importance:n.max(5),difficulty:n.max(5),resistance:n.max(5),energy:z.enum(['alta','media','baja']),nextAction:z.string().max(300),steps:z.array(z.string().max(300)).max(50),stepsDone:n.max(50),completed:n.optional(),points:n,xp:n,dependency:ref,supportLinks:z.array(z.object({id,name:z.string().max(160),url:z.string().max(2000)}).strict()).max(20).optional()}).strict();
const planTask=z.object({id,before:status,after:status,actual:n,stepsDone:n,completed:n.optional(),points:n,xp:n,sessions:n}).strict();
const receipt=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('capture'),tasks:z.array(snapshot).min(1).max(10)}).strict(),
 z.object({kind:z.literal('assistDay'),day:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),before:z.array(ref).max(3),after:z.array(ref).max(3),tasks:z.array(planTask).max(6)}).strict(),
 z.object({kind:z.literal('linkPurpose'),projectId:id,before:ref,after:ref}).strict()
]);
export const activitySchema=z.object({id,source:z.enum(['text','voice']),tool:z.enum(['capture','assistDay','linkPurpose']),at:n,inputRevision:n.optional(),status:z.enum(['executed','undone']),summary:z.string().trim().min(1).max(300),receipt,undoneAt:n.optional()}).strict().superRefine((v,c)=>{if(v.tool!==v.receipt.kind||((v.status==='undone')!==(v.undoneAt!==undefined))||(v.undoneAt!==undefined&&v.undoneAt<v.at))c.addIssue({code:z.ZodIssueCode.custom,message:'Comprobante inválido.'})});
export type Activity=z.infer<typeof activitySchema>;
type WithActivity=State&{activity?:Activity[];purposes?:{id:string}[]};
const stable=(v:unknown):unknown=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,x])=>[k,stable(x)])):v;
const same=(a:unknown,b:unknown)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
const conflict=()=>{throw Error('No se puede deshacer: hay cambios, avance o relaciones posteriores. Abre el elemento para revisarlo.');};
const recordId=(s:State,value:string)=>{s.applied=[...s.applied.filter(x=>x!==value),value].slice(-200)};
export function applyActivity(input:State,a:Command,now:number,execute:(s:State,c:Command,now:number)=>State):State|null{
 if(a.type!=='baltaAction'&&a.type!=='undoBalta')return null;
 if(!id.safeParse(a.id).success||!n.safeParse(now).success)throw Error('Identificador o fecha inválidos.');
 const s=structuredClone(input) as WithActivity;
 if(s.applied.includes(a.id))return s;
 if(a.type==='baltaAction'){
  const operationId=id.parse(a.operationId??a.id);
  if(s.activity?.some(x=>x.id===operationId)){recordId(s,a.id);return s;}
  const source=z.enum(['text','voice']).parse(a.source),summary=z.string().trim().min(1).max(300).parse(a.summary),inputRevision=n.optional().parse(a.inputRevision);
  if(!a.command||typeof a.command!=='object'||Array.isArray(a.command))throw Error('Acción de Balta inválida.');
  const command=a.command as Command,tool=z.enum(['capture','assistDay','linkPurpose']).parse(command.type);
  if(tool==='capture'&&(!Array.isArray(command.tasks)||command.tasks.length>10))throw Error('Balta puede crear hasta diez tareas.');
  const nestedId=crypto.randomUUID();
  const after=execute(s,{...command,id:nestedId},now) as WithActivity;
  let r:Activity['receipt'];
  if(tool==='capture'){
   const old=new Set(s.tasks.map(t=>t.id));r={kind:tool,tasks:after.tasks.filter(t=>!old.has(t.id)).map(t=>structuredClone(t))};
  }else if(tool==='assistDay'){
   const before=s.days[s.lastDay].missions,missions=after.days[s.lastDay].missions,affected=new Set([...before,...missions].filter(Boolean));
   r={kind:tool,day:s.lastDay,before:[...before],after:[...missions],tasks:s.tasks.filter(t=>affected.has(t.id)).map(t=>({id:t.id,before:t.status,after:after.tasks.find(x=>x.id===t.id)!.status,actual:t.actual,stepsDone:t.stepsDone,completed:t.completed,points:t.points,xp:t.xp,sessions:s.sessions.filter(x=>x.taskId===t.id).length}))};
  }else{
   const project=s.projects.find(p=>p.id===command.projectId) as (State['projects'][number]&{purposeId?:string})|undefined;
   const changed=after.projects.find(p=>p.id===command.projectId) as typeof project;
   if(!project||!changed)throw Error('El proyecto no existe.');
   r={kind:tool,projectId:project.id,before:project.purposeId||'',after:changed.purposeId||''};
  }
  const event=activitySchema.parse({id:operationId,source,tool,summary,inputRevision,at:now,status:'executed',receipt:r});
  after.activity=[...(after.activity||[]),event].slice(-200);recordId(after,a.id);return after;
 }
 const operationId=id.parse(a.operationId),event=s.activity?.find(x=>x.id===operationId);
 if(!event)throw Error('Esta operación ya no tiene un comprobante disponible.');
 if(event.status==='undone'){recordId(s,a.id);return s;}
 if(now<event.at)throw Error('Fecha de reversión inválida.');
 const r=activitySchema.parse(event).receipt;
 const validTask=(value:string)=>!value||s.tasks.some(t=>t.id===value);
 const distinct=(values:string[])=>new Set(values.filter(Boolean)).size===values.filter(Boolean).length;
 if(r.kind==='capture'){
  if(!distinct(r.tasks.map(t=>t.id))||r.tasks.some(t=>!validTask(t.id)||!validTask(t.parentId||'')||!validTask(t.dependency)||(t.projectId&&!s.projects.some(p=>p.id===t.projectId))))conflict();
 }else if(r.kind==='assistDay'){
  const refs=new Set([...r.before,...r.after].filter(Boolean));
  if(!s.days[r.day]||!distinct(r.before)||!distinct(r.after)||!distinct(r.tasks.map(t=>t.id))||[...refs].some(value=>!validTask(value))||r.tasks.length!==refs.size||r.tasks.some(t=>!refs.has(t.id))||r.tasks.some(t=>t.completed&&(r.before.indexOf(t.id)!==r.after.indexOf(t.id)||t.before!==t.after)))conflict();
 }else if(!s.projects.some(p=>p.id===r.projectId)||[r.before,r.after].some(value=>value&&!s.purposes?.some(p=>p.id===value)))conflict();
 if(r.kind==='capture'){
  for(const expected of r.tasks){const task=s.tasks.find(t=>t.id===expected.id);if(!task||!same(task,expected)||task.completed||task.actual||task.stepsDone||task.points||task.xp||task.supportLinks?.length||s.focus?.taskId===task.id||s.sessions.some(x=>x.taskId===task.id)||s.tasks.some(x=>x.parentId===task.id||x.dependency===task.id)||Object.values(s.days).some(d=>d.missions.includes(task.id)||d.done.includes(task.id)))conflict();}
  for(const expected of r.tasks)s.tasks.find(t=>t.id===expected.id)!.status='ARCHIVADA';
 }else if(r.kind==='assistDay'){
  const day=s.days[r.day];if(s.focus||s.lastDay!==r.day||!day||!same(day.missions,r.after))conflict();
  for(const expected of r.tasks){const task=s.tasks.find(t=>t.id===expected.id);if(!task||task.status!==expected.after||task.actual!==expected.actual||task.stepsDone!==expected.stepsDone||task.completed!==expected.completed||task.points!==expected.points||task.xp!==expected.xp||s.sessions.filter(x=>x.taskId===expected.id).length!==expected.sessions)conflict();}
  day.missions=[...r.before];for(const expected of r.tasks)s.tasks.find(t=>t.id===expected.id)!.status=expected.before;
 }else{
  const project=s.projects.find(p=>p.id===r.projectId) as (State['projects'][number]&{purposeId?:string})|undefined;
  if(!project||(project.purposeId||'')!==r.after||(r.before&&!s.purposes?.some(p=>p.id===r.before)))conflict();
  if(r.before)project!.purposeId=r.before;else delete project!.purposeId;
 }
 event.status='undone';event.undoneAt=now;recordId(s,a.id);return s;
}
