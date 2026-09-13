// Reuse an existing fictional xAI portrait through the app's device importer. No sign-in or image generation.
import puppeteer from 'puppeteer';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {exportReportPDF} from './report-pdf-export-v6.mjs';
const origin='https://cortexcompass.utlyze.com',out='.local-evidence/xai-portraits/final-samples';mkdirSync(out,{recursive:true});
const browser=await puppeteer.launch({headless:'new',timeout:60000});
const click=async(p,text)=>{await p.waitForFunction(t=>[...document.querySelectorAll('button')].some(e=>e.textContent.trim()===t&&!e.disabled),{timeout:25000},text);for(const b of await p.$$('button'))if(await b.evaluate(e=>e.textContent.trim())===text){await b.click();return;}};
try{
 const p=await browser.newPage();await p.setViewport({width:1440,height:1100});let calls=0;p.on('request',r=>{if(r.method()==='POST')calls++;});
 await p.goto(origin,{waitUntil:'domcontentloaded'});await click(p,'Explore hero sample');await p.select('.nh-signature-choice select','signal_cartographer');await click(p,'Build my hero field guide →');
 for(const [label,value] of [['Hero presentation','woman'],['Skin tone','medium'],['Build','athletic'],['Hair','curly'],['Setting','mountain-observatory']])await p.select(`select[aria-label="${label}"]`,value);
 await p.click('.nh-image-availability .nh-image-consent input');await(await p.$('input[type=file]')).uploadFile(resolve('.local-evidence/xai-portraits/live/live-xai-hero.png'));
 await p.waitForSelector('[data-portrait-state="ready"]',{timeout:20000});await click(p,'Use this visual direction →');await p.waitForSelector('[data-portrait-state="ready"]',{timeout:20000});
 for(const paper of ['A4','Letter'])await exportReportPDF(p,`${out}/Cortex-Compass-xAI-Hero-Sample-${paper}.pdf`,paper);
 await click(p,'Strengths-only card');await p.waitForSelector('[data-portrait-state="ready"]',{timeout:20000});await p.waitForFunction(()=>document.querySelector('.nh-portrait img')?.naturalWidth>0);
 await exportReportPDF(p,`${out}/Cortex-Compass-xAI-Strengths-Card.pdf`,'A4');
 if(calls!==0)throw new Error('Unexpected POST during sample export');
 writeFileSync(`${out}/receipt.json`,JSON.stringify({origin,at:new Date().toISOString(),fictional:true,providerCalls:0,sourceImage:'.local-evidence/xai-portraits/live/live-xai-hero.png',note:'Actual xAI artwork reused in the app. Every sample has the fictional banner; no account credentials or real personal history used.'},null,2));
 console.log('Fictional A4/Letter hero guides and portrait-bearing strengths card exported. No paid request made.');
}finally{await browser.close();}
