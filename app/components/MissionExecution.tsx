'use client';
import {useState} from 'react';
import {Play} from 'lucide-react';
import {execution} from '../../lib/execution';
import type {State,Task} from '../lib/domain';

export default function MissionExecution({s,task,busy,primary,start,open,complete}:{s:State;task:Task;busy:boolean;primary:boolean;start:(t:Task,kind?:string)=>void;open:(t:Task)=>void;complete:(id:string)=>void}){
 const [selected,setSelected]=useState('');
 const e=execution(s,task),action=e.options.find(t=>t.id===selected)||e.options[0];
 return <div className="daily-execution">
  {e.hasChildren&&<><p className="small">{e.done} de {e.children.length} subtareas completadas</p><div className="progress"><i style={{width:`${e.children.length?e.done/e.children.length*100:100}%`}}/></div></>}
  {e.options.length>1&&<label className="small">Elige tu siguiente acción<select value={action?.id||''} onChange={event=>setSelected(event.target.value)} disabled={busy||!!s.focus}>{e.options.map(t=><option key={t.id} value={t.id}>{t.title} · {t.estimated} min</option>)}</select></label>}
  {action?.parentId&&<p className="next-action"><span className="eyebrow">SIGUIENTE SUBTAREA</span><br/>{action.title}</p>}
  <div className="mission-actions">{e.ready?<button className={'button '+(primary?'light':'')} disabled={busy} onClick={()=>complete(task.id)}>Revisar y confirmar resultado</button>:action?<><button className={'button '+(primary?'light':'')} disabled={busy||!!s.focus} onClick={()=>action.parentId&&action.stepsDone<action.steps.length?open(action):start(action)}><Play size={16}/>{action.parentId?action.stepsDone<action.steps.length?'Revisar pasos de subtarea':'Empezar subtarea':'Empezar misión'}</button>{primary&&<button className={'text-button '+(primary?'on-dark':'')} disabled={busy||!!s.focus} onClick={()=>start(action,'kickstart')}>Empezar con 5 minutos</button>}</>:<p className="small">No hay acciones disponibles. Revisa el estado y las dependencias.</p>}</div>
  <button className={'text-button '+(primary?'on-dark':'')} disabled={busy} onClick={()=>open(action?.parentId&&action.stepsDone<action.steps.length?action:task)}>Ver detalle y soportes</button>
 </div>;
}
