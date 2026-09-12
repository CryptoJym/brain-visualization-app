import puppeteer from 'puppeteer';
import {exportReportPDF} from './report-pdf-export-v6.mjs';
import {mkdirSync} from 'node:fs';
const origin=process.env.CORTEX_TEST_ORIGIN||'http://127.0.0.1:5266';
const out=process.env.CORTEX_TEST_OUTPUT||'.local-evidence/reports-v6/browser';mkdirSync(out,{recursive:true});
console.log('Export target:',JSON.stringify({origin,out}));
const browser=await puppeteer.launch({headless:'new',timeout:60000});
const click=async(page,text)=>{await page.waitForFunction(t=>[...document.querySelectorAll('button')].some(e=>e.textContent.trim()===t&&!e.disabled),{timeout:15000},text);for(const b of await page.$$('button'))if(await b.evaluate(e=>e.textContent.trim())===text){await b.click();return;}};
try{
 const page=await browser.newPage();await page.setViewport({width:1440,height:1050});
 await page.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});await click(page,'Explore sample profile');await click(page,'Choose my reports');
 for(const [kind,title] of [['Superhero','Superhero Report'],['Scientific','Scientific Report']]){
  await click(page,title);await page.waitForFunction(()=>[...document.querySelectorAll('.cc-atlas-plate img')].every(i=>i.complete&&i.naturalWidth>0),{timeout:15000});
  await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.cc-report-document img')].map(i=>i.decode()));});
  for(const format of ['A4','Letter']){await exportReportPDF(page,`${out}/Cortex-Compass-${kind}-${format}.pdf`,format);console.log(kind,format,'exported');}
 }
}finally{await browser.close();}
