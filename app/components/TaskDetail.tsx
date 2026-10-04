'use client';
import {useState} from 'react';
import {Check,Plus,Play,ArrowLeft,Paperclip} from 'lucide-react';
import {activeChildren,childrenOf,type State,type Task} from '../lib/domain';
import type {Act} from './useQuest';
import Dialog from './Dialog';
import SupportPanel from './SupportPanel';

export default function TaskDetail({s,task,act,busy,error,close,edit,open,start,complete}:{s:State;task:Task;act:Act;busy:boolean;error:string;close:()=>void;edit:(t:Task)=>void;open:(t:Task)=>void;start:(t:Task)=>void;complete:(id:string)=>void}){
 const [title,setTitle]=useState(''),[candidate,setCandidate]=useState(''),[parentId,setParentId]=useState('');
 const children=childrenOf(s,task.id),active=activeChildren(s,task.id),done=active.filter(t=>t.completed).length,parent=s.tasks.find(t=>t.id===task.parentId);
 const editable=!task.completed&&!['ARCHIVADA','CANCELADA'].includes(task.status)&&(!parent||!parent.completed&&!['ARCHIVADA','CANCELADA','BLOQUEADA'].includes(parent.status));
 const eligible=s.tasks.filter(t=>t.id!==task.id&&!t.parentId&&!t.completed&&!['ARCHIVADA','CANCELADA'].includes(t.status)&&!childrenOf(s,t.id).length);
 const roots=s.tasks.filter(t=>t.id!==task.id&&!t.parentId&&!t.completed&&!['ARCHIVADA','CANCELADA'].includes(t.status));
 const ready=active.every(t=>t.completed)&&task.stepsDone===task.steps.length;
 return <Dialog title={task.parentId?'Detalle de subtarea':'Detalle de misión'} close={close}>
  {parent&&<button className="text-button" onClick={()=>open(parent)}><ArrowLeft size={16}/>{parent.title}</button>}
  <div className="eyebrow">{s.projects.find(p=>p.id===task.projectId)?.name||'Sin proyecto'} · {task.area}</div>
  <h3>{task.title}</h3>{task.description&&<p className="muted">{task.description}</p>}
  {task.nextAction&&<div className="hint">Siguiente acción: {task.nextAction}</div>}
  {task.completed?<p className="green">{task.parentId?'Subtarea completada':'Resultado confirmado'} · {task.actual} min{!task.parentId&&` · ${task.points} puntos`}</p>:<div className="detail-actions"><button className="button secondary" disabled={busy||!editable} onClick={()=>edit(task)}>Editar detalles</button><button className="button secondary" disabled={busy||!editable} onClick={()=>start(task)}><Play size={16}/>Enfocar</button></div>}
  {!!task.steps.length&&<section className="detail-section"><h4>Pasos de esta tarea</h4><p className="small muted">Marca los pasos en orden. Se conserva el avance que ya llevabas.</p>{task.steps.map((step,i)=><button key={i} className="subtask-item step-item" disabled={busy||!editable||i!==task.stepsDone} onClick={()=>act({type:'step',taskId:task.id})}><span className={'task-check '+(i<task.stepsDone?'checked':'')}>{i<task.stepsDone&&<Check size={14}/>}</span><span>{step}</span></button>)}</section>}
  {!task.parentId&&<section className="detail-section"><div className="spread"><h4>Subtareas</h4><span className="small muted">{done} de {active.length} completadas</span></div>
   {!!active.length&&<div className="progress"><i style={{width:`${Math.round(done/active.length*100)}%`}}/></div>}
   {children.map(child=><div className="subtask-item" key={child.id}><button className={'task-check '+(child.completed?'checked':'')} aria-label={(child.completed?'Reabrir subtarea ':'Completar subtarea ')+child.title} disabled={busy||!editable||['ARCHIVADA','CANCELADA'].includes(child.status)||child.stepsDone<child.steps.length} onClick={()=>act({type:child.completed?'reopenSubtask':'complete',taskId:child.id})}>{child.completed&&<Check size={14}/>}</button><button className="task-description" onClick={()=>open(child)}><strong>{child.title}</strong><span>{child.estimated} min · {child.completed?'Completada':['ARCHIVADA','CANCELADA'].includes(child.status)?'Archivada':'Pendiente'}</span></button>{!child.completed&&editable&&<button className="icon-button" aria-label={'Enfocar subtarea '+child.title} disabled={busy} onClick={()=>start(child)}><Play size={16}/></button>}</div>)}
   {!children.length&&<p className="muted small">Divide el resultado en acciones pequeñas o incorpora tareas que ya tienes.</p>}
   {editable&&<><form className="subtask-form" onSubmit={async e=>{e.preventDefault();if(await act({type:'capture',tasks:[{title,parentId:task.id,minutes:10}]}))setTitle('')}}><label>Nueva subtarea<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={160} required placeholder="Una acción concreta"/></label><button className="button secondary" disabled={busy||!title.trim()}><Plus size={16}/>Añadir subtarea</button></form>
   {!!eligible.length&&<form className="subtask-form" onSubmit={async e=>{e.preventDefault();if(candidate&&await act({type:'reparent',taskId:candidate,parentId:task.id}))setCandidate('')}}><label>Convertir una tarea existente<select value={candidate} onChange={e=>setCandidate(e.target.value)}><option value="">Selecciona una tarea</option>{eligible.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label><p className="small muted">Conserva su contenido y soportes. Pasa al área y proyecto de esta misión; su cierre no concede puntos adicionales.</p><button className="button secondary" disabled={busy||!candidate}>Convertir en subtarea</button></form>}</>}
  </section>}
  {editable&&!children.length&&<details className="detail-section"><summary>{task.parentId?'Reorganizar subtarea':'Mover a una tarea principal'}</summary><form className="subtask-form" onSubmit={async e=>{e.preventDefault();if(parentId)await act({type:'reparent',taskId:task.id,parentId})}}><label>Tarea principal<select value={parentId} onChange={e=>setParentId(e.target.value)}><option value="">Selecciona una tarea</option>{roots.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label><button className="button secondary" disabled={busy||!parentId}>Mover como subtarea</button></form>{task.parentId&&<button className="text-button" disabled={busy} onClick={()=>act({type:'reparent',taskId:task.id,parentId:''})}>Separar como tarea principal</button>}</details>}
  <section className="detail-section"><SupportPanel task={task} act={act} busy={busy}/></section>
  {editable&&<section className="detail-section"><p className="muted">{ready?task.parentId?'Esta acción está lista para marcarse como completada.':'Pasos completados · Resultado pendiente de confirmar.':'Completa los pasos y subtareas pendientes antes de cerrar.'}</p><button className="button full" disabled={busy||!ready} onClick={()=>complete(task.id)}>{task.parentId?'Completar subtarea':'Revisar y confirmar resultado'}</button></section>}
  {error&&<p className="error-inline" role="alert">{error}</p>}
 </Dialog>;
}
