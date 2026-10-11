'use client';
import {AlertCircle,Target,Folder,ArrowRight,Sparkles,History} from 'lucide-react';
import type {State,Task} from '../lib/domain';
import {attention,purposeMetrics} from '../../lib/purposes';

export default function ControlCenter({s,open,projects,purposes,control,activity}:{s:State;open:(task:Task)=>void;projects:(projectId:string)=>void;purposes:()=>void;control:()=>void;activity:()=>void}){
 const rows=attention(s),activePurposes=(s.purposes||[]).filter(p=>p.status==='active');
 const missions=s.days[s.lastDay]?.missions||[],priorities=[...new Set(missions)].map(id=>s.tasks.find(t=>t.id===id)).filter((t):t is Task=>!!t&&!t.parentId&&!t.completed&&!['COMPLETADA','CANCELADA','ARCHIVADA'].includes(t.status));
 return <section className="control-center" aria-label="Centro de mando">
  <div className="section-title"><h2>Centro de mando</h2><div className="row-actions"><button className="text-button" onClick={control}><Sparkles size={16}/>Entrada de Balta</button><button className="text-button" onClick={activity}><History size={16}/>Actividad</button></div></div>
  <div className="card attention-card"><div className="section-title"><h3><AlertCircle size={19}/>Requiere tu atención</h3><span className="count">{rows.length}</span></div><p className="muted small">Vencimientos, bloqueos y pendientes por organizar. Las subtareas están dentro de su principal.</p>
   {rows.slice(0,8).map(({task,reasons})=><button key={task.id} className="task-row control-task" onClick={()=>open(task)}><span className="task-description"><strong>{task.title}</strong><span>{reasons.join(' · ')}{task.due?' · Vence '+task.due:''}</span></span><ArrowRight size={17}/></button>)}
   {!rows.length&&<p className="green">Sin pendientes que requieran atención.</p>}{rows.length>8&&<p className="small muted">Mostrando 8 de {rows.length} pendientes. Consulta los demás en Misiones.</p>}
  </div>
  {!!priorities.length&&<div className="card control-priorities"><h3>Prioridades del día</h3>{priorities.map(task=><button key={task.id} className="task-row control-task" onClick={()=>open(task)}><span className="task-description"><strong>{task.title}</strong><span>{task.estimated} min · {task.area}</span></span><ArrowRight size={17}/></button>)}</div>}
  <div className="section-title"><h3>Propósitos activos</h3><button className="text-button" onClick={purposes}>Ver propósitos<ArrowRight size={15}/></button></div>
  <div className="project-grid control-purpose-grid">{activePurposes.map(p=>{const m=purposeMetrics(s,p.id);return <article className="card" key={p.id}><div className="eyebrow"><Target size={17}/>{p.area}</div><h3>{p.title}</h3><p className="muted small">{m.total?`${m.completed} de ${m.total} acciones completadas`:'Sin acciones vinculadas'}</p>{p.due&&<p className="muted small">Fecha objetivo: {p.due}</p>}<div className="purpose-projects">{m.projects.map(project=><button className="text-button" key={project.id} onClick={()=>projects(project.id)}><Folder size={15}/>{project.name}</button>)}</div></article>})}</div>
  {!activePurposes.length&&<div className="card"><p className="muted">Conecta tus proyectos con el resultado que quieres alcanzar.</p><button className="button secondary" onClick={purposes}><Target size={17}/>Definir un propósito</button></div>}
 </section>;
}
