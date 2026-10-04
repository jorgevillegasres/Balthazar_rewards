import {authenticated} from '../../../lib/auth';
import {isSameOrigin} from '../../../lib/access';
import {repository} from '../../../lib/repository';
import {openVoice,voiceLeases,armVoiceDeadline,hangupVoice,readVoiceTicket} from '../../../lib/voice-session';
export const dynamic='force-dynamic';export const runtime='nodejs';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function POST(request:Request){
 if(!isSameOrigin(request))return json({error:'Solicitud no permitida.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Formato inválido.'},415);
 let owner='';let creating=false;
 try{
  const auth=await authenticated();if(!auth)return json({error:'Vuelve a entrar a Balthazar.',signIn:true},401);owner=auth.user.id;
  const body=await request.text();if(body.length>35000)return json({error:'Solicitud demasiado grande.'},413);const input=JSON.parse(body);const key=process.env.OPENAI_API_KEY;if(!key)return json({error:'Falta activar OpenAI en Render.'},503);
  if(input.action==='end'){
   if(typeof input.ticket!=='string')return json({error:'Solicitud inválida.'},400);const ticket=readVoiceTicket(input.ticket,owner,key);await hangupVoice(ticket.callId,key);const lease=voiceLeases.get(owner);if(lease?.callId===ticket.callId){clearTimeout(lease.timer);voiceLeases.delete(owner)}return json({closed:true});
  }
  if(input.action!=='start'||input.consent!==true||!Number.isInteger(input.revision)||input.revision<0||typeof input.sdp!=='string'||input.sdp.length>30000||!input.sdp.startsWith('v=0'))return json({error:'Acepta el envío de voz y revisa la solicitud.'},400);
  if(voiceLeases.has(owner))return json({error:'Ya hay una conversación abierta. Termínala o espera cinco minutos.'},409);
  voiceLeases.set(owner,{});creating=true;
  const snapshot=await repository(auth.client).read(owner);if(snapshot.revision!==input.revision)return json({error:'Tu espacio cambió. Actualiza antes de conversar.',conflict:true},409);
  const {data:remaining,error}=await auth.client.rpc('balthazar_reserve_ai');if(error)throw Error('VOICE_LIMIT');if(typeof remaining!=='number'||remaining<=0)return json({error:'Alcanzaste el límite diario de consultas y aperturas de voz.'},429);
  if(request.signal.aborted)return json({error:'La apertura fue cancelada.'},409);
  const result=await openVoice(snapshot.state,owner,input.sdp,key);armVoiceDeadline(owner,result.callId,key,result.deadline);creating=false;
  if(request.signal.aborted){await hangupVoice(result.callId,key);const lease=voiceLeases.get(owner);if(lease?.callId===result.callId){clearTimeout(lease.timer);voiceLeases.delete(owner)}return json({error:'La apertura fue cancelada.'},409)}
  return json({sdp:result.sdp,ticket:result.ticket,deadline:result.deadline,remaining:remaining-1});
 }catch(e){const message=e instanceof Error?e.message:'';if(message==='INVALID_TICKET'||e instanceof SyntaxError)return json({error:'Solicitud inválida.'},400);console.error('balthazar_voice_failure',JSON.stringify({code:['VOICE_QUOTA','VOICE_LIMIT','VOICE_PROVIDER','VOICE_CLOSE_FAILED'].includes(message)?message:'OTHER'}));return json({error:message==='VOICE_QUOTA'?'OpenAI no pudo abrir la conversación. Revisa saldo y límites.':'No pudimos conectar la voz. Puedes seguir usando Balthazar por escrito.'},503)}finally{if(creating&&owner)voiceLeases.delete(owner)}
}
