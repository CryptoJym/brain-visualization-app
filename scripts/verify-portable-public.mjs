import {chromium} from '/Users/utlyze/Projects/freely-sweet/node_modules/playwright/index.mjs';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),origin='https://cortexcompass.utlyze.com';
const paths=['index.html','site.webmanifest','favicon.svg',...readdirSync(resolve(root,'dist/assets')).map(n=>'assets/'+n)];
const browser=await chromium.launch();const checked=[];
try{const page=await browser.newPage();await page.goto(origin,{waitUntil:'domcontentloaded'});
 for(const path of paths){const expected=createHash('sha256').update(readFileSync(resolve(root,'dist',path))).digest('hex');
  const result=await page.evaluate(async path=>{const r=await fetch('/'+path,{cache:'no-store'});const bytes=await r.arrayBuffer();const digest=await crypto.subtle.digest('SHA-256',bytes);return {status:r.status,sha256:Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,'0')).join('')};},path);
  assert.equal(result.status,200,path);assert.equal(result.sha256,expected,path);checked.push({path,sha256:expected});console.log('MATCH '+path);
 }
 const service=await page.evaluate(()=>fetch('/api/portraits/status',{cache:'no-store'}).then(r=>r.json()));
 assert.equal(service.available,true);assert.equal(service.authenticated,false);assert.equal(service.provider,'xAI');
 const result={origin,verifiedAt:new Date().toISOString(),files:checked,publicPortraitService:{available:true,authenticated:false,provider:'xAI'},paidRequests:0};
 writeFileSync(resolve(root,'.local-evidence/portable-profiles/public-hashes.json'),JSON.stringify(result,null,2));console.log('Public asset identity and existing xAI availability verified.');
}finally{await browser.close();}
