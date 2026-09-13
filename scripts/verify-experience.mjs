import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const origin=process.env.CORTEX_TEST_ORIGIN||'http://127.0.0.1:5472',out=process.env.CORTEX_TEST_OUTPUT||'.local-evidence/development-v7/experience';mkdirSync(out,{recursive:true});
const checks=[],errors=[],failures=[];const check=(name,ok)=>{assert.ok(ok,name);checks.push(name);console.log('PASS '+name);};
const browser=await puppeteer.launch({headless:'new',timeout:60000});
const click=async(p,text)=>{await p.waitForFunction(t=>[...document.querySelectorAll('button')].some(e=>e.textContent.trim()===t&&!e.disabled),{timeout:20000},text);for(const b of await p.$$('button'))if(await b.evaluate(e=>e.textContent.trim())===text){await b.click();return;}};
const fit=p=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
try{
 for(const width of [320,390,768,1024,1440]){
 const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.setViewport({width,height:960,isMobile:width<700,hasTouch:width<700,deviceScaleFactor:1});await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});await p.waitForSelector('.cc-field-intro');
 check(`${width}px complete landing stays within viewport`,await fit(p));
 check(`${width}px two report edition previews`,await p.$$eval('.cc-edition',es=>es.length===2));
 check(`${width}px real preview action has touch-sized target`,await p.$eval('.cc-field-editions>.cc-primary',e=>e.getBoundingClientRect().height>=44));
 check(`${width}px reduced-motion controls disable transitions`,await p.$eval('.cc-primary',e=>getComputedStyle(e).transitionDuration==='0s'));
 if(width===390||width===1440){await p.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});await p.screenshot({path:`${out}/home-${width}.png`,fullPage:true});}
 await click(p,'Preview both report editions ↗');await p.waitForSelector('[data-report="superhero"]');check(`${width}px preview opens a fictional report`,!!await p.$('.cc-fictional'));
 check(`${width}px report journey current step`,await p.$eval('.cc-journey-rail li[aria-current=step]',e=>e.textContent.includes('Your field guide')));
 await click(p,'Scientific Report');check(`${width}px scientific report fits`,await fit(p));
 await click(p,'Back to overview');await click(p,'Start my reflection');await p.waitForSelector('.cc-context-screen');check(`${width}px context current step`,await p.$eval('.cc-journey-rail li[aria-current=step]',e=>e.textContent.includes('Your context')));
 if(width===390)await p.screenshot({path:`${out}/context-390.png`,fullPage:true});
 await p.select('[data-context-question=sexAssigned] select','male');await click(p,'Continue to experiences →');check(`${width}px assessment fits`,await fit(p));
 if(width===1440)await p.screenshot({path:`${out}/questionnaire-1440.png`});await p.close();
 }
 check('No page errors',errors.length===0);
}catch(e){failures.push(e.stack);process.exitCode=1;}finally{await browser.close();}
writeFileSync(`${out}/verification.json`,JSON.stringify({origin,observedAt:new Date().toISOString(),passed:checks.length,failed:failures.length,checks,errors,failures},null,2));console.log(JSON.stringify({passed:checks.length,errors,failures},null,2));
