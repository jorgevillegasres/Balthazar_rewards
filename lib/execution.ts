import {activeChildren,childrenOf,priority,type State,type Task} from '../app/lib/domain.ts';

export function canStartTask(s:State,t:Task){
 if(t.completed||['COMPLETADA','EN_CURSO','ARCHIVADA','CANCELADA','BLOQUEADA'].includes(t.status))return false;
 if(t.dependency&&!s.tasks.some(d=>d.id===t.dependency&&d.completed))return false;
 if(t.parentId){const parent=s.tasks.find(p=>p.id===t.parentId);if(!parent||parent.completed||['COMPLETADA','ARCHIVADA','CANCELADA','BLOQUEADA'].includes(parent.status))return false;if(parent.dependency&&!s.tasks.some(d=>d.id===parent.dependency&&d.completed))return false;}
 return true;
}
export const inboxCount=(s:State)=>s.tasks.filter(t=>!t.parentId&&t.status==='INBOX').length;
export function execution(s:State,t:Task){
 const children=activeChildren(s,t.id),done=children.filter(c=>c.completed).length;
 const hasChildren=childrenOf(s,t.id).length>0,unfinishedSteps=t.stepsDone<t.steps.length;
 const actionable=canStartTask(s,t),ready=actionable&&hasChildren&&!unfinishedSteps&&done===children.length;
 const options=!actionable||ready?[]:hasChildren&&!unfinishedSteps?children.filter(c=>canStartTask(s,c)):[t];
 return {children,done,hasChildren,ready,options};
}
export function rescueTask(s:State){if(s.focus)return undefined;return s.tasks.filter(t=>!t.parentId).flatMap(t=>execution(s,t).options).sort((a,b)=>priority(b,s)/Math.sqrt(b.estimated)-priority(a,s)/Math.sqrt(a.estimated))[0];}
