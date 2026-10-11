'use client';
import {useState} from 'react';
import {Target,Plus,Folder,Pencil,Archive,Link2} from 'lucide-react';
import type {State} from '../lib/domain';
import {purposeMetrics,type Purpose} from '../../lib/purposes';
import type {Act} from './useQuest';
import Dialog from './Dialog';

export default function Purposes({s,act,busy,error,project}:{s:State;act:Act;busy:boolean;error:string;project:(projectId:string)=>void}){
 const [tab,setTab]=useState<'active'|'archived'>('active');
 const [editing,setEditing]=useState<Purpose|'new'|null>(null);
 const [link,setLink]=useState<{projectId:string;purposeId:string}|null>(null);
 const purposes=s.purposes||[],selected=editing&&editing!=='new'?purposes.find(p=>p.id===editing.id):undefined;
 const linkedProject=link?s.projects.find(p=>p.id===link.projectId):undefined;
 const purposeName=(id?:string)=>purposes.find(p=>p.id===id)?.title||'Sin propósito';
 async function save(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();const fields=new FormData(event.currentTarget);
  if(await act({type:'purpose',purposeId:selected?.id,title:fields.get('title'),area:fields.get('area'),description:fields.get('description'),due:fields.get('due')}))setEditing(null);
 }
 return <>
  <div className="page-tools"><div className="tabs"><button className={tab==='active'?'selected':''} onClick={()=>setTab('active')}>Activos</button><button className={tab==='archived'?'selected':''} onClick={()=>setTab('archived')}>Archivados</button></div><button className="button" disabled={busy||purposes.length>=100} onClick={()=>setEditing('new')}><Plus size={18}/>Nuevo propósito</button></div>
  <p className="muted">Define el resultado que quieres alcanzar y conecta los proyectos que lo hacen posible.</p>
  <div className="project-grid purpose-grid">{purposes.filter(p=>p.status===tab).map(p=>{const m=purposeMetrics(s,p.id);return <article className="card purpose-card" key={p.id}>
   <div className="eyebrow"><Target size={18}/>{p.area}</div><h3>{p.title}</h3>{p.description&&<p>{p.description}</p>}{p.due&&<p className="small muted">Fecha objetivo: {p.due}</p>}
   {m.total?<><div className="progress" aria-label={`${m.completed} de ${m.total} acciones completadas`}><i style={{width:m.percent+'%'}}/></div><div className="spread small"><span>{m.completed} de {m.total} acciones completadas</span><strong>{m.percent}%</strong></div><p className="small muted">Este avance describe las acciones vinculadas; el resultado del propósito se revisa por separado.</p></>:<p className="small muted">Sin acciones vinculadas</p>}
   <div className="purpose-projects">{m.projects.map(pj=><button className="text-button" key={pj.id} onClick={()=>project(pj.id)}><Folder size={15}/>{pj.name}</button>)}</div>
   <div className="row-actions"><button className="button secondary" disabled={busy} onClick={()=>setEditing(p)}><Pencil size={15}/>Editar</button><button className="text-button" disabled={busy} onClick={()=>act({type:'purpose',purposeId:p.id,status:p.status==='active'?'archived':'active'})}><Archive size={15}/>{p.status==='active'?'Archivar':'Activar'}</button></div>
  </article>})}</div>
  {!purposes.some(p=>p.status===tab)&&<div className="empty"><Target/><h3>{tab==='active'?'Un propósito le da dirección a tus acciones.':'Aquí puedes consultar tus propósitos archivados.'}</h3>{tab==='active'&&<button className="button secondary" disabled={busy} onClick={()=>setEditing('new')}>Crear mi primer propósito</button>}</div>}
  <section className="card purpose-links" aria-label="Vínculos de proyectos"><div className="section-title"><h2><Link2 size={20}/>Proyectos y propósitos</h2></div><p className="muted small">Cada proyecto puede tener un propósito o quedar sin vínculo. Revisa y confirma cada cambio.</p>
   {s.projects.map(p=><div className="purpose-link-row" key={p.id}><button className="text-button" onClick={()=>project(p.id)}><Folder size={16}/>{p.name}</button><label>Propósito de {p.name}<select aria-label={'Propósito de '+p.name} disabled={busy} value={p.purposeId||''} onChange={e=>setLink({projectId:p.id,purposeId:e.target.value})}><option value="">Sin propósito</option>{purposes.map(purpose=><option key={purpose.id} value={purpose.id}>{purpose.title}{purpose.status==='archived'?' (archivado)':''}</option>)}</select></label></div>)}
   {!s.projects.length&&<p className="muted">Crea un proyecto desde Misiones para vincularlo a un propósito.</p>}
  </section>
  {editing&&<Dialog title={selected?'Editar propósito':'Crear propósito'} close={()=>setEditing(null)}><form onSubmit={save}><label>Título<input name="title" autoFocus required maxLength={160} defaultValue={selected?.title} placeholder="Terminar mi tesis"/></label><label>Área<select name="area" defaultValue={selected?.area||s.areas[0]}>{s.areas.map(area=><option key={area}>{area}</option>)}</select></label><label>Resultado esperado<textarea name="description" maxLength={1000} rows={3} defaultValue={selected?.description} placeholder="Describe cómo reconocerás el resultado."/></label><label>Fecha objetivo opcional<input type="date" name="due" defaultValue={selected?.due}/></label><p className="hint">El propósito no concede puntos ni XP. Al archivarlo, sus proyectos y acciones conservan su historial.</p><button className="button full" disabled={busy}>Guardar propósito</button>{error&&<p className="error-inline" role="alert">{error}</p>}</form></Dialog>}
  {link&&linkedProject&&<Dialog title="Confirmar vínculo" close={()=>setLink(null)}><h3>{linkedProject.name}</h3><div className="receipt"><div>Propósito actual <strong>{purposeName(linkedProject.purposeId)}</strong></div><div>Nuevo propósito <strong>{purposeName(link.purposeId)}</strong></div></div><p className="muted">Las tareas del proyecto heredarán este vínculo. El avance y el historial se conservan.</p><button className="button full" disabled={busy||linkedProject.purposeId===link.purposeId} onClick={async()=>{if(await act({type:'baltaAction',source:'text',summary:'Vincular proyecto a propósito',command:{type:'linkPurpose',projectId:link.projectId,purposeId:link.purposeId}}))setLink(null)}}>Confirmar cambio de vínculo</button>{error&&<p className="error-inline" role="alert">{error}</p>}</Dialog>}
 </>;
}
