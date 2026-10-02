import {serverClient} from './supabase/server';
import {allowedEmail} from './access';
export async function authenticated(){const client=await serverClient();const {data:{user},error}=await client.auth.getUser();if(error||!user||!user.email_confirmed_at||!allowedEmail(user.email,process.env.BALTHAZAR_OWNER_EMAIL))return null;return {client,user}}
