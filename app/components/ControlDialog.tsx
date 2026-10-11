'use client';

import {useRef,useState} from 'react';

import type {State} from '../lib/domain';

import type {Proposal} from '../../lib/assistant';

import {proposalCommand} from '../../lib/harness';

import type {Act} from './useQuest';

import Dialog from './Dialog';

import {AssistantQuestions} from './AssistantCommon';

type Result={proposal:Proposal;revision:number;operationId:string;status:'pending'|'executed'|'undone'};

export default function ControlDialog({s,revision,refresh,act,busy,error,close,initialKind='capture',initialTaskId='',initialProjectId=''}:{s:State;revision:number;refresh:()=>Promise<void>;act:Act;busy:boolean;error:string;close:()=>void;initialKind?:'capture'|'day'|'task';initialTaskId?:string;initialProjectId?:string}){

 const [kind,setKind]=useState<'capture'|'day'|'task'|'project'>(initialKind),[text,setText]=useState(''),[projectId,setProject]=useState(initialProjectId),[taskId,setTask]=useState(initialTaskId),[minutes,setMinutes]=useState(25),[energy,setEnergy]=useState(s.profile.energy),[auto,setAuto]=useState(true),[consent,setConsent]=useState(false),[working,setWorking]=useState(false),[message,setMessage]=useState(''),[result,setResult]=useState<Result|null>(null),[uncertain,setUncertain]=useState(false);

 const requestId=useRef<string|null>(null),requestBody=useRef<string|null>(null);

 const stale=!!result&&result.revision!==revision;

 async function acceptReply(data:Result){if(!data.proposal){setUncertain(true);setMessage('La operación sigue pendiente. Comprueba su resultado antes de continuar.');return}setResult(data);setUncertain(false);requestId.current=null;requestBody.current=null;if(data.status==='executed'||data.status==='undone')await refresh()}

 async function check(){if(!requestId.current)return;setWorking(true);try{const res=await fetch('/api/harness?id='+encodeURIComponent(requestId.current),{cache:'no-store'});const data=await res.json();if(!res.ok)throw Error(data.error);if(['failed','rejected'].includes(data.status)){setUncertain(false);requestId.current=null;requestBody.current=null;setMessage('La operación no se ejecutó. Puedes consultar de nuevo.')}else await acceptReply(data)}catch(e){setMessage(e instanceof Error?e.message:'No se pudo comprobar el resultado.')}finally{setWorking(false)}}

 async function send(){if(kind==='project')return;setWorking(true);setMessage('');setResult(null);requestId.current??=crypto.randomUUID();requestBody.current??=JSON.stringify({kind,text,projectId,taskId,minutes,energy,revision,consent,source:'text',mode:auto?'auto':'review',operationId:requestId.current});try{const res=await fetch('/api/harness',{method:'POST',headers:{'Content-Type':'application/json'},body:requestBody.current});const data=await res.json();if(!res.ok){if(data.conflict)await refresh();if(res.status<500&&res.status!==409){requestId.current=null;requestBody.current=null;setUncertain(false)}else setUncertain(true);throw Error(data.error)}await acceptReply(data)}catch(e){setMessage(e instanceof Error?e.message:'Se perdió la conexión. Comprueba el resultado antes de reintentar.');if(requestId.current)setUncertain(true)}finally{setWorking(false)}}

 async function apply(){if(!result||result.proposal.questions.length||kind==='project')return;try{const command=proposalCommand(s,{kind,taskId},result.proposal);if(await act({type:'baltaAction',operationId:result.operationId,source:'text',summary:result.proposal.summary.slice(0,300),inputRevision:result.revision,command},result.revision))setResult({...result,status:'executed'})}catch(e){setMessage(e instanceof Error&&e.message==='DUPLICATE_TASK'?'Hay tareas repetidas; corrige el borrador.':'Revisa el borrador antes de aplicar.') }}

 return <Dialog title="Centro de control · Balta" close={close}>

 <p className="muted">Dime qué necesitas. Una instrucción explícita puede guardar acciones internas; las preguntas y dudas muestran un borrador.</p>

 <fieldset disabled={busy||working||uncertain} style={{border:0,padding:0,margin:0}}>

 <div className="form-grid"><label>Acción<select value={kind} onChange={e=>{setKind(e.target.value as typeof kind);setResult(null)}}><option value="capture">Capturar pendientes</option><option value="day">Organizar el día</option><option value="task">Crear subtareas</option><option value="project">Resumir proyecto · sin IA</option></select></label>

 {(kind==='capture'||kind==='project')&&<label>Proyecto<select value={projectId} onChange={e=>{setProject(e.target.value);setResult(null)}}><option value="">Sin proyecto</option>{s.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}

 {kind==='task'&&<label>Misión principal<select value={taskId} onChange={e=>{setTask(e.target.value);setResult(null)}}><option value="">Elige una misión</option>{s.tasks.filter(t=>!t.parentId&&!t.completed&&!['CANCELADA','ARCHIVADA','COMPLETADA'].includes(t.status)).map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>}

 </div>

 {kind==='day'&&<div className="form-grid"><label>Minutos disponibles<input type="number" min={5} max={480} value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/></label><label>Energía<select value={energy} onChange={e=>setEnergy(e.target.value as typeof energy)}><option>baja</option><option>media</option><option>alta</option></select></label></div>}

 <label>Tu instrucción o pregunta<textarea maxLength={5000} rows={4} value={text} onChange={e=>{setText(e.target.value);setResult(null)}} placeholder="Crea una tarea para revisar el informe"/></label>

 <label className="assistant-consent"><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/>{auto?'Autonomía interna':'Revisar todo'} · Puedes elegir revisar cada propuesta.</label>

 <label className="assistant-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Permito enviar esta solicitud y el contexto necesario a OpenAI durante esta sesión.</label>

 <button className="button full" disabled={!consent||!text.trim()||kind==='task'&&!taskId||!Number.isInteger(minutes)||minutes<5||minutes>480} onClick={()=>{void send()}}>{working?'Consultandoââ‚¬¦':'Enviar a Balta'}</button>

 {kind==='project'&&<section className="voice-draft"><h3>Resumen actual del proyecto</h3>{projectId?<><p>{s.projects.find(p=>p.id===projectId)?.name} · {s.projects.find(p=>p.id===projectId)?.area}</p><p>Propósito: {s.purposes?.find(p=>p.id===s.projects.find(project=>project.id===projectId)?.purposeId)?.title||'Sin propósito vinculado'}</p><p>{s.tasks.filter(t=>!t.parentId&&t.projectId===projectId&&!t.completed&&!['CANCELADA','ARCHIVADA','COMPLETADA'].includes(t.status)).length} misiones principales pendientes · {s.tasks.filter(t=>!t.parentId&&t.projectId===projectId&&!!t.completed).length} completadas</p>{s.tasks.filter(t=>!t.parentId&&t.projectId===projectId&&!t.completed&&!['CANCELADA','ARCHIVADA','COMPLETADA'].includes(t.status)).slice(0,20).map(t=><p key={t.id}><strong>{t.title}</strong> · {t.status}{t.due?' · Vence '+t.due:''}<br/>{t.nextAction}</p>)}</>:<p>Selecciona un proyecto para ver sus misiones principales.</p>}<p className="small muted">Calculado con tu estado guardado. No envía contexto a IA ni consume consultas.</p></section>}
 </fieldset>

 {uncertain&&<div className="voice-controls"><button className="button secondary" disabled={working} onClick={()=>{void check()}}>Comprobar resultado</button><button className="text-button" disabled={working} onClick={()=>{void send()}}>Reintentar la misma operación</button></div>}

 {(message||error)&&<p className="error-inline" role="alert">{message||error}</p>}

 {result&&<section className="voice-draft"><h3>{result.status==='executed'?'Guardado':result.status==='undone'?'Acción deshecha':'Propuesta pendiente'}</h3><p>{result.proposal.summary}</p><AssistantQuestions questions={result.proposal.questions}/>

 {result.status==='pending'&&<>

 {kind==='capture'&&result.proposal.tasks.map((task,i)=><article className="assistant-draft" key={i}><label>Título<input maxLength={160} value={task.title} onChange={e=>setResult({...result,proposal:{...result.proposal,tasks:result.proposal.tasks.map((t,j)=>j===i?{...t,title:e.target.value}:t)}})}/></label><label>Siguiente acción<input maxLength={300} value={task.nextAction} onChange={e=>setResult({...result,proposal:{...result.proposal,tasks:result.proposal.tasks.map((t,j)=>j===i?{...t,nextAction:e.target.value}:t)}})}/></label><label>Fecha de vencimiento<input type="date" value={task.due} onChange={e=>setResult({...result,proposal:{...result.proposal,tasks:result.proposal.tasks.map((t,j)=>j===i?{...t,due:e.target.value}:t)}})}/></label><label>Minutos<input type="number" min={1} max={480} value={task.minutes} onChange={e=>setResult({...result,proposal:{...result.proposal,tasks:result.proposal.tasks.map((t,j)=>j===i?{...t,minutes:Number(e.target.value)}:t)}})}/></label></article>)}

 {kind==='task'&&result.proposal.steps.map((step,i)=><label key={i}>Subtarea {i+1}<input maxLength={160} value={step} onChange={e=>setResult({...result,proposal:{...result.proposal,steps:result.proposal.steps.map((t,j)=>j===i?e.target.value:t)}})}/></label>)}

 {kind==='day'&&result.proposal.items.map(item=><article key={item.taskId}><strong>{s.tasks.find(t=>t.id===item.taskId)?.title}</strong><p>{item.minutes} min · {item.reason}</p><button className="text-button" onClick={()=>setResult({...result,proposal:{...result.proposal,items:result.proposal.items.filter(t=>t.taskId!==item.taskId)}})}>Quitar</button></article>)}

 {stale&&<p className="hint">Tu espacio cambió. Consulta de nuevo antes de aplicar.</p>}

 <button className="button full" disabled={busy||working||stale||!!result.proposal.questions.length} onClick={()=>{void apply()}}>Aplicar propuesta</button>

 </>}

 {result.status==='undone'&&<p className="hint">Esta operación ya fue deshecha. No se aplicará de nuevo.</p>}
 {result.status==='executed'&&<p className="hint">Acción registrada. Puedes consultar su comprobante y deshacerla en Actividad.</p>}

 </section>}

 <p className="small muted">No guardamos una memoria de esta conversación. Cada consulta usa tu espacio actual y consume el límite diario compartido.</p>

 </Dialog>

}
