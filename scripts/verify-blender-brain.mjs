import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import puppeteer from 'puppeteer';
const origin=process.env.CORTEX_TEST_ORIGIN||'http://127.0.0.1:5188';
const out=process.env.CORTEX_TEST_OUTPUT||'.local-evidence/blender-v2';
mkdirSync(out,{recursive:true});
const passed=[],failures=[],errors=[];
const record=(name,value)=>{assert.ok(value,name);passed.push(name);};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const click=async(page,text)=>{
  for(const button of await page.$$('button')) if((await button.evaluate(e=>e.textContent.trim()))===text){await button.click();return;}
  throw new Error(`Button not found: ${text}`);
};
const browser=await puppeteer.launch({headless:'new'});
try {
  const page=await browser.newPage();await page.setViewport({width:1440,height:1100,deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errors.push(m.text());});
  await page.goto(origin,{waitUntil:'domcontentloaded',timeout:25000});
  await page.waitForSelector('[data-model="loaded"]',{timeout:35000});await wait(700);
  const state=()=>page.$eval('.cc-brain-canvas',e=>({...e.dataset}));
  record('Blender v2 asset loaded',(await state()).version==='cc-blender-5.0');
  record('47 named region meshes',(await state()).meshes==='47');
  record('Refined mesh triangle budget',Number((await state()).triangles)>50000);
  record('Stage is not compressed by legacy CSS',await page.$eval('.cc-brain-stage',e=>e.clientHeight>=430));
  record('Desktop no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`${out}/after-home.png`});
  await page.evaluate(()=>{window.__testCanvas=document.querySelector('canvas');});
  await page.select('.cc-brain-region-selector select','hippocampus');await wait(350);
  record('Deep-region choice opens cutaway',(await state()).mode==='cutaway');
  record('Hippocampus selection retained',(await state()).selected==='hippocampus');
  record('No renderer remount on selection',await page.evaluate(()=>window.__testCanvas===document.querySelector('canvas')));
  await page.screenshot({path:`${out}/after-cutaway.png`});
  await click(page,'Deep structures');await wait(300);
  record('Exploded deep view',(await state()).mode==='deep');
  await page.screenshot({path:`${out}/after-deep.png`});
  for(const id of ['dlpfc','acc','amygdala','hippocampus','insula','thalamus','hypothalamus','pag','temporal','cerebellum']){
    await page.select('.cc-brain-region-selector select',id);await wait(90);
    record(`Region selection: ${id}`,(await state()).selected===id);
  }
  await page.select('.cc-brain-region-selector select','dlpfc');await wait(100);
  record('Cortical selection returns to surface',(await state()).mode==='surface');
  const cameraImages=[];
  for(const label of ['Left','Right','Top','Front']){
    await click(page,label);await wait(220);
    const image=await page.$eval('canvas',c=>c.toDataURL());cameraImages.push(createHash('sha256').update(image).digest('hex'));
    record(`Camera preset: ${label}`,await page.$$eval('button',(es,t)=>es.some(e=>e.textContent===t&&e.getAttribute('aria-pressed')==='true'),label));
  }
  record('Camera presets produce different rendered views',new Set(cameraImages).size===4);
  await click(page,'Reset');await wait(100);
  const box=await (await page.$('canvas')).boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+85,box.y+box.height/2+20,{steps:8});await page.mouse.up();
  record('Drag does not accidentally select a region',(await state()).selected==='');
  await page.focus('canvas');await page.keyboard.press('ArrowLeft');await page.keyboard.press('+');
  record('Keyboard camera remains available',await page.$eval('canvas',c=>document.activeElement===c));
  await click(page,'Explore sample profile');await page.waitForSelector('[data-model="loaded"]',{timeout:35000});await wait(400);
  record('Report uses desktop detail asset',(await state()).lod==='desktop');
  record('Report headings retained',await page.evaluate(()=>document.body.innerText.includes('Patterns, not predictions.')));
  await page.select('.cc-brain-region-selector select','amygdala');await wait(150);
  record('Report selection callback displays region',await page.$eval('.cc-selected-info',e=>e.textContent.includes('Amygdala')));
  await page.screenshot({path:`${out}/after-report.png`,fullPage:true});
  await page.emulateMediaType('print');record('Brain remains present in print',await page.$eval('canvas',c=>c.getBoundingClientRect().height>0));await page.emulateMediaType('screen');
  record('No browser or shader errors',errors.length===0);
  const mobile=await browser.newPage();await mobile.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:1});
  await mobile.goto(origin,{waitUntil:'domcontentloaded',timeout:25000});await mobile.waitForSelector('[data-model="loaded"]',{timeout:35000});await wait(400);
  record('Mobile selects reduced geometry',await mobile.$eval('.cc-brain-canvas',e=>e.dataset.lod==='mobile'));
  record('Mobile no horizontal overflow',await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await mobile.select('.cc-brain-region-selector select','insula');await wait(150);
  record('Mobile deep-region selection',await mobile.$eval('.cc-brain-canvas',e=>e.dataset.selected==='insula'&&e.dataset.mode==='cutaway'));
  await mobile.screenshot({path:`${out}/after-mobile.png`,fullPage:true});await mobile.close();
  const broken=await browser.newPage();await broken.setRequestInterception(true);
  broken.on('request',request=>request.url().includes('cortex-brain-v5')&&request.url().endsWith('.glb')?request.abort('failed'):request.continue());
  await broken.goto(origin,{waitUntil:'domcontentloaded',timeout:25000});await broken.waitForSelector('[data-model="failed"]',{timeout:35000});
  record('Model failure explicitly shown',await broken.evaluate(()=>document.body.innerText.includes('3D view unavailable')));
  await broken.select('.cc-brain-region-selector select','thalamus');
  record('Region guide works after failed download',await broken.$eval('.cc-brain-explanation',e=>e.textContent.includes('Thalamus')));await broken.close();
}catch(error){failures.push(error.stack);process.exitCode=1;}
finally{await browser.close();}
const result={origin,passed:passed.length,failed:failures.length,checks:passed,failures,errors};
writeFileSync(`${out}/verification.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
