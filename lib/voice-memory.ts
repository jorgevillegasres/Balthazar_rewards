import {z} from 'zod';

export const voiceMemoryInput=z.object({text:z.string().trim().min(1).max(400)}).strict();
export type MemoryDraft={kind:'memory';text:string;summary:string;questions:string[];revision:number;operationId:string};

export function memoryDraftForTurn(userTurn:string,userText:string,input:unknown,revision:number,operationId:string):MemoryDraft{
 if(!userTurn||!userText.trim())throw Error('Espera la transcripción del turno actual antes de proponer un recuerdo.');
 const text=userText.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const explicit=/^(?:(?:hola\s+)?(?:balta|balthazar|baltazar)[,\s]+)?(?:por favor[,\s]+)?(?:recuerda que|guarda este recuerdo\s*:?|no olvides que)\s+\S/.test(text);
 const negated=/\b(?:no|nunca)\s+(?:(?:quiero que|debes|puedes|vayas a)\s+)?(?:recuerd\w*|guard\w*|almacen\w*|conserv\w*)\b|\bsin\s+(?:guardar|recordar)\b/.test(text);
 if(!explicit||negated||/[?¿]/.test(text))throw Error('Necesito una petición explícita de recordar información; no se guardó nada.');
 const {text:memory}=voiceMemoryInput.parse(input);
 return {kind:'memory',text:memory,summary:'Recuerdo propuesto. Revisa el texto y pulsa Guardar recuerdo.',questions:[],revision,operationId};
}
