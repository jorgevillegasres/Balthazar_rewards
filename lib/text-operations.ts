export type PendingTextOperation={operationId:string;body:string};

// In-memory recovery only: no conversation is written to browser storage.
// Account keys isolate requests; matching IDs prevent late responses deleting new ones.
export function createTextOperationStore(){
 const pending=new Map<string,PendingTextOperation>();
 return {
  pending(owner:string){const operation=pending.get(owner);return operation?{...operation}:null},
  begin(owner:string,operation:PendingTextOperation){
   if(pending.has(owner))throw Error('UNRESOLVED_OPERATION');
   pending.set(owner,{...operation});
  },
  resolve(owner:string,operationId:string){if(pending.get(owner)?.operationId===operationId)pending.delete(owner)},
 };
}
export const textOperations=createTextOperationStore();
export function rejectedTextOperation(status:number,conflict:boolean){return status>=400&&status<500&&(status!==409||conflict)}
