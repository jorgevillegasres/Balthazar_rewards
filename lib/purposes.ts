import {dayKey,priority,type State,type Task,type Command} from '../app/lib/domain.ts';

export type PurposeStatus='active'|'archived';
export interface Purpose{id:string;title:string;area:string;description:string;due:string;status:PurposeStatus}
const excluded=['COMPLETADA','CANCELADA','ARCHIVADA'];
const active=(t:Task)=>!t.completed&&!excluded.includes(t.status);
function text(value:unknown,max:number,required=false){
 if(value===undefined&&!required)return '';
 if(typeof value!=='string')throw Error('Escribe un texto válido.');
 const result=value.trim();
 if((required&&!result)||result.length>max)throw Error('Revisa el texto: máximo '+max+' caracteres.');
 return result;
}
export function validPurposeDate(value:unknown){
 const due=text(value,10);
 if(due){const parsed=new Date(due);if(!/^\d{4}-\d{2}-\d{2}$/.test(due)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==due)throw Error('Revisa la fecha objetivo.');}
 return due;
}
export function applyPurpose(s:State,a:Command){
 s.purposes??=[];
 const id=text(a.purposeId,100),old=id?s.purposes.find(p=>p.id===id):undefined;
 if(id&&!old)throw Error('El propósito no existe.');
 if(!old&&s.purposes.length>=100)throw Error('Máximo 100 propósitos.');
 const value={...old,...a};
 const area=text(value.area,60,true);
 if(!s.areas.includes(area))throw Error('Elige un área existente.');
 const status=value.status??'active';
 if(status!=='active'&&status!=='archived')throw Error('Estado del propósito inválido.');
 const fields={title:text(value.title,160,true),area,description:text(value.description,1000),due:validPurposeDate(value.due),status:status as PurposeStatus};
 if(old)Object.assign(old,fields);else s.purposes.push({id:crypto.randomUUID(),...fields});
}
export function linkPurpose(s:State,a:Command){
 const projectId=text(a.projectId,100,true),purposeId=text(a.purposeId,100);
 const project=s.projects.find(p=>p.id===projectId);
 if(!project)throw Error('El proyecto no existe.');
 if(purposeId&&!s.purposes?.some(p=>p.id===purposeId))throw Error('El propósito no existe.');
 if(purposeId)project.purposeId=purposeId;else delete project.purposeId;
}
export interface AttentionItem{task:Task;reasons:string[]}
export function attention(s:State,now=Date.now()):AttentionItem[]{
 const today=dayKey(now,s.profile.timezone);
 return s.tasks.filter(t=>!t.parentId&&active(t)).map(task=>{
  const reasons:string[]=[];
  if(task.due&&task.due<today)reasons.push('Vencida');
  if(task.status==='BLOQUEADA'||(task.dependency&&!s.tasks.some(t=>t.id===task.dependency&&(t.completed||t.status==='COMPLETADA'))))reasons.push('Bloqueada');
  if(task.status==='INBOX')reasons.push('Por organizar');
  return {task,reasons};
 }).filter(row=>row.reasons.length).sort((a,b)=>priority(b.task,s,now)-priority(a.task,s,now));
}
export function purposeMetrics(s:State,purposeId:string){
 const projects=s.projects.filter(p=>p.purposeId===purposeId),ids=new Set(projects.map(p=>p.id));
 const tasks=s.tasks.filter(t=>!t.parentId&&ids.has(t.projectId)&&!['CANCELADA','ARCHIVADA'].includes(t.status));
 const completed=tasks.filter(t=>t.completed||t.status==='COMPLETADA').length;
 return {projects,tasks,completed,active:tasks.length-completed,total:tasks.length,percent:tasks.length?Math.round(completed/tasks.length*100):0};
}
