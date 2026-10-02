import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
export async function serverClient(){const jar=await cookies();const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw Error('SUPABASE_NOT_CONFIGURED');return createServerClient(url,key,{cookies:{getAll:()=>jar.getAll(),setAll:values=>{for(const {name,value,options} of values)jar.set(name,value,options)}}})}
