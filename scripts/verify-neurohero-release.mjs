import puppeteer from 'puppeteer';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='.local-evidence/neurohero-v9',manifest=JSON.parse(readFileSync(`${root}/release-hashes.json`));
const files=Object.keys(manifest.files).filter(p=>p.startsWith('dist/')).map(p=>p.slice(5)).filter(p=>p==='index.html'||p.startsWith('assets/')||['favicon.svg','site.webmanifest','reports/Cortex-Compass-Neurohero-Sample.pdf','reports/Cortex-Compass-Hero-Card-Sample.pdf','reports/Cortex-Compass-Neurohero-Scientific-Sample.pdf'].includes(p));
const origin='https://cortexcompass.utlyze.com',browser=await puppeteer.launch({headless:'new',timeout:60000}),rows=[];
try{const p=await browser.newPage();await p.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});
 for(const file of files){const r=await p.evaluate(async file=>{const response=await fetch(file==='index.html'?'/':'/'+file,{cache:'no-cache'}),bytes=await response.arrayBuffer();return {status:response.status,type:response.headers.get('content-type'),cache:response.headers.get('cache-control'),csp:response.headers.get('content-security-policy'),sha256:[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('')};},file);assert.equal(r.status,200,file);assert.equal(r.sha256,manifest.files['dist/'+file],file);if(file==='index.html'){assert.ok(r.cache.includes('no-transform'));assert.ok(r.csp.includes("script-src 'self'"));}rows.push({file,sha256:r.sha256,status:r.status});console.log('MATCH',file);}
}finally{await browser.close();}
const receipt={origin,at:new Date().toISOString(),files:rows};writeFileSync(`${root}/public-assets.json`,JSON.stringify(receipt,null,2));
