'use client';
import {useState,useEffect,useCallback,useRef} from 'react';
import type {State,Command} from '../lib/domain';
type Snapshot={state:State;revision:number;owner:string};
type Reply=Snapshot&{error?:string;signIn?:boolean;conflict?:boolean};
export function useQuest(){
 const [data,setData]=useState<Snapshot|null>(null);
 const [error,setError]=useState(''),[auth,setAuth]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const current=useRef(data),pending=useRef(false),readSequence=useRef(0),retry=useRef<{signature:string;id:string}|null>(null);
 const clearIdentity=useCallback(()=>{current.current=null;setData(null);setAuth(true);retry.current=null},[]);
 const load=useCallback(async()=>{
  const sequence=++readSequence.current;
  try{
   const res=await fetch('/api/quest',{cache:'no-store'});if(sequence!==readSequence.current)return;
   if(res.status===401||res.status===403||res.redirected||!res.headers.get('content-type')?.includes('application/json')){clearIdentity();throw new Error('Vuelve a entrar para acceder a tu progreso.')} const result=await res.json() as Reply;
   if(sequence!==readSequence.current)return;
   if(!res.ok){if(result.signIn)clearIdentity();throw new Error(result.error||'No se pudo cargar tu progreso.')}
   if(current.current?.owner!==result.owner)retry.current=null;current.current=result;setData(result);
   setError('');setAuth(false);
  }catch(e){if(sequence===readSequence.current)setError(e instanceof Error?e.message:'No hay conexión. Intenta de nuevo.')}
  finally{if(sequence===readSequence.current)setLoading(false)}
 },[clearIdentity]);
 useEffect(()=>{void load();const onFocus=()=>{if(!pending.current)void load()};window.addEventListener('focus',onFocus);window.addEventListener('balthazar-space-changed',onFocus);const interval=setInterval(onFocus,60000);return()=>{window.removeEventListener('focus',onFocus);window.removeEventListener('balthazar-space-changed',onFocus);clearInterval(interval)}},[load]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),6000);return()=>clearTimeout(t)},[notice]);
 async function act(command:Omit<Command,'id'>,expectedRevision?:number){
  if(pending.current||!current.current)return false;
  if(expectedRevision!==undefined&&current.current.revision!==expectedRevision){setError('Tu espacio cambió desde esta propuesta. Consulta de nuevo antes de aplicarla.');return false}
  pending.current=true;readSequence.current++;setBusy(true);setError('');
  const signature=JSON.stringify(command);
  if(retry.current?.signature!==signature)retry.current={signature,id:crypto.randomUUID()};
  try{
   const before=current.current.state;
   const res=await fetch('/api/quest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:current.current.revision,command:{...command,id:retry.current.id}})});
   if(res.status===401||res.status===403||res.redirected||!res.headers.get('content-type')?.includes('application/json')){clearIdentity();throw new Error('Vuelve a entrar para acceder a tu progreso.')} const result=await res.json() as Reply;
   if(!res.ok){if(result.conflict)await load();if(result.signIn)clearIdentity();throw new Error(result.error||'No se pudo guardar.')}
   readSequence.current++;current.current=result;setData(result);retry.current=null;
   if(command.type==='complete'&&result.state.tasks.find(t=>t.id===command.taskId)?.parentId)setNotice('Subtarea completada. Confirma el resultado de la tarea principal cuando termines.');
   else if(command.type==='complete')setNotice('Misión completada · +'+(result.state.points-before.points)+' puntos · +'+(result.state.xp-before.xp)+' XP');
   else if(command.type==='redeem')setNotice('Recompensa canjeada. Disfrútala, te la ganaste.');
   return true;
  }catch(e){setError(e instanceof Error?e.message:'No se pudo guardar. Revisa tu conexión y vuelve a intentar.');return false}
  finally{pending.current=false;setBusy(false)}
 }
 return {state:data?.state,revision:data?.revision,owner:data?.owner,act,busy,error,setError,auth,loading,load,notice};
}
export type Act=(command:Omit<Command,'id'>,expectedRevision?:number)=>Promise<boolean>;

