import {serverClient} from '../../../lib/supabase/server';
import {allowedEmail,isSameOrigin} from '../../../lib/access';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
export async function POST(request:Request){
 if(!isSameOrigin(request))return json({error:'Solicitud no permitida.'},403);
 try{const raw=await request.text();if(raw.length>2000)return json({error:'Solicitud inválida.'},413);const {email,password,mode,token}=JSON.parse(raw);if(typeof email!=='string'||!allowedEmail(email,process.env.BALTHAZAR_OWNER_EMAIL))return json({error:'Este espacio tiene acceso privado.'},403);const client=await serverClient();
 if(mode==='code'){if(typeof token!=='string'||!/^\d{6,10}$/.test(token))return json({error:'Revisa el código.'},400);const {error}=await client.auth.verifyOtp({email:email.trim().toLowerCase(),token,type:'email'});if(error)return json({error:'El código no es válido o venció. Solicita otro.'},400);return json({ok:true})}
 if(mode==='recover'){const {error}=await client.auth.signInWithOtp({email:email.trim().toLowerCase(),options:{shouldCreateUser:false}});if(error)return json({error:'No pudimos enviar el código. Espera un momento e intenta de nuevo.'},400);return json({message:'Revisa tu correo. Introduce el código de acceso.'})}
 if(typeof password!=='string'||password.length<12||password.length>128)return json({error:'Usa una contraseña de 12 a 128 caracteres.'},400);
 if(mode==='create'){const {data,error}=await client.auth.signUp({email:email.trim().toLowerCase(),password});if(error)return json({error:'No se pudo crear el acceso. Revisa tu correo o intenta entrar.'},400);return json(data.session?{ok:true}:{confirm:true,message:'Revisa tu correo e introduce el código para confirmar tu acceso.'})}
 const {error}=await client.auth.signInWithPassword({email:email.trim().toLowerCase(),password});if(error)return json({error:'No pudimos entrar. Revisa tu correo y contraseña.'},400);return json({ok:true});
 }catch{return json({error:'El acceso no está disponible. Intenta de nuevo.'},503)}
}
