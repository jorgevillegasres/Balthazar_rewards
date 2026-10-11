import {z} from 'zod';

import {requestSchema,type Proposal} from './assistant.ts';

import type {State} from '../app/lib/domain.ts';

export const harnessRequestSchema=requestSchema.extend({operationId:z.string().uuid(),source:z.enum(['text','voice']),mode:z.enum(['auto','review']),userText:z.string().max(5000).optional()}).strict();

export type HarnessRequest=z.infer<typeof harnessRequestSchema>;
export function transcriptionForTurn(itemId:string,event:{type?:string;item_id?:string;transcript?:unknown}){return itemId&&event.type==='conversation.item.input_audio_transcription.completed'&&event.item_id===itemId&&typeof event.transcript==='string'?event.transcript.slice(0,5000):null;}

const normalize=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

function mentions(text:string,name:string,label:string){const escaped=normalize(name).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp('\\b'+label+'\\s+(?:llamado\\s+)?[\"«“\']?'+escaped+'(?:[\"»”\']|(?=$|[\\s,.;:]))').test(text)}
export function canExecute(input:HarnessRequest,proposal:Proposal,s?:State){

 if(input.mode!=='auto'||proposal.questions.length)return false;

 const text=normalize(input.source==='voice'?input.userText||'':input.text);

 if(!text||/[?¿]/.test(text)||/\b(no|nunca|sin guardar|sin aplicar|quizas|tal vez|podrias|podria|manana|pasado manana|proxima|proximo|luego|pronto|lunes|martes|miercoles|jueves|viernes|sabado|domingo|si|cuando)\b/.test(text))return false;

 if(/\ben\s+(?:\d+|un|una|dos|tres|cuatro|cinco|seis|siete)\s+(?:dias?|semanas?|meses?)\b/.test(text))return false;

 if(input.source==='voice'){
  if(input.kind==='day'){
   const durations=[...text.matchAll(/\b(\d{1,3})\s*(minutos?|min|horas?)\b/g)];
   if(durations.length!==1||Number(durations[0][1])*(durations[0][2].startsWith('hora')?60:1)!==input.minutes)return false;
   const energy=text.match(/\b(?:energia\s+(alta|media|baja)|(alta|media|baja)\s+energia)\b/);
   if(input.energy!==(energy?(energy[1]||energy[2]):s?.profile.energy))return false;
  }

  if(input.kind==='capture'&&(input.projectId? !s?.projects.some(p=>p.id===input.projectId&&mentions(text,p.name,'proyecto')):!text.includes('sin proyecto')))return false;

  if(input.kind==='task'&&!s?.tasks.some(t=>t.id===input.taskId&&mentions(text,t.title,'(?:tarea|mision)')))return false;

 }

 if(input.kind==='capture')return input.projectId!==undefined&&(/^(captura|capturar|guarda|guardar)\b/.test(text)||/^(crea|crear|anade|agrega)\s+(?:(?:un|una|unos|unas|el|la|los|las|nuevos|nuevas)\s+)?(?:tareas?|misiones?|pendientes?)\b/.test(text))&&proposal.tasks.length>0;

 if(input.kind==='day')return /^(aplica|aplicar|guarda|guardar|organiza|organizar)\s+(?:(?:mi|el|un|este|tu)\s+)?(?:plan|dia|hoy)\b/.test(text)&&proposal.items.length>0;

 return !!input.taskId&&(/^(divide|dividir|desglosa|desglosar)\b/.test(text)||/^(crea|crear|anade|agrega)\s+(?:(?:unas|las|nuevas)\s+)?subtareas?\b/.test(text))&&proposal.steps.length>0;

}

export function proposalCommand(s:State,input:Pick<HarnessRequest,'kind'|'taskId'>,proposal:Proposal){

 if(proposal.questions.length)throw Error('ESSENTIAL_QUESTIONS');

 if(input.kind==='day')return {type:'assistDay' as const,taskIds:proposal.items.map(i=>i.taskId)};

 const parent=input.kind==='task'?s.tasks.find(t=>t.id===input.taskId):undefined;

 if(input.kind==='task'&&(!parent||parent.parentId||parent.completed||['CANCELADA','ARCHIVADA','COMPLETADA'].includes(parent.status)))throw Error('TASK_UNAVAILABLE');

 const tasks=parent?proposal.steps.map(step=>({title:step.slice(0,160),nextAction:step,minutes:5,area:parent.area,projectId:parent.projectId,due:'',parentId:parent.id})):proposal.tasks;

 if(!tasks.length)throw Error('EMPTY_PROPOSAL');

 const titles=tasks.map(t=>normalize(t.title));

 if(new Set(titles).size!==titles.length||tasks.some(t=>s.tasks.some(old=>normalize(old.title)===normalize(t.title)&&!old.completed&&!['CANCELADA','ARCHIVADA'].includes(old.status)&&((old.parentId||'')===('parentId' in t?t.parentId:'')))))throw Error('DUPLICATE_TASK');

 return {type:'capture' as const,tasks};

}
