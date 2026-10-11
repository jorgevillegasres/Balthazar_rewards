import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import {readBackupRequest,BACKUP_SIZE_ERROR} from '../lib/backup-transfer.ts';

const origin='https://auth.example.test';
process.env.BALTHAZAR_APP_ORIGIN=origin;
process.env.BALTHAZAR_OWNER_EMAIL='owner@example.test';
const routeUrl=new URL('../app/api/auth/route.ts',import.meta.url);
// Run the real handler, stubbing only the server-only session client. Relative
// helpers still load their production implementations; no network is involved.
let source=await readFile(routeUrl,'utf8');
source=source.replace(/import \{serverClient\} from '[^']+';/,`
export const calls=[];
async function serverClient(){calls.push('client');return {auth:{
 signInWithPassword:async(input)=>{calls.push(['password',input]);return {error:null}},
 signInWithOtp:async(input)=>{calls.push(['recover',input]);return {error:null}},
 verifyOtp:async(input)=>{calls.push(['code',input]);return {error:null}},
 signUp:async(input)=>{calls.push(['create',input]);return {data:{session:null},error:null}}
}}}
`);
source=source.replace(/from '([^']+)'/g,(match,path)=>path.startsWith('.')?`from '${new URL(path+'.ts',routeUrl).href}'`:match);
const {outputText}=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});
const {POST,calls}=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
const encoder=new TextEncoder();
function streamed(chunks,{foreign=false,cancelError=false}={}){
 let pulls=0,cancelled=false;
 const body=new ReadableStream({pull(controller){if(pulls===chunks.length){controller.close();return}controller.enqueue(chunks[pulls++])},cancel(){cancelled=true;if(cancelError)throw Error('cancel failed')}},{highWaterMark:0});
 const request=new Request(origin+'/api/auth',{method:'POST',headers:{origin:foreign?'https://foreign.test':origin},body,duplex:'half'});
 return {request,body,get pulls(){return pulls},get cancelled(){return cancelled}};
}
async function response(request,status,data){const result=await POST(request);assert.equal(result.status,status);assert.equal(result.headers.get('cache-control'),'private, no-store');assert.deepEqual(await result.json(),data)}
const credentials={email:'owner@example.test',password:'private-password'};

test('auth cancels a multi-chunk body immediately after exceeding 2000 bytes',async()=>{
 calls.length=0;
 const fixture=streamed([new Uint8Array(1000),new Uint8Array(1001),new Uint8Array(3000)]);
 await response(fixture.request,413,{error:'Solicitud inválida.'});
 assert.equal(fixture.cancelled,true);assert.equal(fixture.pulls,2);assert.equal(fixture.body.locked,false);assert.deepEqual(calls,[]);
});
test('auth byte limit counts UTF-8 bytes rather than decoded characters',async()=>{
 calls.length=0;const raw=JSON.stringify({...credentials,padding:'é'.repeat(1000)});
 assert.ok(raw.length<2000);assert.ok(encoder.encode(raw).length>2000);
 const fixture=streamed([encoder.encode(raw)]);
 await response(fixture.request,413,{error:'Solicitud inválida.'});assert.equal(fixture.cancelled,true);assert.deepEqual(calls,[]);
});
test('auth retains the 413 response even when cancellation rejects',async()=>{
 const fixture=streamed([new Uint8Array(2001)],{cancelError:true});
 await response(fixture.request,413,{error:'Solicitud inválida.'});assert.equal(fixture.cancelled,true);assert.equal(fixture.body.locked,false);
});
test('auth accepts exactly 2000 bytes with a multibyte character split across chunks',async()=>{
 calls.length=0;const base=JSON.stringify({...credentials,padding:'é'});
 const bytes=encoder.encode(base+' '.repeat(2000-encoder.encode(base).length));
 const split=bytes.indexOf(0xc3)+1;
 const fixture=streamed([bytes.slice(0,split),bytes.slice(split)]);
 await response(fixture.request,200,{ok:true});assert.equal(fixture.cancelled,false);assert.equal(fixture.body.locked,false);assert.equal(calls[0],'client');assert.equal(calls[1][0],'password');
});
test('auth preserves empty and malformed body responses without contacting auth',async()=>{
 for(const chunks of [[],[encoder.encode('{')]]){calls.length=0;const fixture=streamed(chunks);await response(fixture.request,503,{error:'El acceso no está disponible. Intenta de nuevo.'});assert.deepEqual(calls,[]);assert.equal(fixture.body.locked,false)}
 calls.length=0;await response(new Request(origin+'/api/auth',{method:'POST',headers:{origin}}),503,{error:'El acceso no está disponible. Intenta de nuevo.'});assert.deepEqual(calls,[]);
});
test('auth checks origin before consuming the request body',async()=>{
 calls.length=0;const fixture=streamed([new Uint8Array(3000)],{foreign:true});
 await response(fixture.request,403,{error:'Solicitud no permitida.'});assert.equal(fixture.pulls,0);assert.deepEqual(calls,[]);await fixture.body.cancel();
});
test('auth preserves create, recover, code, private-email and password behavior',async()=>{
 for(const [input,status,data,method] of [
  [{...credentials,mode:'create'},200,{confirm:true,message:'Revisa tu correo e introduce el código para confirmar tu acceso.'},'create'],
  [{email:credentials.email,mode:'recover'},200,{message:'Revisa tu correo. Introduce el código de acceso.'},'recover'],
  [{email:credentials.email,mode:'code',token:'123456'},200,{ok:true},'code'],
  [{...credentials,email:'foreign@example.test'},403,{error:'Este espacio tiene acceso privado.'},null],
  [{...credentials,password:'short'},400,{error:'Usa una contraseña de 12 a 128 caracteres.'},null],
  [{email:credentials.email,mode:'code',token:'bad'},400,{error:'Revisa el código.'},null]
 ]){calls.length=0;await response(streamed([encoder.encode(JSON.stringify(input))]).request,status,data);if(method)assert.equal(calls[1][0],method);else assert.ok(!calls.some(Array.isArray))}
});
test('backup reader retains its own error and accepts its exact byte limit',async()=>{
 const accepted=streamed([encoder.encode('é'),encoder.encode('a')]);assert.equal(await readBackupRequest(accepted.request,3),'éa');
 const rejected=streamed([new Uint8Array(4)]);await assert.rejects(readBackupRequest(rejected.request,3),{message:BACKUP_SIZE_ERROR});assert.equal(rejected.cancelled,true);assert.equal(rejected.body.locked,false);
 assert.equal(await readBackupRequest(new Request(origin)), '');
});
