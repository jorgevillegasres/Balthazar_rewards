import {createHmac,timingSafeEqual,createHash} from 'node:crypto';
import {voiceConfig,VOICE_SECONDS} from './voice.ts';
import type {State} from '../app/lib/domain.ts';

type Ticket={callId:string;owner:string;expires:number};
export function signVoiceTicket(ticket:Ticket,key:string){const data=Buffer.from(JSON.stringify(ticket)).toString('base64url');return data+'.'+createHmac('sha256',key).update('balthazar-voice:'+data).digest('base64url')}
export function readVoiceTicket(value:string,owner:string,key:string,now=Date.now()):Ticket{
 if(value.length>2000)throw Error('INVALID_TICKET');const [data,sig,...extra]=value.split('.');if(!data||!sig||extra.length)throw Error('INVALID_TICKET');const expected=createHmac('sha256',key).update('balthazar-voice:'+data).digest(),received=Buffer.from(sig,'base64url');if(received.length!==expected.length||!timingSafeEqual(received,expected))throw Error('INVALID_TICKET');const parsed=JSON.parse(Buffer.from(data,'base64url').toString()) as Ticket;if(parsed.owner!==owner||!/^[-\w]{1,200}$/.test(parsed.callId)||!Number.isFinite(parsed.expires)||parsed.expires<now)throw Error('INVALID_TICKET');return parsed;
}
export async function hangupVoice(callId:string,key:string,transport:typeof fetch=fetch){const r=await transport('https://api.openai.com/v1/realtime/calls/'+encodeURIComponent(callId)+'/hangup',{method:'POST',headers:{Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(10000)});await r.body?.cancel();if(!r.ok&&r.status!==404)throw Error('VOICE_CLOSE_FAILED')}
export async function openVoice(s:State,owner:string,sdp:string,key:string,transport:typeof fetch=fetch){
 const form=new FormData();form.set('sdp',sdp);form.set('session',JSON.stringify(voiceConfig(s,process.env.OPENAI_REALTIME_MODEL||'gpt-realtime-2.1')));
 const r=await transport('https://api.openai.com/v1/realtime/calls',{method:'POST',headers:{Authorization:`Bearer ${key}`,'OpenAI-Safety-Identifier':createHash('sha256').update(owner).digest('hex')},body:form,signal:AbortSignal.timeout(30000)});
 if(!r.ok){await r.body?.cancel();throw Error(r.status===429?'VOICE_QUOTA':'VOICE_PROVIDER')}
 const location=r.headers.get('location'),callId=location?.match(/\/calls\/([-\w]+)(?:\?|$)/)?.[1];let answer:string;try{answer=await r.text();if(!callId||!answer.startsWith('v=0')||answer.length>30000)throw Error('VOICE_PROVIDER')}catch{if(callId)await hangupVoice(callId,key,transport).catch(()=>{});throw Error('VOICE_PROVIDER')}
 const deadline=Date.now()+VOICE_SECONDS*1000;const ticket=signVoiceTicket({callId,owner,expires:deadline+600000},key);
 return {sdp:answer,ticket,deadline,callId};
}
type Lease={callId?:string;timer?:ReturnType<typeof setTimeout>};
const runtime=globalThis as typeof globalThis&{balthazarVoice?:Map<string,Lease>};
export const voiceLeases=runtime.balthazarVoice??=(new Map());
export function armVoiceDeadline(owner:string,callId:string,key:string,deadline:number){
 const lease:Lease={callId};let attempts=0;
 const stop=async()=>{try{await hangupVoice(callId,key);if(voiceLeases.get(owner)===lease)voiceLeases.delete(owner)}catch{if(++attempts<3){lease.timer=setTimeout(()=>{void stop()},10000);lease.timer.unref()}else{if(voiceLeases.get(owner)===lease)voiceLeases.delete(owner);console.error('balthazar_voice_close_failed')}}};
 lease.timer=setTimeout(()=>{void stop()},Math.max(0,deadline-Date.now()));lease.timer.unref();voiceLeases.set(owner,lease);
}
