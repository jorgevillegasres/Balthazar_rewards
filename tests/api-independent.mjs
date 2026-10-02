import assert from 'node:assert/strict';
const base=process.argv[2];if(!base||!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base))throw Error('Use a loopback server.');
for(const path of ['/api/quest','/api/backup']){let r=await fetch(base+path);assert.equal(r.status,401);r=await fetch(base+path,{headers:{'oai-authenticated-user-id':'forged','oai-authenticated-user-email':'forged@example.invalid'}});assert.equal(r.status,401);assert.match(r.headers.get('cache-control'),/no-store/)}
for(const path of ['/api/quest','/api/backup','/api/auth','/api/auth/signout']){const r=await fetch(base+path,{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body:'{}'});assert.equal(r.status,403)}
assert.equal((await fetch(base+'/api/health')).status,200);assert.equal((await fetch(base+'/login')).status,200);console.log('10 independent API checks passed: session required, forged headers refused, no-store, cross-origin, health and login.');
