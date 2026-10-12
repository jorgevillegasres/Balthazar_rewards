import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh} from '../app/lib/domain.ts';
import {askOpenAI} from '../lib/openai.ts';
import {openVoice} from '../lib/voice-session.ts';

async function voiceRequest(){
 let session;
 await openVoice(fresh(),'fixture-owner','v=0\r\n','test-only-key',async(url,init)=>{
  session=JSON.parse(init.body.get('session'));
  return new Response('v=0\r\nanswer',{status:201,headers:{location:'/v1/realtime/calls/rtc_fixture'}});
 });
 return session;
}
test('new voice sessions request Cedar and retain Spanish, interruption and bounded tools',async()=>{
 const session=await voiceRequest();
 assert.equal(session.audio.output.voice,'cedar');
 assert.equal(session.audio.input.transcription.language,'es');
 assert.equal(session.audio.input.turn_detection.interrupt_response,true);
 assert.equal(session.max_output_tokens,800);
 assert.deepEqual(session.tools.map(t=>t.name),['organize_day','capture_tasks','split_task','remember_information']);
 assert.ok(!JSON.stringify(session).includes('test-only-key'));
});
test('voice delivery requests masculine expressive speech and respects requested seriousness',async()=>{
 const session=await voiceRequest();
 assert.match(session.instructions,/registro masculino medio-grave/);
 assert.match(session.instructions,/satírico|sarcástico/);
 assert.match(session.instructions,/histriónico/);
 assert.match(session.instructions,/tierno/);
 assert.match(session.instructions,/pide seriedad/);
 assert.match(session.instructions,/solo afirma que se guardó cuando la herramienta devuelve Guardado/);
});
test('all text operations share voice personality without decorating task titles or changing JSON contracts',async()=>{
 const voice=await voiceRequest(),personality=voice.instructions.split('# Personalidad\n')[1]?.split('\n# Entrega')[0];
 assert.ok(personality,'Voice request must include its defined personality');
 for(const kind of ['capture','task','day']){
  let body;
  await askOpenAI({kind,text:'Contexto ficticio'},'test-only-key','fixture-model',async(url,init)=>{
   body=JSON.parse(init.body);
   return Response.json({status:'completed',output:[{content:[{type:'output_text',text:'{"summary":"Propuesta ficticia"}'}]}]});
  });
  assert.ok(body.instructions.includes(personality));
  assert.match(body.instructions,/humor principalmente en summary/);
  assert.match(body.instructions,/títulos de tareas/);
  assert.equal(body.text.format.strict,true);assert.equal(body.store,false);
  assert.equal(body.text.format.schema.additionalProperties,false);
 }
});
