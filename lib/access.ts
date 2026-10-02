export function allowedEmail(email:string|undefined|null,owner:string|undefined){return !!email&&!!owner&&email.trim().toLowerCase()===owner.trim().toLowerCase()}
export function isSameOrigin(request:Request,configuredOrigin=process.env.BALTHAZAR_APP_ORIGIN){
 const origin=request.headers.get('origin');
 if(!origin||request.headers.get('sec-fetch-site')==='cross-site')return false;
 if(!configuredOrigin&&process.env.NODE_ENV==='production')return false;
 try{const expected=new URL(configuredOrigin||request.url);return ['http:','https:'].includes(expected.protocol)&&origin===expected.origin}catch{return false}
}
