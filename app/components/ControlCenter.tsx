'use client';
import {AlertCircle,ArrowRight} from 'lucide-react';
import type {State,Task} from '../lib/domain';
import {attention} from '../../lib/purposes';
export default function ControlCenter({s,open,missions,purposes,activity}:{s:State;open:(task:Task)=>void;missions:()=>void;purposes:()=>void;activity:()=>void}){
 const rows=attention(s);return <section className="card attention-card" aria-label="Requiere atención"><div className="section-title"><h2><AlertCircle size={19}/>Requiere atención</h2><span>{rows.length}</span></div>{rows.slice(0,3).map(({task,reasons})=><button key={task.id} className="task-row control-task" onClick={()=>open(task)}><span className="task-description"><strong>{task.title}</strong><span>{reasons.join(' · ')}{task.due?' · Vence '+task.due:''}</span></span><ArrowRight size={17}/></button>)}{!rows.length&&<p className="muted">Sin pendientes que requieran atención.</p>}<div className="row-actions"><button className="text-button" onClick={missions}>Ver todas las misiones</button><button className="text-button" onClick={purposes}>Ver propósitos</button><button className="text-button" onClick={activity}>Actividad de Balta</button></div></section>;
}
