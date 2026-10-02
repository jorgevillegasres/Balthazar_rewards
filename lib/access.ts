export function allowedEmail(email:string|undefined|null,owner:string|undefined){return !!email&&!!owner&&email.trim().toLowerCase()===owner.trim().toLowerCase()}
export function isSameOrigin(request:Request){const origin=request.headers.get('origin');return request.headers.get('sec-fetch-site')!=='cross-site'&&!!origin&&origin===new URL(request.url).origin}
