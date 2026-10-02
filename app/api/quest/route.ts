import {authenticated} from '../../../lib/auth';
import {repository} from '../../../lib/repository';
import {isSameOrigin} from '../../../lib/access';
import type {Command} from '../../lib/domain';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET(){try{const auth=await authenticated();if(!auth)return json({error:'Entra a tu espacio personal.',signIn:true},401);return json({...await repository(auth.client).read(auth.user.id),owner:auth.user.id})}catch{return json({error:'No pudimos cargar tu progreso. Intenta de nuevo.'},503)}}
export async function POST(request:Request){
 if(!isSameOrigin(request))return json({error:'Solicitud no permitida.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Formato inválido.'},415);
 try{const auth=await authenticated();if(!auth)return json({error:'Tu sesión terminó. Vuelve a entrar.',signIn:true},401);const raw=await request.text();if(raw.length>40000)return json({error:'El texto es demasiado largo.'},413);const {revision,command}=JSON.parse(raw);if(!Number.isInteger(revision)||revision<0||!command||typeof command.type!=='string'||typeof command.id!=='string'||!command.id||command.id.length>160)return json({error:'Solicitud inválida.'},400);return json({...await repository(auth.client).mutate(auth.user.id,revision,command as Command),owner:auth.user.id})}catch(e){const message=e instanceof Error?e.message:'';if(message==='CONFLICT')return json({error:'Tu progreso cambió en otro dispositivo. Actualizamos los datos; vuelve a intentar.',conflict:true},409);if(message==='STORAGE_UNAVAILABLE'||message==='SUPABASE_NOT_CONFIGURED')return json({error:'El almacenamiento no está disponible. Intenta de nuevo.'},503);return json({error:e instanceof SyntaxError?'Solicitud inválida.':message||'No se pudo guardar.'},400)}
}
