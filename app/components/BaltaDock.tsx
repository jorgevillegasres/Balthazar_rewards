'use client';
import {Mic,MessageSquare,ArrowUpRight,Sparkles} from 'lucide-react';
import type {State} from '../lib/domain';
import {BalthazarMark} from './PersonalConsole';

export default function BaltaDock({s,voice,write,day,divide,memory,profile,activity,compact=false}:{s:State;voice:()=>void;write:()=>void;day:()=>void;divide:()=>void;memory:()=>void;profile:()=>void;activity:()=>void;compact?:boolean}){
 const count=s.balta?.memories.length??0;
 return <section className={'balta-dock'+(compact?' balta-dock-compact':'')} aria-label="Trabajar con Balta">
  {!compact&&<div className="balta-head"><span className="balta-sigil"><BalthazarMark/></span><div><h2>Balta</h2><p>TEXTO Y VOZ</p></div></div>}
  <div className="balta-body"><h3>Hablemos.</h3><p>Podemos ordenar el día, revisar una misión o pensar juntos.</p><button className="button full" onClick={voice}><Mic size={17}/>Hablar con Balta</button><button className="button secondary full" onClick={write}><MessageSquare size={17}/>Escribir a Balta</button></div>
  <div className="balta-help"><div className="eyebrow"><Sparkles size={15}/>UN SIGUIENTE PASO</div>{[["Organizar mi día",day],["Dividir una misión",divide],["Guardar un recuerdo",memory]].map(([label,action])=><button className="balta-link" key={label as string} onClick={action as ()=>void}>{label as string}<ArrowUpRight size={16}/></button>)}</div>
  <div className="balta-foot"><strong>Tu contexto, a tu elección.</strong><p>{count} {count===1?'recuerdo guardado':'recuerdos guardados'}. {s.balta?.profile.useInAssistant?'Perfil y recuerdos habilitados para consultas nuevas.':'Puedes elegir qué compartir con Balta.'}</p><div><button className="text-button" onClick={profile}>Perfil y recuerdos</button><button className="text-button" onClick={activity}>Ver actividad</button></div></div>
 </section>;
}
