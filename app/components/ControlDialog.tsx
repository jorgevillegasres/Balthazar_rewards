'use client';

import {useEffect,useRef,useState} from 'react';

import type {State} from '../lib/domain';

import type {Proposal} from '../../lib/assistant';

import {proposalCommand} from '../../lib/harness';
import {textOperations,rejectedTextOperation,type PendingTextOperation} from '../../lib/text-operations';

import type {Act} from './useQuest';

import Dialog from './Dialog';

import {AssistantQuestions} from './AssistantCommon';

type Result={proposal:Proposal;revision:number;operationId:string;status:'pending'|'executed'|'undone'};

export default function ControlDialog({s,revision,refresh,act,busy,error,close,owner,initialKind='capture',initialTaskId='',initialProjectId=''}:{s:State;revision:number;refresh:()=>Promise<void>;act:Act;busy:boolean;error:string;close:()=>void;owner:string;initialKind?:'capture'|'day'|'task'|'memory';initialTaskId?:string;initialProjectId?:string}){

 const [previous]=useState(()=>textOperations.pending(owner));
 const recovered=previous?JSON.parse(previous.body):null;
 const [kind,setKind]=useState<'capture'|'day'|'task'|'project'|'memory'>(recovered?.kind||initialKind),[text,setText]=useState(recovered?.text||''),[projectId,setProject]=useState(recovered?.projectId??initialProjectId),[taskId,setTask]=useState(recovered?.taskId||initialTaskId),[minutes,setMinutes]=useState(recovered?.minutes||25),[energy,setEnergy]=useState(recovered?.energy||s.profile.energy),[auto,setAuto]=useState(recovered?recovered.mode==='auto':true),[consent,setConsent]=useState(!!recovered?.consent),[working,setWorking]=useState(false),[message,setMessage]=useState(previous?'Hay una operación pendiente. Comprueba su resultado antes de continuar.':''),[result,setResult]=useState<Result|null>(null),[uncertain,setUncertain]=useState(!!previous);
 const mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
 const request=useRef<PendingTextOperation|null>(previous);

 const stale=!!result&&result.revision!==revision;

 function resolve(operation:PendingTextOperation){textOperations.resolve(owner,operation.operationId);if(request.current?.operationId===operation.operationId)request.current=null;setUncertain(false)}
 async function acceptReply(data:Result&{status:string},operation:PendingTextOperation){
  // A closed panel leaves recovery to the next instance, including successful replies.
  if(!mounted.current||textOperations.pending(owner)?.operationId!==operation.operationId)return;
  if(data.operationId!==operation.operationId)throw Error('No se pudo verificar la operación.');
  if(['failed','rejected'].includes(data.status)){resolve(operation);setMessage('La operación no se ejecutó. Puedes consultar de nuevo.');return}
  if(!data.proposal){setUncertain(true);setMessage('La operación sigue pendiente. Comprueba su resultado antes de continuar.');return}
  setResult(data);resolve(operation);setMessage('');if(data.status==='executed'||data.status==='undone')await refresh();
 }

 async function check(){const operation=request.current;if(!operation||working)return;setWorking(true);try{const res=await fetch('/api/harness?id='+encodeURIComponent(operation.operationId),{cache:'no-store'});const data=await res.json();if(!res.ok)throw Error(data.error);await acceptReply(data,operation)}catch(e){if(mounted.current)setMessage(e instanceof Error?e.message:'No se pudo comprobar el resultado.')}finally{if(mounted.current)setWorking(false)}}

 async function send(retry=false){
  if(kind==='project'||kind==='memory'||working)return;
  if(!request.current){
   if(retry)return;
   const operationId=crypto.randomUUID(),operation={operationId,body:JSON.stringify({kind,text,projectId,taskId,minutes,energy,revision,consent,source:'text',mode:auto?'auto':'review',operationId})};
   try{textOperations.begin(owner,operation);request.current=operation}catch{setUncertain(true);setMessage('Comprueba la operación anterior antes de continuar.');return}
  }else if(!retry){setUncertain(true);return}
  const operation=request.current;
  setWorking(true);setMessage('');setResult(null);setUncertain(true);
  try{
   const res=await fetch('/api/harness',{method:'POST',headers:{'Content-Type':'application/json'},body:operation.body}),data=await res.json();
   if(!mounted.current)return;
   if(!res.ok){if(data.conflict)await refresh();if(rejectedTextOperation(res.status,!!data.conflict))resolve(operation);throw Error(data.error||'No se pudo completar la operación.')}
   await acceptReply(data,operation);
  }catch(e){if(mounted.current){setMessage(e instanceof Error?e.message:'Se perdió la conexión. Comprueba el resultado antes de reintentar.');if(request.current)setUncertain(true)}}finally{if(mounted.current)setWorking(false)}
 }

 async function apply(){if(!result||result.proposal.questions.length||kind==='project'||kind==='memory')return;try{const command=proposalCommand(s,{kind,taskId},result.proposal);if(await act({type:'baltaAction',operationId:result.operationId,source:'text',summary:result.proposal.summary.slice(0,300),inputRevision:result.revision,command},result.revision))setResult({...result,status:'executed'})}catch(e){setMessage(e instanceof Error&&e.message==='DUPLICATE_TASK'?'Hay tareas repetidas; corrige el borrador.':'Revisa el borrador antes de aplicar.') }}

 return <Dialog title="Centro de control · Balta" close={close}>

 {kind!=='project'&&kind!=='memory'&&<p className="muted">Dime qué necesitas. Una instrucción explícita puede guardar acciones internas; las preguntas y dudas muestran un borrador.</p>}

 <fieldset disabled={busy||working||uncertain} style={{border:0,padding:0,margin:0}}>

 <div className="form-grid"><label>Acción<select value={kind} onChange={e=>{setKind(e.target.value as typeof kind);setResult(null);setMessage('')}}><option value="capture">Capturar pendientes</option><option value="day">Organizar el día</option><option value="task">Crear subtareas</option><option value="memory">Guardar un recuerdo · sin IA</option><option value="project">Resumir proyecto · sin IA</option></select></label>

 {(kind==='capture'||kind==='project')&&<label>Proyecto<select value={projectId} onChange={e=>{setProject(e.target.value);setResult(null)}}><option value="">Sin proyecto</option>{s.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}

 {kind==='task'&&<label>Misión principal<select value={taskId} onChange={e=>{setTask(e.target.value);setResult(null)}}><option value="">Elige una misión</option>{s.tasks.filter(t=>!t.parentId&&!t.completed&&!['CANCELADA','ARCHIVADA','COMPLETADA'].includes(t.status)).map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>}

 </div>

 {kind==='day'&&<div className="form-grid"><label>Minutos disponibles<input type="number" min={5} max={480} value={minutes} onChange={e=>setMinutes(Number(e.target.value))}/></label><label>Energía<select value={energy} onChange={e=>setEnergy(e.target.value as typeof energy)}><option>baja</option><option>media</option><option>alta</option></select></label></div>}

 {kind==='memory'&&<><p className="muted">Escribe exactamente lo que quieres que Balta recuerde. Revisa el contenido antes de guardarlo; no se envía a IA para crear el recuerdo.</p><label>Recuerdo para Balta<textarea maxLength={400} rows={4} value={text} onChange={e=>{setText(e.target.value);setMessage('')}} placeholder="Me ayuda estudiar en bloques de veinte minutos"/></label><p className="small muted">Podrás editarlo y borrarlo en Perfil → Configuración. Se usa en consultas nuevas solo si habilitas allí tu perfil y recuerdos.</p><button className="button full" disabled={!text.trim()||text.length>400} onClick={async()=>{setMessage('');if(await act({type:'baltaRemember',text,confirmed:true})){setText('');setMessage('Recuerdo guardado. Puedes revisarlo en Perfil → Configuración.')}}}>Guardar recuerdo</button></>}

 {kind!=='project'&&kind!=='memory'&&<><label>Tu instrucción o pregunta<textarea maxLength={5000} rows={4} value={text} onChange={e=>{setText(e.target.value);setResult(null)}} placeholder="Crea una tarea para revisar el informe"/></label>

 <label className="assistant-consent"><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/>{auto?'Autonomía interna':'Revisar todo'} · Puedes elegir revisar cada propuesta.</label>

 <label className="assistant-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>Permito enviar esta solicitud, mis áreas, los datos de los proyectos y misiones necesarios para esta acción y hasta 20 propósitos activos (título, descripción, área y fecha) a OpenAI durante esta sesión. Incluye mi perfil de Balta y los recuerdos que haya habilitado.{kind==='day'&&' Incluye hasta 20 rutinas previstas hoy: título, duración y estado.'}</label>

 <button className="button full" disabled={!consent||!text.trim()||kind==='task'&&!taskId||!Number.isInteger(minutes)||minutes<5||minutes>480} onClick={()=>{void send()}}>{working?'Consultando…':'Enviar a Balta'}</button></>}

 {kind==='project'&&<section className="voice-draft"><h3>Resumen actual del proyecto</h3>{projectId?<><p>{s.projects.find(p=>p.id===projectId)?.name} · {s.projects.find(p=>p.id===projectId)?.area}</p><p>Propósito: {s.purposes?.find(p=>p.id===s.projects.find(project=>project.id===projectId)?.purposeId)?.title||'Sin propósito vinculado'}</p><p>{s.tasks.filter(t=>!t.parentId&&t.projectId===projectId&&!t.completed&&!['CANCELADA','ARCHIVADA','COMPLETADA'].includes(t.status)).length} misiones principales pendientes · {s.tasks.filter(t=>!t.parentId&&t.projectId===projectId&&!!t.completed).length} completadas</p>{s.tasks.filter(t=>!t.parentId&&t.projectId===projectId&&!t.completed&&!['CANCELADA','ARCHIVADA','COMPLETADA'].includes(t.status)).slice(0,20).map(t=><p key={t.id}><strong>{t.title}</strong> · {t.status}{t.due?' · Vence '+t.due:''}<br/>{t.nextAction}</p>)}</>:<p>Selecciona un proyecto para ver sus misiones principales.</p>}<p className="small muted">Calculado con tu estado guardado. No envía contexto a IA ni consume consultas.</p></section>}
 </fieldset>

 {uncertain&&<div className="voice-controls"><button className="button secondary" disabled={working} onClick={()=>{void check()}}>Comprobar resultado</button><button className="text-button" disabled={working} onClick={()=>{void send(true)}}>Reintentar la misma operación</button></div>}

 {(message||error)&&<p className={kind==='memory'&&!error?'hint':'error-inline'} role={kind==='memory'&&!error?'status':'alert'}>{message||error}</p>}

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

 {kind!=='project'&&kind!=='memory'&&<p className="small muted">No guardamos esta conversación. Solo conservamos el perfil y los recuerdos que tú hayas elegido guardar. Una solicitud pendiente se conserva temporalmente en esta pestaña para verificarla si cierras el panel. Cada consulta usa tu espacio actual y consume el límite diario compartido.</p>}

 </Dialog>

}
