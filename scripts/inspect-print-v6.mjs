import puppeteer from 'puppeteer';
const browser=await puppeteer.launch({headless:'new',timeout:60000});
try{
 const page=await browser.newPage();await page.setViewport({width:1440,height:1050});
 const click=async text=>{await page.waitForFunction(t=>[...document.querySelectorAll('button')].some(e=>e.textContent.trim()===t),{},text);for(const b of await page.$$('button'))if(await b.evaluate(e=>e.textContent.trim())===text){await b.click();break;}};
 await page.goto('http://127.0.0.1:5266/',{waitUntil:'domcontentloaded'});await click('Explore sample profile');await click('Choose my reports');await click('Scientific Report');await page.waitForSelector('[data-report="scientific"]');
 await page.emulateMediaType('print');await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('.cc-report-document img')].map(e=>e.decode()));});
 console.log(JSON.stringify(await page.evaluate(()=>({sheets:[...document.styleSheets].map(s=>s.href),nodes:['.cc-print-running-foot','.cc-paper-foot','.cc-science-cover h1','.cc-science-cover .cc-atlas-plate img'].map(q=>{const e=document.querySelector(q),s=getComputedStyle(e);return {q,display:s.display,size:s.fontSize,height:s.maxHeight,breakAfter:s.breakAfter};})})),null,2));
 await page.pdf({path:'.local-evidence/reports-v6/browser/Letter-diagnostic.pdf',format:'Letter',printBackground:true});
}finally{await browser.close();}
