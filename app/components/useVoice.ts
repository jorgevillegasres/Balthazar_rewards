'use client';

import {useEffect,useRef,useState} from 'react';

import type {State} from '../lib/domain';

import type {Proposal} from '../../lib/assistant';

import {voiceToolInput} from '../../lib/voice';
import {transcriptionForTurn} from '../../lib/harness';

export type VoiceDraft=({kind:'day';summary:string;items:Proposal['items'];revision:number}|{kind:'capture'|'subtasks';summary:string;tasks:Proposal['tasks'];revision:number;parentId?:string})&{operationId:string;questions:string[]};

type Line={id:string;who:'Tú'|'Balta';text:string};
// Only operation IDs survive closing this panel; no transcript or request body does.
const pendingVoiceOperations=new Map<string,string>();

export function useVoice(s:State,revision:number,refresh:()=>Promise<void>,auto=true,owner=''){

 const [status,setStatus]=useState('Desconectado'),[error,setError]=useState(''),[muted,setMuted]=useState(false),[deadline,setDeadline]=useState(0),[lines,setLines]=useState<Line[]>([]),[draft,setDraft]=useState<VoiceDraft|null>(null);

 const current=useRef({s,revision,refresh,auto});current.current={s,revision,refresh,auto};

 const resources=useRef<{pc?:RTCPeerConnection;stream?:MediaStream;audio?:HTMLAudioElement;channel?:RTCDataChannel;ticket?:string;timer?:ReturnType<typeof setTimeout>;abort?:AbortController;generation:number}>({generation:0});

 const connected=useRef(false),opening=useRef(false);
 const previousId=owner?pendingVoiceOperations.get(owner):undefined;
 const [uncertain,setUncertain]=useState(!!previousId);
 const unresolved=useRef<{operationId:string;body?:string;kind?:'capture'|'day'|'task';parentId?:string}|null>(previousId?{operationId:previousId}:null);
 function resolveOperation(id:string){if(unresolved.current?.operationId===id)unresolved.current=null;if(owner&&pendingVoiceOperations.get(owner)===id)pendingVoiceOperations.delete(owner);setUncertain(false);}
 async function checkOperation(retry=false){
  const pending=unresolved.current;if(!pending)return;
  if(retry&&!pending.body){setError('Comprueba el resultado de la operación anterior; su texto no se conserva al cerrar el panel.');return;}
  try{
   const res=await fetch(retry?'/api/harness':'/api/harness?id='+encodeURIComponent(pending.operationId),retry?{method:'POST',headers:{'Content-Type':'application/json'},body:pending.body}:{cache:'no-store'}),data=await res.json();
   if(!res.ok)throw Error(data.error||'No se pudo comprobar la operación.');
   if(data.status==='executed'){await current.current.refresh();setDraft(null);line('verified-'+pending.operationId,'Balta','Guardado. Acción registrada en Actividad. Inicia otra conversación para usar el contexto actualizado.');}
   else if(data.status==='undone'){await current.current.refresh();setDraft(null);line('undone-'+pending.operationId,'Balta','Esta operación ya fue deshecha. No se aplicará de nuevo.');}
   else if(['failed','rejected'].includes(data.status))setError('La operación no se ejecutó. Puedes iniciar otra conversación.');
   else if(data.proposal){const proposal=data.proposal as Proposal,common={operationId:pending.operationId,revision:data.revision,summary:proposal.summary,questions:proposal.questions};if(!pending.kind)setError('La propuesta anterior quedó pendiente y no se aplicó. Puedes revisarla en Actividad o iniciar otra conversación.');else if(pending.kind==='day')setDraft({...common,kind:'day',items:proposal.items});else if(pending.kind==='capture')setDraft({...common,kind:'capture',tasks:proposal.tasks});else{const parent=current.current.s.tasks.find(t=>t.id===pending.parentId);if(!parent)throw Error('La misión principal ya no está disponible.');setDraft({...common,kind:'subtasks',parentId:parent.id,tasks:proposal.steps.map(step=>({title:step.slice(0,160),nextAction:step,minutes:5,area:parent.area,projectId:parent.projectId,due:''}))});}}
   else throw Error('La operación sigue procesándose. Comprueba el resultado de nuevo.');
   resolveOperation(pending.operationId);
  }catch(e){setError(e instanceof Error?e.message:'El resultado sigue sin verificar.');}
 }

 function end(){const r=resources.current;r.generation++;connected.current=false;opening.current=false;r.abort?.abort();clearTimeout(r.timer);r.channel?.close();r.pc?.close();r.stream?.getTracks().forEach(t=>t.stop());if(r.audio){r.audio.pause();r.audio.srcObject=null}if(r.ticket){void fetch('/api/voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'end',ticket:r.ticket}),keepalive:true}).catch(()=>{})}resources.current={generation:r.generation};setStatus('Desconectado');setMuted(false);setDeadline(0);if(unresolved.current){setUncertain(true);setError('Resultado sin verificar. Comprueba esta operación aquí o en Actividad antes de continuar.');}}

 useEffect(()=>{const hidden=()=>{if(document.hidden)end()};document.addEventListener('visibilitychange',hidden);window.addEventListener('pagehide',end);return()=>{document.removeEventListener('visibilitychange',hidden);window.removeEventListener('pagehide',end);end()}},[]); // Session resources belong to this panel.

 function line(id:string,who:Line['who'],text:string,append=false){setLines(old=>{const previous=old.find(l=>l.id===id);const next={id,who,text:(append?(previous?.text||'')+text:text).slice(0,2400)};return [...old.filter(l=>l.id!==id),next].slice(-30)})}

 async function start(){

  if(owner&&pendingVoiceOperations.has(owner)&&!unresolved.current)unresolved.current={operationId:pendingVoiceOperations.get(owner)!};if(unresolved.current){setUncertain(true);setError('Comprueba la operación anterior antes de iniciar otra conversación.');return;}if(opening.current||connected.current)return;setError('');setDraft(null);setLines([]);setStatus('Conectando');opening.current=true;

  const r=resources.current,gen=++r.generation,baseRevision=current.current.revision;r.abort=new AbortController();const active=()=>resources.current===r&&r.generation===gen;

  const seen=new Set<string>(),turns=new Set<string>();let toolCount=0,userText='',userTurn='',speechItem='';

  const send=(event:unknown)=>{if(active()&&r.channel?.readyState==='open')r.channel.send(JSON.stringify(event))};

  async function tool(call:{name:string;call_id:string;arguments:string}){

   if(seen.has(call.call_id))return;seen.add(call.call_id);let output:unknown;

   try{

    if(unresolved.current)throw Error('El resultado anterior sigue sin verificar. Comprueba su ID antes de continuar.');
    if(++toolCount>6)throw Error('Esta sesión ya generó seis propuestas. Termina y revisa las que tienes.');

    if(userTurn&&turns.has(userTurn))throw Error('Ya se preparó una acción para este turno. Revisa su resultado.');if(userTurn)turns.add(userTurn);

    const name=call.name as keyof typeof voiceToolInput;if(!Object.hasOwn(voiceToolInput,name)||call.arguments.length>12000)throw Error('Propuesta no admitida.');

    const input=voiceToolInput[name].parse(JSON.parse(call.arguments));

    const request=name==='organize_day'?{kind:'day',...input}:name==='capture_tasks'?{kind:'capture',...input}:{kind:'task',...input};

    if(name==='split_task'){const taskId=(input as {taskId:string}).taskId;const t=current.current.s.tasks.find(t=>t.id===taskId);if(!t||t.parentId||t.completed||['ARCHIVADA','CANCELADA'].includes(t.status))throw Error('Elige una tarea principal pendiente.')}

    const operationId=crypto.randomUUID(),turnRevision=current.current.revision;

    const body={...request,text:userText||request.text,userText,source:'voice',mode:current.current.auto?'auto':'review',operationId,revision:turnRevision,consent:true};
    unresolved.current={operationId,body:JSON.stringify(body),kind:request.kind as 'capture'|'day'|'task',parentId:'taskId' in request?request.taskId:undefined};if(owner)pendingVoiceOperations.set(owner,operationId);

    let data;

    // Ending audio must not cancel an operation that may already be committing.
    try{const res=await fetch('/api/harness',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true});data=await res.json();if(!res.ok){if(data.conflict)await current.current.refresh();throw Error(data.error||'No se pudo preparar la acción.')}}

    catch(e){setUncertain(true);setError('Resultado sin verificar. Termina y comprueba esta operación antes de continuar.');if(!active())return;throw Error('Resultado sin verificar. Termina y comprueba esta operación antes de continuar.');}

    const proposal=data.proposal as Proposal;

    if(!proposal)throw Error('La operación sigue pendiente. Revisa Actividad antes de reintentar.');

    if(data.status==='executed'){setDraft(null);await current.current.refresh();resolveOperation(operationId);line('saved-'+operationId,'Balta','Guardado. Acción registrada en Actividad. Inicia otra conversación para usar el contexto actualizado.');end();output={summary:proposal.summary,status:'Guardado. Acción registrada en Actividad.'};}

    else{

     const common={operationId,questions:proposal.questions,revision:data.revision,summary:proposal.summary};

     if(name==='organize_day')setDraft({...common,kind:'day',items:proposal.items});

     else if(name==='capture_tasks')setDraft({...common,kind:'capture',tasks:proposal.tasks});

     else{const task=current.current.s.tasks.find(t=>t.id===(input as {taskId:string}).taskId)!;setDraft({...common,kind:'subtasks',parentId:task.id,tasks:proposal.steps.map(step=>({title:step.slice(0,160),nextAction:step,minutes:5,area:task.area,projectId:task.projectId,due:''}))});}

     output={summary:proposal.summary,proposal,status:'Propuesta pendiente en pantalla. No guardada.'};
     resolveOperation(operationId);

    }

   }catch(e){if(unresolved.current)setUncertain(true);if(!active())return;const message=e instanceof Error?e.message:'No se pudo preparar la propuesta.';setError(message);output={error:message,status:unresolved.current?'Resultado sin verificar. No intentes otra acción.':'La propuesta no se aplicó.'}}

   send({type:'conversation.item.create',item:{type:'function_call_output',call_id:call.call_id,output:JSON.stringify(output)}});

  }

  try{

   if(!navigator.mediaDevices?.getUserMedia||typeof RTCPeerConnection==='undefined')throw Error('Este navegador no admite la conversación de voz.');

   r.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});if(!active()){r.stream.getTracks().forEach(t=>t.stop());return}

   const pc=r.pc=new RTCPeerConnection();r.audio=new Audio();r.audio.autoplay=true;pc.ontrack=e=>{if(!active())return;r.audio!.srcObject=e.streams[0];void r.audio!.play().catch(()=>setError('Pulsa Escuchar respuesta para habilitar el sonido.'))};r.stream.getTracks().forEach(t=>pc.addTrack(t,r.stream!));

   const dc=r.channel=pc.createDataChannel('oai-events');

   dc.onopen=()=>{if(!active())return;opening.current=false;connected.current=true;setStatus('Escuchando');send({type:'response.create',response:{instructions:'Saluda brevemente: «Aquí estoy. ¿Organizamos tu día?»'}})};

   dc.onmessage=async e=>{

    if(!active()||typeof e.data!=='string'||e.data.length>60000)return;try{const v=JSON.parse(e.data);

     if(v.type==='conversation.item.input_audio_transcription.completed'){const transcript=typeof v.transcript==='string'?v.transcript.slice(0,5000):'',authority=transcriptionForTurn(speechItem,v);if(authority!==null){userText=authority;userTurn=v.item_id;}line(v.item_id,'Tú',transcript);}

     if(v.type==='response.output_audio_transcript.delta')line(v.item_id||v.response_id,'Balta',v.delta||'',true);

     if(v.type==='response.output_audio_transcript.done')line(v.item_id||v.response_id,'Balta',v.transcript||'');

     if(v.type==='output_audio_buffer.started')setStatus('Respondiendo');

     if(v.type==='output_audio_buffer.stopped'||v.type==='input_audio_buffer.speech_stopped')setStatus('Escuchando');

     if(v.type==='input_audio_buffer.speech_started'){userText='';userTurn='';speechItem=v.item_id||'';setStatus('Escuchando');}

     if(v.type==='error')setError('La voz tuvo un problema. Termina y vuelve a conectar si continúa.');

     if(v.type==='response.done'){const calls=(v.response?.output||[]).filter((x:{type:string;status?:string})=>x.type==='function_call'&&(!x.status||x.status==='completed'));if(calls.length){await tool(calls[0]);for(const extra of calls.slice(1))send({type:'conversation.item.create',item:{type:'function_call_output',call_id:extra.call_id,output:JSON.stringify({error:'Solo una acción por turno. No guardada.'})}});if(active())send({type:'response.create'})}}

    }catch{setError('No se pudo interpretar un evento de voz.')}

   };

   pc.onconnectionstatechange=()=>{if(active()&&['failed','closed','disconnected'].includes(pc.connectionState)){end();setError('La conversación terminó por un cambio de conexión.')}};

   const offer=await pc.createOffer();await pc.setLocalDescription(offer);if(!active())return;

   // Let the opening return its ticket even after local cancellation so it can be closed.

   const response=await fetch('/api/voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'start',sdp:offer.sdp,revision:baseRevision,consent:true}),keepalive:true});const data=await response.json();

   if(!response.ok){if(data.conflict)await current.current.refresh();throw Error(data.error||'No se pudo conectar.')}

   if(!active()){void fetch('/api/voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'end',ticket:data.ticket}),keepalive:true}).catch(()=>{});return}

   r.ticket=data.ticket;setDeadline(data.deadline);r.timer=setTimeout(()=>{if(active()){end();setError('Terminó la sesión de cinco minutos. Puedes revisar tu propuesta o iniciar otra.')}},Math.max(0,data.deadline-Date.now()));

   await pc.setRemoteDescription({type:'answer',sdp:data.sdp});

   setTimeout(()=>{if(active()&&opening.current){end();setError('La conexión de audio tardó demasiado. Intenta otra vez.')}},15000);

  }catch(e){if(active()){end();setError(e instanceof DOMException&&e.name==='NotAllowedError'?'Permite el micrófono para hablar con Balthazar.':e instanceof Error?e.message:'No se pudo conectar la voz.')}}

 }

 function toggleMute(){const next=!muted;resources.current.stream?.getAudioTracks().forEach(t=>t.enabled=!next);setMuted(next)}

 return {status,error,setError,muted,deadline,lines,draft,setDraft,start,end,toggleMute,uncertain,canRetry:!!unresolved.current?.body,checkOperation,resumeAudio:()=>resources.current.audio?.play().catch(()=>setError('No se pudo reproducir el audio.'))};

}
