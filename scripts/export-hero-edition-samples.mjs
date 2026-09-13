import puppeteer from 'puppeteer';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {exportReportPDF} from './report-pdf-export-v6.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');process.chdir(root);
const out=resolve(root,'.local-evidence/hero-editions/samples');mkdirSync(out,{recursive:true});const origin=process.env.CORTEX_TEST_ORIGIN||'http://127.0.0.1:5681';
const browser=await puppeteer.launch({headless:'new',timeout:60000});
const click=async(p,text)=>{await p.waitForFunction(t=>[...document.querySelectorAll('button')].some(e=>e.textContent.trim()===t&&!e.disabled),{timeout:20000},text);for(const b of await p.$$('button'))if(await b.evaluate(e=>e.textContent.trim())===text){await b.click();return;}};
try{const p=await browser.newPage();await p.setViewport({width:1440,height:1100});let posts=0;p.on('request',r=>{if(r.method()==='POST')posts++;});await p.goto(origin,{waitUntil:'domcontentloaded'});await click(p,'Explore hero sample');await p.select('.nh-signature-choice select','signal_cartographer');await click(p,'Build my hero field guide →');await p.click('.nh-image-availability .nh-image-consent input');await (await p.$('input[type=file]')).uploadFile(resolve(root,'public/reports/xai/Cortex-Compass-xAI-Signal-Cartographer.jpg'));await p.waitForSelector('[data-portrait-state="ready"]');await click(p,'Use this visual direction →');await p.waitForFunction(()=>document.querySelector('.nh-hero-atmosphere img')?.naturalWidth>0);
 assert.ok(await p.$eval('.cc-fictional',e=>e.textContent.includes('FICTIONAL')));
 for(const [edition,label] of [['Cinematic','Cinematic edition'],['Ink-Saving','Ink-saving edition']]){await click(p,label);await click(p,'Superhero Report');for(const format of ['A4','Letter'])await exportReportPDF(p,resolve(out,`Cortex-Compass-${edition}-Hero-${format}.pdf`),format);}
 await click(p,'Cinematic edition');await click(p,'Strengths-only card');await exportReportPDF(p,resolve(out,'Cortex-Compass-Cinematic-Strengths-Card.pdf'),'A4');await click(p,'Scientific Report');for(const format of ['A4','Letter'])await exportReportPDF(p,resolve(out,`Cortex-Compass-Cinematic-Scientific-${format}.pdf`),format);
 await click(p,'Ink-saving edition');await exportReportPDF(p,resolve(out,'Cortex-Compass-Ink-Saving-Scientific-A4.pdf'),'A4');assert.equal(posts,0);writeFileSync(resolve(out,'export.json'),JSON.stringify({origin,at:new Date().toISOString(),fictional:true,paidRequests:0,acceptedPortraitReused:true},null,2));console.log('Eight fictional sample editions exported with existing artwork and zero provider requests.');
}finally{await browser.close();}
