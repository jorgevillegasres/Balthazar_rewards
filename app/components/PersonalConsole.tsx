'use client';
import {useEffect, useState} from 'react';
import {ArrowUpRight, Fingerprint, Inbox, ScanLine} from 'lucide-react';
import type {State,Task} from '../lib/domain';

export function BalthazarMark(){
 return <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M12 3h24l10 21-10 21H12L2 24Z" stroke="currentColor" strokeWidth="2"/><path d="M17 13h9c8 0 8 11 0 11h-9m0 0h10c8 0 8 11 0 11H17V13" stroke="currentColor" strokeWidth="3"/><path d="M36 3h-8" stroke="var(--accent)" strokeWidth="4"/></svg>
}

export default function PersonalConsole({s,profile,capture,plan,start,resume,busy}:{s:State;profile:()=>void;capture:()=>void;plan:()=>void;start:(task:Task)=>void;resume:()=>void;busy:boolean}){
 const [now,setNow]=useState<Date|null>(null);
 useEffect(()=>{setNow(new Date());const timer=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(timer)},[]);
 const zone=s.profile.timezone;
 const parts=now?new Intl.DateTimeFormat('es-CO',{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now):[];
 const hour=parts.find(p=>p.type==='hour')?.value??'––',minute=parts.find(p=>p.type==='minute')?.value??'––';
 const date=now?new Intl.DateTimeFormat('es-CO',{timeZone:zone,weekday:'long',day:'2-digit',month:'long'}).format(now):'Cargando hora local';
 const d=s.days[s.lastDay],inbox=s.tasks.filter(t=>t.status==='INBOX').length;
 const primary=s.tasks.find(t=>t.id===d.missions[0]);
 const message=s.focus?'Tu sesión sigue disponible. Retómala cuando estés listo.':primary&&!primary.completed?'Tu prioridad está lista. Empieza por una sola acción.':inbox?`Tienes ${inbox} ${inbox===1?'tarea por organizar':'tareas por organizar'}. Prepara tus misiones cuando quieras.`:d.done.length?'Ya avanzaste hoy. Puedes continuar o registrar tu cierre.':'Estoy listo. Captura lo que tienes pendiente y definamos el siguiente paso.';
 const action=s.focus?{label:'Retomar enfoque',run:resume}:primary&&!primary.completed?{label:'Empezar prioridad',run:()=>start(primary)}:inbox?{label:'Preparar misiones',run:plan}:{label:'Capturar un pendiente',run:capture};
 return <section className="personal-console" aria-label="Consola personal">
  <div className="clock-panel console-panel"><div className="panel-label"><span>HORA LOCAL</span><span>{zone.split('/').at(-1)?.replaceAll('_',' ')}</span></div><time className="local-clock" dateTime={now?.toISOString()}><span>{hour}</span><span className="clock-colon">:</span><span>{minute}</span><small>24H</small></time><div className="clock-date">{date}</div></div>
  <button className="identity-panel console-panel" onClick={profile} aria-label="Abrir mi perfil"><div className="panel-label"><span>USUARIO ACTIVO</span><ArrowUpRight size={17}/></div><div className="identity-body"><div className="identity-seal"><Fingerprint size={58}/><span>{s.profile.name.charAt(0).toUpperCase()}</span></div><div><strong>{s.profile.name}</strong><span>ESPACIO PERSONAL</span></div></div><div className="identity-footer"><ScanLine size={15}/>Tu ritmo. Tus prioridades.</div></button>
  <div className="assistant-panel console-panel"><div className="panel-label"><span>BALTHAZAR</span><span className="assistant-dot" aria-hidden="true"/></div><p>{message}</p><button className="text-button" disabled={busy} onClick={action.run}><Inbox size={16}/>{action.label}<ArrowUpRight size={15}/></button></div>
 </section>
}
