'use client';
import {useEffect, useState} from 'react';
import type {State,Task} from '../lib/domain';
import {inboxCount} from '../../lib/execution';

export function BalthazarMark(){
 return <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M12 3h24l10 21-10 21H12L2 24Z" stroke="currentColor" strokeWidth="2"/><path d="M17 13h9c8 0 8 11 0 11h-9m0 0h10c8 0 8 11 0 11H17V13" stroke="currentColor" strokeWidth="3"/><path d="M36 3h-8" stroke="var(--accent)" strokeWidth="4"/></svg>
}

export default function PersonalConsole({s}:{s:State;profile:()=>void;capture:()=>void;plan:()=>void;start:(task:Task)=>void;resume:()=>void;busy:boolean}){
 const [now,setNow]=useState<Date|null>(null);
 useEffect(()=>{setNow(new Date());const timer=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(timer)},[]);
 const zone=s.profile.timezone;
 const parts=now?new Intl.DateTimeFormat('es-CO',{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now):[];
 const hour=parts.find(p=>p.type==='hour')?.value??'––',minute=parts.find(p=>p.type==='minute')?.value??'––';
 const date=now?new Intl.DateTimeFormat('es-CO',{timeZone:zone,weekday:'long',day:'2-digit',month:'long'}).format(now):'Cargando hora local';
 const d=s.days[s.lastDay],inbox=inboxCount(s);
 const primary=s.tasks.find(t=>t.id===d.missions[0]);
 const message=s.focus?'Tu sesión sigue disponible. Retómala cuando estés listo.':primary&&!primary.completed?'Tu prioridad está lista. Empieza por una sola acción.':inbox?`Tienes ${inbox} ${inbox===1?'tarea por organizar':'tareas por organizar'}. Prepara tus misiones cuando quieras.`:d.done.length?'Ya avanzaste hoy. Puedes continuar o registrar tu cierre.':'Estoy listo. Captura lo que tienes pendiente y definamos el siguiente paso.';
 return <section className="console-status" aria-label="Estado de hoy"><BalthazarMark/><div><time dateTime={now?.toISOString()}>{hour}:{minute}</time><span>{date}</span></div><span className="console-status-note">{message}</span></section>
}
