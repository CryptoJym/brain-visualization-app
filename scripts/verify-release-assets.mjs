import puppeteer from 'puppeteer';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const origin=process.env.CORTEX_TEST_ORIGIN||'https://cortexcompass.utlyze.com';
const root=process.env.CORTEX_RELEASE_ROOT||'.local-evidence/development-v7/publication-snapshot/dist';
const html=readFileSync(`${root}/index.html`,'utf8');
const assets=[...new Set([...html.matchAll(/(?:src|href)="\/(assets\/[^"?#]+)/g)].map(m=>m[1]))];
const files=['index.html',...assets,'favicon.svg','site.webmanifest','models/cortex-brain-v5-mobile.glb','models/cortex-brain-v5.glb','reports/Cortex-Compass-Superhero-Sample.pdf','reports/Cortex-Compass-Scientific-Sample.pdf'];
const rows=[],browser=await puppeteer.launch({headless:'new',timeout:60000});
try{const p=await browser.newPage();await p.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});
 for(const file of files){const result=await p.evaluate(async file=>{const r=await fetch(file==='index.html'?'/':'/'+file,{cache:'no-cache'}),b=await r.arrayBuffer();return {status:r.status,bytes:b.byteLength,sha256:[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(v=>v.toString(16).padStart(2,'0')).join(''),contentType:r.headers.get('content-type'),cacheControl:r.headers.get('cache-control'),csp:r.headers.get('content-security-policy')};},file);
 const expected=createHash('sha256').update(readFileSync(`${root}/${file}`)).digest('hex');assert.equal(result.status,200,file);assert.equal(result.sha256,expected,file);
 if(file==='index.html'){assert.match(result.cacheControl,/no-transform/);assert.match(result.csp,/script-src 'self'/);}rows.push({file,...result});console.log('VERIFIED',file,result.bytes);
 }
}finally{await browser.close();}
writeFileSync(process.env.CORTEX_ASSET_RECEIPT||'.local-evidence/development-v7/public-assets.json',JSON.stringify({origin,verifiedAt:new Date().toISOString(),verified:true,files:rows},null,2));
