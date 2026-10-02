import {serverClient} from '../../../../lib/supabase/server';
import {isSameOrigin} from '../../../../lib/access';
export async function POST(request:Request){if(!isSameOrigin(request))return Response.json({error:'Solicitud no permitida.'},{status:403});const client=await serverClient();await client.auth.signOut();return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}})}
