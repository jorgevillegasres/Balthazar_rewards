import test from 'node:test';
import assert from 'node:assert/strict';
import {askOpenAI} from '../lib/openai.ts';
test('each assistant mode requests only fields that belong to its operation',async()=>{
 const fields={capture:['summary','questions','tasks'],task:['summary','questions','nextAction','steps'],day:['summary','questions','items']};
 for(const kind of Object.keys(fields)){
  let body;await askOpenAI({kind},'fake','model',async(url,init)=>{body=JSON.parse(init.body);return Response.json({status:'completed',output:[{content:[{type:'output_text',text:'{}'}]}]})});
  assert.deepEqual(Object.keys(body.text.format.schema.properties).sort(),fields[kind].sort());
  assert.equal(body.text.format.schema.additionalProperties,false);
 }
});
test('provider failures carry only bounded diagnostic metadata without response contents',async()=>{
 let failure;
 try{await askOpenAI({kind:'capture'},'fake','model',async()=>Response.json({error:{code:'invalid_api_key',type:'authentication_error',param:null,message:'PRIVATE_INPUT_AND_SECRET'}},{status:401}))}catch(e){failure=e}
 assert.deepEqual(failure.diagnostic,{httpStatus:401,code:'invalid_api_key'});
 assert.ok(!JSON.stringify(failure).includes('PRIVATE_INPUT_AND_SECRET'));
 try{await askOpenAI({kind:'capture'},'fake','model',async()=>Response.json({status:'incomplete',incomplete_details:{reason:'max_output_tokens'},output:[]}))}catch(e){failure=e}
 assert.deepEqual(failure.diagnostic,{responseStatus:'incomplete',reason:'max_output_tokens'});
 try{await askOpenAI({kind:'capture'},'fake','model',async()=>Response.json({error:{code:'PRIVATE_UNEXPECTED_CODE',message:'PRIVATE_INPUT'}},{status:400}))}catch(e){failure=e}
 assert.deepEqual(failure.diagnostic,{httpStatus:400,code:'other'});
});
test('provider receives structured bounded request without storage and parses output text',async()=>{let call;const result=await askOpenAI({kind:'capture',text:'Leer'},'fake-test-key','gpt-5-mini-2025-08-07',async(url,init)=>{call={url,...JSON.parse(init.body)};return Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'{"summary":"Leer"}'}]}]})});assert.equal(result.summary,'Leer');assert.equal(call.store,false);assert.equal(call.max_output_tokens,2800);assert.equal(call.text.format.strict,true);assert.ok(!JSON.stringify(call).includes('fake-test-key'))});
test('provider refuses incomplete, refusal and rate limited responses without retries',async()=>{for(const [response,error] of [[Response.json({status:'incomplete',output:[]}),'AI_INVALID_RESPONSE'],[Response.json({status:'completed',output:[{content:[{type:'refusal'}]}]}),'AI_REFUSAL'],[new Response('',{status:429}),'AI_RATE_LIMIT']]){let calls=0;await assert.rejects(askOpenAI({kind:'capture'},'fake','model',async()=>{calls++;return response}),new RegExp(error));assert.equal(calls,1)}});

