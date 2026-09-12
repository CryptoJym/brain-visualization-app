import puppeteer from 'puppeteer';
import {mkdirSync,writeFileSync} from 'node:fs';
const origin=process.env.CORTEX_TEST_ORIGIN||'http://127.0.0.1:5266';
const out='public/reports';mkdirSync(out,{recursive:true});
const browser=await puppeteer.launch({headless:'new'});
const click=async(page,text)=>{for(const b of await page.$$('button'))if((await b.evaluate(e=>e.textContent.trim()))===text){await b.click();return;}throw Error(text);};
try{
 const page=await browser.newPage();await page.setViewport({width:1440,height:1200,deviceScaleFactor:2});
 await page.goto(origin,{waitUntil:'networkidle0'});await page.waitForSelector('[data-model="loaded"]',{timeout:35000});
 await page.addStyleTag({content:'.cc-hero{display:block!important}.cc-hero-copy{display:none!important}.cc-hero-brain{width:682px!important;margin:auto}.cc-brain-stage{width:680px!important;height:430px!important}.cc-brain-view-label,.cc-region-label,.cc-region-leader{display:none!important}'});
 const receipts=[];
 for(const [name,mode,view] of [['surface','Surface','Left'],['right','Surface','Right'],['cutaway','Cutaway','Left'],['deep','Deep structures','Left']]){
  await click(page,'Reset');await click(page,mode);if(name!=='deep')await click(page,view);
  await new Promise(r=>setTimeout(r,700));const stage=await page.$('.cc-brain-stage');
  await stage.screenshot({path:`${out}/brain-${name}.webp`,type:'webp',quality:86});
  receipts.push({name,...await page.$eval('[data-model]',e=>({...e.dataset}))});
 }
 writeFileSync('.local-evidence/reports-v6/plate-receipt.json',JSON.stringify(receipts,null,2));console.log(JSON.stringify(receipts,null,2));
}finally{await browser.close();}
