import {instructions,outputSchema} from './assistant.ts';
export class AIError extends Error{
 diagnostic:Record<string,string|number>;
 constructor(message:string,diagnostic:Record<string,string|number>){super(message);this.diagnostic=diagnostic}
}
const providerCodes=new Set(['invalid_api_key','insufficient_quota','rate_limit_exceeded','model_not_found','unsupported_parameter','invalid_value','invalid_json_schema','permission_denied']);
export async function askOpenAI(context:unknown,key:string,model=process.env.OPENAI_MODEL||'gpt-5-mini-2025-08-07',transport:typeof fetch=fetch){
 const response=await transport('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(30000),body:JSON.stringify({model,store:false,instructions,input:JSON.stringify(context),reasoning:{effort:'minimal'},max_output_tokens:2800,text:{format:{type:'json_schema',name:'balthazar_proposal',strict:true,schema:outputSchema}}})});
 if(!response.ok){const data=await response.json().catch(()=>null);const code=data?.error?.code;throw new AIError(response.status===429?'AI_RATE_LIMIT':'AI_PROVIDER',{httpStatus:response.status,code:providerCodes.has(code)?code:'other'})}
 const data=await response.json();if(data.status!=='completed'||!Array.isArray(data.output))throw new AIError('AI_INVALID_RESPONSE',{responseStatus:['incomplete','failed','completed'].includes(data.status)?data.status:'other',reason:['max_output_tokens','content_filter'].includes(data.incomplete_details?.reason)?data.incomplete_details.reason:'other'});
 const content=data.output.flatMap((item:{content?:unknown[]})=>item.content||[]);
 if(content.some((item:{type?:string})=>item.type==='refusal'))throw Error('AI_REFUSAL');
 const text=content.filter((item:{type?:string})=>item.type==='output_text').map((item:{text:string})=>item.text).join('');
 if(!text||text.length>20000)throw Error('AI_INVALID_RESPONSE');
 try{return JSON.parse(text)}catch{throw Error('AI_INVALID_RESPONSE')}
}
