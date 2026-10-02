import type {SupabaseClient} from '@supabase/supabase-js';
import {createRepository} from './state-repository';
import type {State} from '../app/lib/domain';
export function repository(client:SupabaseClient){return createRepository({
 async read(id){const {data,error}=await client.from('balthazar_state').select('data,revision').eq('user_id',id).maybeSingle();if(error)throw Error('STORAGE_UNAVAILABLE');return data?{state:data.data as State,revision:data.revision}:null},
 async insert(id,state){const {error}=await client.from('balthazar_state').upsert({user_id:id,data:state,revision:0},{onConflict:'user_id',ignoreDuplicates:true});if(error)throw Error('STORAGE_UNAVAILABLE')},
 async cas(id,revision,state){const {data,error}=await client.from('balthazar_state').update({data:state,revision:revision+1,updated_at:new Date().toISOString()}).eq('user_id',id).eq('revision',revision).select('revision').maybeSingle();if(error)throw Error('STORAGE_UNAVAILABLE');return !!data}
})}
