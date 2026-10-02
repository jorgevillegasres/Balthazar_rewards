'use client';
import {useState,useRef,useEffect} from 'react';
import type {Proposal,AssistantRequest} from '../../lib/assistant';
export function useAssistant(revision:number,refresh:()=>Promise<void>){
 const [consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<{proposal:Proposal;revision:number;remaining:number}|null>(null);
 const controller=useRef<AbortController|null>(null);
 useEffect(()=>()=>controller.current?.abort(),[]);
 function reset(){controller.current?.abort();controller.current=null;setBusy(false);setResult(null);setError('')}
 async function ask(input:Pick<AssistantRequest,'kind'>&Partial<AssistantRequest>){
  if(!consent||controller.current)return;
  const current=new AbortController();controller.current=current;setBusy(true);setError('');setResult(null);
  try{const res=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...input,revision,consent:true}),signal:current.signal});const data=await res.json();if(!res.ok){if(data.conflict)await refresh();throw Error(data.error||'No se pudo consultar.')}if(controller.current===current)setResult(data)}catch(e){if(controller.current===current&&!current.signal.aborted)setError(e instanceof Error?e.message:'Revisa tu conexión.')}finally{if(controller.current===current){controller.current=null;setBusy(false)}}
 }
 return {consent,setConsent,busy,error,result,ask,reset};
}
export type Assistance=ReturnType<typeof useAssistant>;
