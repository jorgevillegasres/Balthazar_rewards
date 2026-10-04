'use client';
import {activeChildren,elapsed,type State,type Task} from '../lib/domain';
import type {Act} from './useQuest';
import SupportPanel from './SupportPanel';
export default function CompletionReview({s,task,act,busy,finished,back}:{s:State;task:Task;act:Act;busy:boolean;finished:()=>void;back:()=>void}){
 const children=activeChildren(s,task.id),ready=children.every(t=>t.completed)&&task.stepsDone===task.steps.length;
 const tracked=Math.ceil((s.sessions.filter(x=>x.taskId===task.id).reduce((n,x)=>n+x.seconds,0)+(s.focus?.taskId===task.id?elapsed(s.focus,Date.now()):0))/60);
 const minutes=Math.min(10080,tracked+children.reduce((n,t)=>n+t.actual,0)||task.estimated);
 return <><h3>{task.title}</h3><p className="muted">Revisa el resultado antes de cerrar. Marcar pasos no confirma por sí solo que el trabajo esté terminado.</p>
  <SupportPanel task={task} act={act} busy={busy}/>
  {!ready&&<p className="error-inline">Hay pasos o subtareas pendientes. Vuelve al detalle para completarlos.</p>}
  <button type="button" className="text-button" onClick={back}>Seguir trabajando o añadir subtareas</button>
  <form onSubmit={async e=>{e.preventDefault();const data=new FormData(e.currentTarget);if(await act({type:'complete',taskId:task.id,minutes:Number(data.get('minutes')),resultConfirmed:data.get('confirmed')==='on'}))finished()}}>
   <label className="result-consent"><input name="confirmed" type="checkbox" required/>Confirmo que se consiguió el resultado de esta tarea.</label>
   <label>Tiempo real dedicado (minutos)<input name="minutes" type="number" min="1" max="10080" required defaultValue={minutes}/></label>
   <p className="small muted">{task.parentId?'Esta subtarea no concede puntos adicionales.':`Límite ordinario: ${s.days[s.lastDay].ordinary}/300 puntos hoy. La recompensa se otorga una sola vez.`}</p>
   <button className="button full" disabled={busy||!ready}>Confirmar resultado terminado</button>
  </form>
 </>;
}
