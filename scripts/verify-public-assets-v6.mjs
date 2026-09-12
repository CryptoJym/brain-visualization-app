import puppeteer from 'puppeteer';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base='https://cortexcompass.utlyze.com';
const root='.local-evidence/reports-v6/independent-release/final-no-transform-snapshot/dist';
const files=['index.html','assets/index-BIOLmgzY.js','assets/index-uVpgWzTi.css','assets/react-vendor-nf7bT_Uh.js','assets/three-vendor-DGIq9hDf.js','models/cortex-brain-v5-mobile.glb','models/cortex-brain-v5.glb','reports/Cortex-Compass-Superhero-Sample.pdf','reports/Cortex-Compass-Scientific-Sample.pdf','reports/brain-surface.jpg','reports/brain-right.jpg','reports/brain-cutaway.jpg','reports/brain-deep.jpg'];
const browser=await puppeteer.launch({headless:'new'});const rows=[];
try{
 const page=await browser.newPage();await page.goto(base,{waitUntil:'domcontentloaded',timeout:45000});
 for(const file of files){
  const result=await page.evaluate(async file=>{
   const r=await fetch(file==='index.html'?'/':'/'+file,{cache:'no-cache'}),bytes=await r.arrayBuffer();
   const sha256=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
   return {status:r.status,bytes:bytes.byteLength,sha256,contentType:r.headers.get('content-type'),headers:file==='index.html'?Object.fromEntries(r.headers):undefined};
  },file);
  const expected=createHash('sha256').update(readFileSync(`${root}/${file}`)).digest('hex');
  assert.equal(result.status,200,file);assert.equal(result.sha256,expected,file);
  rows.push({file,...result,matchesVerifiedArtifact:true});console.log('VERIFIED',file,result.bytes);
 }
}finally{await browser.close();}
const receipt={verifiedAt:new Date().toISOString(),origin:base,version:'46935ccd-8683-4f22-922b-543bdfc6eae6',files:rows};
writeFileSync('.local-evidence/reports-v6/independent-release/public-assets-final.json',JSON.stringify(receipt,null,2));
