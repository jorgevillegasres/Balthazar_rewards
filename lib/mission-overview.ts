import type {State,Task} from '../app/lib/domain.ts';

const closed=(t:Task)=>!!t.completed||['COMPLETADA','ARCHIVADA','CANCELADA'].includes(t.status);
export function missionBlocked(s:State,t:Task){
 const parent=t.parentId?s.tasks.find(p=>p.id===t.parentId):undefined;
 return [t,parent].some(item=>item&&(item.status==='BLOQUEADA'||!!item.dependency&&!s.tasks.some(d=>d.id===item.dependency&&d.completed)));
}
export function overviewGroups(s:State,{showSubtasks=false,query='',area='Todas'}:{showSubtasks?:boolean;query?:string;area?:string}){
 const needle=query.trim().toLocaleLowerCase('es');
 const tasks=s.tasks.filter(t=>{
  if(closed(t)||area!=='Todas'&&t.area!==area)return false;
  const parent=t.parentId?s.tasks.find(p=>p.id===t.parentId):undefined;
  if(t.parentId&&(!showSubtasks||!parent||closed(parent)))return false;
  const titles=[t.title,parent?.title||'',...(!t.parentId?s.tasks.filter(c=>c.parentId===t.id&&!closed(c)).map(c=>c.title):[])];
  return !needle||titles.some(title=>title.toLocaleLowerCase('es').includes(needle));
 }).sort((a,b)=>b.created-a.created);
 const bucket=(t:Task)=>missionBlocked(s,t)?'blocked':t.status==='INBOX'?'inbox':'available';
 return [{id:'available',name:'Disponibles'},{id:'blocked',name:'Bloqueadas'},{id:'inbox',name:'Por organizar'}].map(g=>({...g,tasks:tasks.filter(t=>bucket(t)===g.id)})).filter(g=>g.tasks.length);
}
