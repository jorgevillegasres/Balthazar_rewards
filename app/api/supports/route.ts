import {authenticated} from '../../../lib/auth';
import {repository} from '../../../lib/repository';
import {createSupportHandlers} from '../../../lib/support-handlers';
export const dynamic='force-dynamic';
const handlers=createSupportHandlers({authenticate:authenticated,read:(client,owner)=>repository(client).read(owner)});
export const GET=handlers.GET;
export const POST=handlers.POST;
export const DELETE=handlers.DELETE;
