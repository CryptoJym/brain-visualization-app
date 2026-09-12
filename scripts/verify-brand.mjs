import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const origin=process.env.CORTEX_TEST_ORIGIN||'http://127.0.0.1:5396';
const out=process.env.CORTEX_TEST_OUTPUT||'.local-evidence/brand/browser';mkdirSync(out,{recursive:true});
const checks=[],errors=[],failures=[];
const check=(name,value)=>{assert.ok(value,name);checks.push(name);console.log('PASS',name);};
const click=async(p,text)=>{await p.waitForFunction(t=>[...document.querySelectorAll('button')].some(e=>e.textContent.trim()===t&&!e.disabled),{timeout:20000},text);for(const b of await p.$$('button'))if(await b.evaluate(e=>e.textContent.trim())===text){await b.click();return;}};
const loadLogos=async p=>{await p.waitForSelector('.cc-identity img');await p.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.cc-identity img')].map(e=>e.decode()));});};
const browser=await puppeteer.launch({headless:'new',timeout:60000});
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,300));});
 await page.setViewport({width:1440,height:1040});await page.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});await loadLogos(page);
 check('Header uses approved SVG identity',await page.$eval('.cc-nav .cc-identity img',e=>e.currentSrc.includes('logo-lockup-dark.svg')&&e.alt==='Cortex Compass'&&e.naturalWidth>0&&Math.abs(e.naturalWidth/e.naturalHeight-1370/270)<.05));
 check('Old diamond placeholder replaced',await page.$('.cc-nav .cc-mark')===null);
 check('Versioned SVG, ICO and PNG favicon links',await page.$$eval('link[rel="icon"]',es=>es.length===3&&es.every(e=>e.href.includes('cc-brand-20260912'))));
 check('Apple home-screen icon declared',await page.$eval('link[rel="apple-touch-icon"]',e=>e.sizes.value==='180x180'));
 check('Social logo image declared',await page.$eval('meta[property="og:image"]',e=>e.content.includes('/brand/social-card.png')));
 for(const path of ['favicon.svg','favicon.ico','apple-touch-icon.png','brand/favicon-32.png','brand/favicon-192.png','brand/favicon-512.png','brand/icon-maskable-512.png','brand/logo-lockup-light.svg','brand/logo-lockup-dark.svg','brand/social-card.png','site.webmanifest','reports/Cortex-Compass-Superhero-Sample.pdf','reports/Cortex-Compass-Scientific-Sample.pdf']){
  const result=await page.evaluate(async path=>{const r=await fetch('/'+path);const b=await r.arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(v=>v.toString(16).padStart(2,'0')).join('');return {status:r.status,type:r.headers.get('content-type'),hash,bytes:b.byteLength};},path);
  check(`Served asset bytes match: ${path}`,result.status===200&&result.hash===createHash('sha256').update(readFileSync('public/'+path)).digest('hex'));
  if(path.endsWith('.svg'))check('SVG is served as an image: '+path,result.type.includes('image/svg+xml'));
 }
 const manifest=await page.evaluate(async()=>fetch('/site.webmanifest').then(r=>r.json()));check('Manifest has normal and maskable icons',manifest.icons.length===3&&manifest.icons.some(i=>i.purpose==='maskable'));
 await page.screenshot({path:`${out}/home-desktop.png`});
 await click(page,'Explore sample profile');await click(page,'Choose my reports');await loadLogos(page);
 check('Superhero mastheads use light-background logo',await page.$$eval('.cc-paper-brand .cc-identity img',es=>es.length===2&&es.every(e=>e.currentSrc.includes('logo-lockup-light.svg'))));
 await click(page,'Scientific Report');await loadLogos(page);check('Scientific mastheads all branded',await page.$$eval('.cc-paper-brand',es=>es.length>=8&&es.every(e=>e.querySelector('.cc-identity img')?.naturalWidth>0)));
 await page.emulateMediaType('print');await loadLogos(page);check('Print selects navy/teal light artwork',await page.$$eval('.cc-paper-brand img',es=>es.every(e=>e.currentSrc.includes('logo-lockup-light.svg'))));await page.emulateMediaType('screen');
 await click(page,'Edit strengths & friction');await loadLogos(page);check('Present-day reflection uses same logo',!!await page.$('.cc-insight-screen .cc-identity'));
 for(const width of [320,390,768,1440]){
  const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.setViewport({width,height:844,deviceScaleFactor:1,isMobile:width<700,hasTouch:width<700});await p.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});await loadLogos(p);
  check(`${width}px header stays within viewport`,await p.$eval('.cc-nav .cc-identity',e=>{const b=e.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth&&b.height>25;}));
  check(`${width}px no horizontal overflow`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await (await p.$('.cc-nav')).screenshot({path:`${out}/header-${width}.png`});if(width===390)await p.screenshot({path:`${out}/home-mobile.png`});
  await click(p,'Research & methods');await loadLogos(p);check(`${width}px research header branded`,!!await p.$('.cc-evidence-screen .cc-identity'));
  await click(p,'← Back to reflection');await click(p,'Begin my reflection →');await loadLogos(p);check(`${width}px assessment header branded`,!!await p.$('.cc-assessment .cc-identity'));
  await p.close();
 }
 check('No browser errors',errors.length===0);
}catch(e){failures.push(e.stack);process.exitCode=1;}finally{await browser.close();}
const result={origin,observedAt:new Date().toISOString(),passed:checks.length,failed:failures.length,checks,errors,failures};writeFileSync(`${out}/verification.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
