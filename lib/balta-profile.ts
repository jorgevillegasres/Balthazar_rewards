import {z} from 'zod';
import {canonical,type State,type Command} from '../app/lib/domain.ts';

export const BALTA_LIMITS={preferredName:60,workingStyle:600,memoryText:400,memories:20} as const;
export const baltaProfileSchema=z.object({
 preferredName:z.string().trim().max(BALTA_LIMITS.preferredName),
 workingStyle:z.string().trim().max(BALTA_LIMITS.workingStyle),
 humor:z.enum(['lively','subtle','serious']),
 support:z.enum(['balanced','gentle','direct']),
 useInAssistant:z.boolean(),
}).strict();
const memoryIdSchema=z.string().trim().min(1).max(100);
const memoryTextSchema=z.string().trim().min(1).max(BALTA_LIMITS.memoryText);
const timestampSchema=z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const memorySchema=z.object({id:memoryIdSchema,text:memoryTextSchema,created:timestampSchema,updated:timestampSchema}).strict().refine(m=>m.updated>=m.created,{message:'La fecha de edición precede a la creación.'});
export const baltaSchema=z.object({profile:baltaProfileSchema,memories:z.array(memorySchema).max(BALTA_LIMITS.memories)}).strict().superRefine((value,ctx)=>{
 if(new Set(value.memories.map(m=>m.id)).size!==value.memories.length)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Los recuerdos deben tener identificadores únicos.'});
 if(new Set(value.memories.map(m=>canonical(m.text))).size!==value.memories.length)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Los recuerdos no pueden repetirse.'});
});
export type BaltaProfile=z.infer<typeof baltaProfileSchema>;
export type BaltaMemory=z.infer<typeof memorySchema>;
export type BaltaPersonalization=z.infer<typeof baltaSchema>;

export function getBalta(s:State):BaltaPersonalization{
 return s.balta?structuredClone(s.balta):{profile:{preferredName:'',workingStyle:'',humor:'lively',support:'balanced',useInAssistant:false},memories:[]};
}
export function baltaContext(s:State){
 const {profile,memories}=getBalta(s);
 if(!profile.useInAssistant)return null;
 const {preferredName,workingStyle,humor,support}=profile;
 return {preferredName,workingStyle,humor,support,memories:memories.map(m=>({text:m.text}))};
}
export function applyBalta(s:State,a:Command,now:number){
 const next=getBalta(s);
 if(a.type==='baltaProfile'){
  const parsed=baltaProfileSchema.safeParse(a.profile);
  if(!parsed.success)throw Error('Revisa el perfil de Balta y sus límites de texto.');
  next.profile=parsed.data;
 }else{
  if(a.confirmed!==true)throw Error('Confirma explícitamente el cambio de recuerdos.');
  if(a.type==='baltaRemember'){
   const parsed=memoryTextSchema.safeParse(a.text);
   if(!parsed.success)throw Error('Escribe un recuerdo de entre 1 y 400 caracteres.');
   if(!timestampSchema.safeParse(now).success)throw Error('La fecha del recuerdo no es válida.');
   let old:BaltaMemory|undefined;
   if(a.memoryId!==undefined){const id=memoryIdSchema.safeParse(a.memoryId);if(!id.success)throw Error('Identificador de recuerdo inválido.');old=next.memories.find(m=>m.id===id.data);if(!old)throw Error('El recuerdo no existe.');}
   if(next.memories.some(m=>m.id!==old?.id&&canonical(m.text)===canonical(parsed.data)))throw Error('Este recuerdo ya está guardado.');
   if(old){if(now<old.created)throw Error('La fecha del recuerdo no es válida.');old.text=parsed.data;old.updated=now;}
   else{if(next.memories.length>=BALTA_LIMITS.memories)throw Error('Puedes guardar hasta 20 recuerdos.');next.memories.push({id:crypto.randomUUID(),text:parsed.data,created:now,updated:now});}
  }else if(a.type==='baltaForget'){
   const id=memoryIdSchema.safeParse(a.memoryId);
   if(!id.success||!next.memories.some(m=>m.id===id.data))throw Error('El recuerdo no existe.');
   next.memories=next.memories.filter(m=>m.id!==id.data);
  }else if(a.type==='baltaForgetAll')next.memories=[];
  else throw Error('Acción de Balta no reconocida.');
 }
 s.balta=next;
}
