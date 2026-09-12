import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{SECURITY_HEADERS} from '../worker/index.js';
const request=new Request('https://example.test/');
test('HTML keeps body and MIME type, gains safety headers and revalidation',async()=>{
 const r=await worker.fetch(request,{ASSETS:{fetch:async()=>new Response('<main>Local reflection</main>',{headers:{'Content-Type':'text/html; charset=utf-8','ETag':'fixture'}})}});
 assert.equal(await r.text(),'<main>Local reflection</main>');assert.equal(r.status,200);assert.equal(r.headers.get('ETag'),'fixture');assert.equal(r.headers.get('Cache-Control'),'public, no-cache, no-transform');
 for(const [name,value] of Object.entries(SECURITY_HEADERS))assert.equal(r.headers.get(name),value);
});
test('hashed asset cache semantics are preserved',async()=>{
 const r=await worker.fetch(request,{ASSETS:{fetch:async()=>new Response('export default 1',{headers:{'Content-Type':'application/javascript','Cache-Control':'public, max-age=31536000, immutable'}})}});
 assert.equal(r.headers.get('Cache-Control'),'public, max-age=31536000, immutable');assert.equal(await r.text(),'export default 1');
});
test('asset errors remain errors and do not turn into success',async()=>{
 const r=await worker.fetch(request,{ASSETS:{fetch:async()=>new Response('Not found',{status:404})}});assert.equal(r.status,404);assert.equal(await r.text(),'Not found');
});

test('embedded model textures are permitted without external connect origins',()=>{
 const policy=SECURITY_HEADERS['Content-Security-Policy'];
 assert.match(policy,/connect-src 'self' blob:;/);
 assert.doesNotMatch(policy,/connect-src[^;]*(?:https?:|\*)/);
});
