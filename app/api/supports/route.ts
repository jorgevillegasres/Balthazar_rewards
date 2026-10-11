import {authenticated} from '../../../lib/auth';
import {repository} from '../../../lib/repository';
import {createSupportHandlers} from '../../../lib/support-handlers';
export const dynamic='force-dynamic';
const handlers=createSupportHandlers({authenticate:authenticated,beginUpload:async(client,owner,taskId)=>{const repo=repository(client),snapshot=await repo.read(owner);return repo.mutate(owner,snapshot.revision,{id:crypto.randomUUID(),type:'supportIntent',taskId})},read:(client,owner)=>repository(client).read(owner)});
export const GET=handlers.GET;
export const POST=handlers.POST;
export const DELETE=handlers.DELETE;
