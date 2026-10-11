export const MAX_BACKUP_BYTES=64*1024*1024;
// Reserve room for the revision and request envelope around a full-size file.
export const MAX_BACKUP_REQUEST_BYTES=MAX_BACKUP_BYTES+1024;
export const BACKUP_SIZE_ERROR='El archivo excede 64 MB.';
export async function readBackupRequest(request:Request,maxBytes=MAX_BACKUP_REQUEST_BYTES){
 if(!request.body)return '';
 const reader=request.body.getReader(),decoder=new TextDecoder(),parts:string[]=[];
 let bytes=0;
 try{
  while(true){
   const {done,value}=await reader.read();
   if(done)break;
   bytes+=value.byteLength;
   if(bytes>maxBytes){await reader.cancel();throw Error(BACKUP_SIZE_ERROR)}
   parts.push(decoder.decode(value,{stream:true}));
  }
  parts.push(decoder.decode());
  return parts.join('');
 }finally{reader.releaseLock()}
}
