import {fresh,rollover,apply,type State,type Command} from '../app/lib/domain.ts';
import {parseBackup} from './backup.ts';
export type Snapshot={state:State;revision:number};
export interface Storage{read(id:string):Promise<Snapshot|null>;insert(id:string,state:State):Promise<void>;cas(id:string,revision:number,state:State):Promise<boolean>}
export function createRepository(storage:Storage){
 async function read(id:string){let snapshot=await storage.read(id);if(!snapshot){await storage.insert(id,fresh());snapshot=await storage.read(id)}if(!snapshot)throw Error('STORAGE_UNAVAILABLE');return {...snapshot,state:rollover(snapshot.state,Date.now())}}
 async function mutate(id:string,revision:number,command:Command){const current=await read(id);if(current.state.applied.includes(command.id)||(command.type==='redeem'&&current.state.redemptions.some(r=>r.id===command.id)))return current;if(current.revision!==revision)throw Error('CONFLICT');const state=apply(current.state,command);if(!await storage.cas(id,revision,state))throw Error('CONFLICT');return {state,revision:revision+1}}
 async function restore(id:string,revision:number,backup:unknown){const state=parseBackup(backup);const current=await read(id);if(current.revision!==revision)throw Error('CONFLICT');const s=current.state;if(s.tasks.length||s.projects.length||s.sessions.length||s.redemptions.length||s.points||s.xp||s.victories||s.focus)throw Error('EMPTY_REQUIRED');if(!await storage.cas(id,revision,state))throw Error('CONFLICT');return {state,revision:revision+1}}
 return {read,mutate,import:restore};
}
