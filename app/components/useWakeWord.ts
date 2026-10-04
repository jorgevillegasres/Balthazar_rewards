'use client';
import {useEffect,useRef,useState} from 'react';
import {wakePhrase} from '../../lib/voice';
type Recognition={processLocally:boolean;lang:string;continuous:boolean;interimResults:boolean;start:()=>void;abort:()=>void;onresult:((event:{resultIndex:number;results:{length:number;[i:number]:{isFinal:boolean;[i:number]:{transcript:string}}}})=>void)|null;onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null};
type Constructor={new():Recognition;available?:(options:{langs:string[];processLocally:boolean})=>Promise<string>;install?:(options:{langs:string[];processLocally:boolean})=>Promise<boolean>};
export function useWakeWord(trigger:()=>void){
 const [availability,setAvailability]=useState('checking'),[listening,setListening]=useState(false),[message,setMessage]=useState(''),[preparing,setPreparing]=useState(false);
 const callback=useRef(trigger);callback.current=trigger;const active=useRef(false),recognizer=useRef<Recognition|null>(null),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),generation=useRef(0);
 const constructor=()=>((window as typeof window&{SpeechRecognition?:Constructor}).SpeechRecognition);
 function stop(){generation.current++;active.current=false;clearTimeout(timer.current);if(recognizer.current){recognizer.current.onend=null;recognizer.current.abort();recognizer.current=null}setListening(false)}
 useEffect(()=>{let cancelled=false;const C=constructor();if(!C?.available||!('processLocally' in C.prototype)){setAvailability('unavailable');return}void C.available({langs:['es-ES'],processLocally:true}).then(value=>{if(!cancelled)setAvailability(value)}).catch(()=>{if(!cancelled)setAvailability('unavailable')});const hidden=()=>{if(document.hidden)stop()};document.addEventListener('visibilitychange',hidden);return()=>{cancelled=true;document.removeEventListener('visibilitychange',hidden);stop()}},[]);
 async function prepare(){const C=constructor();if(!C?.install)return;setPreparing(true);setMessage('Preparando el reconocimiento local del navegador…');try{const installed=await C.install({langs:['es-ES'],processLocally:true});setAvailability(installed?'available':'unavailable');setMessage(installed?'Voz local lista. Puedes activar Hola Balta.':'No se pudo preparar la voz local. Usa el botón de conversación.')}catch{setMessage('Este navegador no pudo preparar el reconocimiento local.')}finally{setPreparing(false)}}
 async function start(){if(active.current||availability!=='available')return;setMessage('');const C=constructor();if(!C)return;const gen=++generation.current;try{const value=await C.available!({langs:['es-ES'],processLocally:true});if(gen!==generation.current)return;if(value!=='available'){setAvailability(value);return}const r=new C();r.processLocally=true;r.lang='es-ES';r.continuous=true;r.interimResults=false;recognizer.current=r;active.current=true;let restarts=0;
 r.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal&&wakePhrase(e.results[i][0].transcript)){stop();callback.current();break}}};
 r.onerror=e=>{if(e.error==='no-speech')return;stop();setMessage(e.error==='not-allowed'?'Permite el micrófono para activar Hola Balta.':'La escucha local se detuvo. Puedes activar de nuevo o usar el botón.')};
 r.onend=()=>{if(!active.current)return;if(++restarts>3){stop();setMessage('La escucha local se detuvo. Actívala de nuevo cuando la necesites.');return}timer.current=setTimeout(()=>{if(active.current)try{r.start()}catch{stop()}},400)};r.start();setListening(true);
 }catch{stop();setMessage('No se pudo iniciar la escucha local. Usa Hablar con Balthazar.')}}
 return {availability,listening,message,preparing,start,stop,prepare};
}
