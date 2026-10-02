import {instructions,outputSchema} from './assistant.ts';
export async function askOpenAI(context:unknown,key:string,model=process.env.OPENAI_MODEL||'gpt-5-mini-2025-08-07',transport:typeof fetch=fetch){
 const response=await transport('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(30000),body:JSON.stringify({model,store:false,instructions,input:JSON.stringify(context),reasoning:{effort:'minimal'},max_output_tokens:2800,text:{format:{type:'json_schema',name:'balthazar_proposal',strict:true,schema:outputSchema}}})});
 if(!response.ok)throw Error(response.status===429?'AI_RATE_LIMIT':'AI_PROVIDER');
 const data=await response.json();if(data.status!=='completed'||!Array.isArray(data.output))throw Error('AI_INVALID_RESPONSE');
 const content=data.output.flatMap((item:{content?:unknown[]})=>item.content||[]);
 if(content.some((item:{type?:string})=>item.type==='refusal'))throw Error('AI_REFUSAL');
 const text=content.filter((item:{type?:string})=>item.type==='output_text').map((item:{text:string})=>item.text).join('');
 if(!text||text.length>20000)throw Error('AI_INVALID_RESPONSE');
 try{return JSON.parse(text)}catch{throw Error('AI_INVALID_RESPONSE')}
}
