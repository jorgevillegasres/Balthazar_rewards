'use client';

import {useEffect,useRef,useState} from 'react';
import {Pencil,Trash2} from 'lucide-react';
import {getBalta,type BaltaProfile} from '../../lib/balta-profile';
import type {State} from '../lib/domain';
import type {Act} from './useQuest';

export default function BaltaSettings({s,act,busy}:{s:State;act:Act;busy:boolean}){
 const stored=getBalta(s),profileKey=JSON.stringify(stored.profile);
 const [profile,setProfile]=useState<BaltaProfile>(stored.profile);
 const [memoryId,setMemoryId]=useState<string|null>(null),[text,setText]=useState('');
 const [deletion,setDeletion]=useState<{memoryId:string;text:string}|{all:true}|null>(null);
 const [saving,setSaving]=useState(false),[message,setMessage]=useState(''),[failed,setFailed]=useState(false);
 const inFlight=useRef(false),editor=useRef<HTMLTextAreaElement>(null),memoriesHeading=useRef<HTMLHeadingElement>(null),savedProfile=useRef(false),lastProfileKey=useRef(profileKey);
 // Task and timer refreshes must not erase a personalisation draft.
 useEffect(()=>{
  if(savedProfile.current||lastProfileKey.current!==profileKey){setProfile(JSON.parse(profileKey) as BaltaProfile);savedProfile.current=false;lastProfileKey.current=profileKey}
 },[s,profileKey,saving]);
 const disabled=busy||saving,full=stored.memories.length>=20;
 async function submit(command:Parameters<Act>[0],success:string,after?:()=>void){
  if(busy||inFlight.current)return;
  inFlight.current=true;setSaving(true);setMessage('');setFailed(false);
  try{
   if(await act(command)){setMessage(success);after?.()}
   else{setFailed(true);setMessage('No se guardó el cambio. Revisa el aviso del espacio y vuelve a intentar.');}
  }catch{setFailed(true);setMessage('No se guardó el cambio. Revisa tu conexión y vuelve a intentar.');}
  finally{inFlight.current=false;setSaving(false)}
 }
 function resetMemory(){setMemoryId(null);setText('')}
 function editMemory(id:string,value:string){setMemoryId(id);setText(value);setDeletion(null);setMessage('');editor.current?.focus()}
 return <div className="balta-settings">
  <section className="card balta-profile" aria-labelledby="balta-profile-title">
   <div className="eyebrow">TU FORMA DE TRABAJAR</div>
   <h2 id="balta-profile-title">Así trabaja Balta conmigo</h2>
   <p className="muted">Elige cómo te acompaña. Balta conserva solo el perfil y los recuerdos que decides guardar; no guarda conversaciones ni audio completos.</p>
   <form onSubmit={e=>{e.preventDefault();void submit({type:'baltaProfile',profile},'Perfil de Balta guardado.',()=>{savedProfile.current=true})}}>
    <fieldset disabled={disabled}>
     <label htmlFor="balta-preferred-name">¿Cómo quieres que Balta te llame? <span className="small muted">Opcional</span></label>
     <input id="balta-preferred-name" maxLength={60} value={profile.preferredName} autoComplete="off" onChange={e=>setProfile({...profile,preferredName:e.target.value})}/>
     <label htmlFor="balta-working-style">Cómo trabajo y qué me ayuda</label>
     <textarea id="balta-working-style" rows={4} maxLength={600} value={profile.workingStyle} aria-describedby="balta-working-count" onChange={e=>setProfile({...profile,workingStyle:e.target.value})}/>
     <p id="balta-working-count" className="small muted balta-count">{profile.workingStyle.length}/600 caracteres</p>
     <div className="form-grid">
      <label>Humor<select value={profile.humor} onChange={e=>setProfile({...profile,humor:e.target.value as BaltaProfile['humor']})}><option value="lively">Expresivo</option><option value="subtle">Discreto</option><option value="serious">Serio</option></select></label>
      <label>Acompañamiento<select value={profile.support} onChange={e=>setProfile({...profile,support:e.target.value as BaltaProfile['support']})}><option value="balanced">Equilibrado</option><option value="gentle">Suave</option><option value="direct">Directo</option></select></label>
     </div>
     <label className="balta-sharing"><input type="checkbox" checked={profile.useInAssistant} aria-describedby="balta-sharing-help" onChange={e=>setProfile({...profile,useInAssistant:e.target.checked})}/><span>Usar mi perfil y mis recuerdos en consultas de texto y voz</span></label>
     <p id="balta-sharing-help" className="small muted">Al guardar esta opción, se incluyen en las consultas que autorices con el consentimiento de IA. Desactivarla conserva tus datos y los excluye de consultas nuevas.</p>
     <button className="button" type="submit">Guardar perfil de Balta</button>
    </fieldset>
   </form>
  </section>
  <section className="card balta-memories" aria-labelledby="balta-memories-title">
   <div className="eyebrow">RECUERDOS ELEGIDOS POR TI</div>
   <div className="section-title"><h2 ref={memoriesHeading} tabIndex={-1} id="balta-memories-title">Lo que Balta recuerda</h2><span className="small muted">{stored.memories.length}/20 recuerdos</span></div>
   <p className="muted">Guarda datos concretos que quieras tener presentes. Puedes revisarlos, editarlos o borrarlos aquí. Balta los trata como información que tú declaraste.</p>
   <form onSubmit={e=>{e.preventDefault();void submit({type:'baltaRemember',text,...(memoryId?{memoryId}:{}),confirmed:true},memoryId?'Recuerdo actualizado.':'Recuerdo guardado.',resetMemory)}}>
    <fieldset disabled={disabled}>
     <label htmlFor="balta-memory-text">{memoryId?'Editar recuerdo':'Nuevo recuerdo'}</label>
     <textarea ref={editor} id="balta-memory-text" rows={3} required maxLength={400} value={text} aria-describedby="balta-memory-count" onChange={e=>setText(e.target.value)}/>
     <p id="balta-memory-count" className="small muted balta-count">{text.length}/400 caracteres</p>
     {full&&!memoryId&&<p className="small muted">Ya tienes 20 recuerdos. Edita uno o elimina uno para guardar otro.</p>}
     <div className="balta-actions"><button className="button" type="submit" disabled={!text.trim()||(full&&!memoryId)}>{memoryId?'Guardar cambios del recuerdo':'Guardar recuerdo'}</button>{memoryId&&<button className="text-button" type="button" onClick={resetMemory}>Cancelar edición</button>}</div>
    </fieldset>
   </form>
   {stored.memories.length===0?<p className="small muted balta-empty">Todavía no has guardado recuerdos.</p>:<ul className="balta-memory-list">{stored.memories.map(memory=><li key={memory.id}>
    <div><p>{memory.text}</p><span className="small muted">Guardado el {new Date(memory.created).toLocaleDateString('es-CO')}{memory.updated!==memory.created&&<> · Actualizado el {new Date(memory.updated).toLocaleDateString('es-CO')}</>}</span></div>
    <div className="balta-actions"><button className="icon-button" disabled={disabled} aria-label={'Editar recuerdo: '+memory.text} onClick={()=>editMemory(memory.id,memory.text)}><Pencil size={17}/></button><button className="icon-button" disabled={disabled} aria-label={'Borrar recuerdo: '+memory.text} onClick={()=>setDeletion({memoryId:memory.id,text:memory.text})}><Trash2 size={17}/></button></div>
   </li>)}</ul>}
   {stored.memories.length>0&&<button className="text-button" disabled={disabled} onClick={()=>setDeletion({all:true})}><Trash2 size={17}/>Borrar todos los recuerdos</button>}
   {deletion&&<div className="balta-delete-confirmation" role="group" aria-labelledby="balta-delete-title">
    <h3 id="balta-delete-title">{'all' in deletion?'¿Borrar todos los recuerdos?':'¿Borrar este recuerdo?'}</h3>
    {'all' in deletion?<p>Se eliminarán los {stored.memories.length} recuerdos de tu espacio activo. Tu perfil de Balta se conserva.</p>:<p className="balta-delete-text">{deletion.text}</p>}
    <p className="small muted">Esta acción no se puede deshacer. Los respaldos anteriores pueden conservar estos datos.</p>
    <div className="balta-actions"><button className="button secondary" disabled={disabled} onClick={()=>void submit('all' in deletion?{type:'baltaForgetAll',confirmed:true}:{type:'baltaForget',memoryId:deletion.memoryId,confirmed:true},'Recuerdos eliminados.',()=>{if('all' in deletion||deletion.memoryId===memoryId)resetMemory();setDeletion(null);memoriesHeading.current?.focus()})}>{'all' in deletion?'Confirmar borrado de todos':'Confirmar borrado del recuerdo'}</button><button className="text-button" disabled={disabled} onClick={()=>setDeletion(null)}>Cancelar</button></div>
   </div>}
   <p className="small muted balta-privacy">El respaldo de tu espacio incluye este perfil y tus recuerdos. Guárdalo en privado. Borrar aquí elimina los datos del estado activo; las copias de respaldo anteriores pueden conservarlos.</p>
  </section>
  {message&&<p className={failed?'error-inline':'balta-save-status'} role={failed?'alert':'status'}>{message}</p>}
 </div>
}
