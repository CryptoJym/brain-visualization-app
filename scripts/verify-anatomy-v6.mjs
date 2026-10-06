// Browser acceptance for anatomy v6: every pick is drawn and labelled, deep view stays in its
// panel, no console or CSP errors, print keeps the brain. Writes screenshots, contact sheets and
// verification.json to CORTEX_TEST_OUTPUT.
// Run against the production headers: npm run build && node scripts/serve-dist-with-worker.mjs 5682
//   CORTEX_TEST_ORIGIN=http://127.0.0.1:5682 node scripts/verify-anatomy-v6.mjs
// CORTEX_CHROME may point at a local Chrome for Testing binary.
import puppeteer from 'puppeteer';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {REGIONS,REGION_BY_ID} from '../src/data/anatomyCatalog.mjs';
import {MODEL_VERSION} from '../src/data/brainModel.mjs';

const origin=process.env.CORTEX_TEST_ORIGIN||'http://127.0.0.1:5682';
const out=resolve(process.env.CORTEX_TEST_OUTPUT||'.local-evidence/anatomy-v6/verify');
mkdirSync(out,{recursive:true});
const passed=[],failures=[],errors=[],picks=[];
const record=(name,ok,detail='')=>{(ok?passed:failures).push(detail?`${name} — ${detail}`:name);if(!ok)console.error('FAIL',name,detail);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const DESKTOP={width:1440,height:1000,deviceScaleFactor:1};
const PHONE={width:375,height:812,deviceScaleFactor:2,isMobile:true,hasTouch:true};
const PHONE_PICKS=['amygdala','hippocampus','insula','putamen','caudate','pag','acc','callosum','motor','visual'];

const browser=await puppeteer.launch({headless:'new',executablePath:process.env.CORTEX_CHROME||undefined,
  args:['--use-angle=metal','--ignore-gpu-blocklist'],protocolTimeout:180000});
async function newPage(viewport,label){
  const page=await browser.newPage();await page.setViewport(viewport);
  page.on('console',m=>{if(m.type()==='error')errors.push(`${label}: ${m.text()}`);});
  page.on('pageerror',e=>errors.push(`${label}: ${e.message}`));
  page.on('requestfailed',r=>{if(!r.url().includes('/api/'))errors.push(`${label}: request failed ${r.url()} ${r.failure()?.errorText}`);});
  return page;
}
const clickText=async(page,text,scope='')=>{
  for(const b of await page.$$(`${scope} button`))if((await b.evaluate(e=>e.textContent.trim()))===text){await b.click();return;}
  throw new Error(`Button not found: ${text}`);
};
const state=(page,scope)=>page.$eval(`${scope} .cc-brain-canvas`,e=>({...e.dataset}));
async function ready(page,scope){
  await page.waitForFunction(s=>['loaded','failed','unavailable'].includes(document.querySelector(`${s} .cc-brain-canvas`)?.dataset.model),{timeout:90000},scope);
  const s=await state(page,scope);
  record(`${scope} model loads (${s.lod})`,s.model==='loaded'&&s.version===MODEL_VERSION&&s.meshes==='47',JSON.stringify({model:s.model,version:s.version,meshes:s.meshes,lod:s.lod}));
  await page.$eval(`${scope} .cc-brain-stage`,e=>e.scrollIntoView({block:'center'}));await wait(400);
}
// Settled = selection applied, visibility probe done (it runs ~120 ms after the camera settles).
async function settled(page,scope,id){
  // The viewer pauses while off-screen (IntersectionObserver), so keep its stage in view.
  await page.$eval(`${scope} .cc-brain-stage`,e=>e.scrollIntoView({block:'center'}));
  await page.waitForFunction((s,id)=>{
    const d=document.querySelector(`${s} .cc-brain-canvas`)?.dataset,label=document.querySelector(`${s} .cc-region-label`);
    if(!d||d.selected!==id)return false;if(id==='')return true;
    return Boolean(d.selectedVisible)&&d.selectedMeshes.split(',').includes(d.labelTarget)&&label?.dataset.target===d.labelTarget;
  },{timeout:15000},scope,id);
  await wait(450);return state(page,scope);
}
// No model pixel may touch the left or right edge of the canvas (the v5 deep view overflowed).
const edgeContact=(page,scope)=>page.$eval(`${scope} .cc-brain-canvas canvas`,canvas=>{
  const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;const ctx=c.getContext('2d');ctx.drawImage(canvas,0,0);
  const {data}=ctx.getImageData(0,0,c.width,c.height);let hits=0;
  for(let y=0;y<c.height;y++)for(const x of [0,1,c.width-2,c.width-1])if(data[(y*c.width+x)*4+3]>8)hits++;
  return hits;
});
async function shoot(page,scope,file){
  // captureBeyondViewport would resize the emulated phone viewport and scroll the page away.
  const stage=await page.$(`${scope} .cc-brain-stage`);await stage.screenshot({path:resolve(out,file),captureBeyondViewport:false});
  await page.$eval(`${scope} .cc-brain-stage`,e=>e.scrollIntoView({block:'center'}));return file;
}
async function pickAll(page,scope,ids,tag){
  for(const id of ids){
    await page.select(`${scope} .cc-brain-region-selector select`,id);
    const s=await settled(page,scope,id);
    const label=await page.$eval(`${scope} .cc-region-label`,e=>({text:e.textContent,opacity:getComputedStyle(e).opacity,target:e.dataset.target}));
    const file=await shoot(page,scope,`${tag}-${id}.png`);
    const ok=s.selectedVisible==='true'&&label.opacity==='1'&&Boolean(label.target)&&s.selectedMeshes.split(',').includes(label.target);
    picks.push({tag,id,mode:s.mode,visible:s.selectedVisible,label:label.target,meshes:s.selectedMeshes,cut:s.cut||'',file});
    record(`${tag}: ${id} is drawn, highlighted and labelled`,ok,`mode=${s.mode} visible=${s.selectedVisible} label→${label.target}`);
  }
}
async function contactSheet(rows,file,title,columns){
  const html=`<html><body style="margin:0;background:#06111c;color:#cfe6f1;font:13px system-ui"><h1 style="font-weight:500;font-size:18px;margin:14px">${title}</h1>
  <div style="display:grid;grid-template-columns:repeat(${columns},1fr);gap:10px;padding:0 14px 14px">${rows.map(r=>`<figure style="margin:0;background:#0b1c2b;border:1px solid #20384c;border-radius:8px;overflow:hidden">
  <img src="${pathToFileURL(resolve(out,r.file))}" style="width:100%;display:block"><figcaption style="padding:6px 8px"><b>${REGION_BY_ID[r.id]?.label||r.id}</b> · ${r.mode}${r.cut?` cut ${r.cut}`:''} · ${r.visible==='true'?'visible ✓':'NOT VISIBLE'}</figcaption></figure>`).join('')}</div></body></html>`;
  writeFileSync(resolve(out,file+'.html'),html);
  const page=await browser.newPage();await page.setViewport({width:columns*330,height:800});
  await page.goto(pathToFileURL(resolve(out,file+'.html')).href,{waitUntil:'load'});await page.screenshot({path:resolve(out,file),fullPage:true});await page.close();
}
try{
  // ---------------- desktop 1440 x 1000
  const desk=await newPage(DESKTOP,'desktop');
  await desk.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});
  const home='.cc-hero-brain';await ready(desk,home);
  for(const [mode,file] of [['Surface','desktop-home-surface.png'],['Cutaway','desktop-home-cutaway.png'],['Deep structures','desktop-home-deep.png']]){
    await clickText(desk,mode,home);await wait(900);await shoot(desk,home,file);
    if(mode==='Deep structures'){const hits=await edgeContact(desk,home);record('desktop home: deep view stays inside its panel',hits===0,`edge pixels ${hits}`);}
  }
  await pickAll(desk,home,REGIONS.map(r=>r.id),'desktop-home');
  await clickText(desk,'Deep structures',home);await wait(900);
  record('desktop home: deep view with a pick stays inside its panel',await edgeContact(desk,home)===0);
  record('desktop: no horizontal page overflow',await desk.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  // Results page: same explorer at the desktop level of detail, plus "show in 3D" chips.
  await clickText(desk,'Explore sample profile');
  const results='.cc-map-card';await ready(desk,results);
  record('results page uses the desktop asset',(await state(desk,results)).lod==='desktop');
  await clickText(desk,'Deep structures',results);await wait(900);
  record('desktop results: deep view stays inside its panel',await edgeContact(desk,results)===0);await shoot(desk,results,'desktop-results-deep.png');
  await pickAll(desk,results,REGIONS.map(r=>r.id),'desktop-results');
  const chips=await desk.$$eval('.cc-study-region[data-region-link]',es=>[...new Map(es.map(e=>[`${e.dataset.regionLink}|${e.dataset.side}`,{id:e.dataset.regionLink,side:e.dataset.side}])).values()]);
  record('results page offers show-in-3D chips',chips.length>0,`${chips.length} unique chips`);
  for(const chip of chips){
    await desk.$eval(`.cc-study-region[data-region-link="${chip.id}"][data-side="${chip.side}"]`,e=>e.click());
    const s=await settled(desk,results,chip.id);
    const file=await shoot(desk,results,`desktop-chip-${chip.id}-${chip.side}.png`);
    picks.push({tag:'desktop-chip',id:chip.id,side:chip.side,mode:s.mode,visible:s.selectedVisible,label:s.labelTarget,meshes:s.selectedMeshes,cut:s.cut||'',file});
    record(`desktop chip: ${chip.id} (${chip.side}) is drawn and labelled`,s.selectedVisible==='true'&&s.side===(['L','R'].includes(chip.side)?chip.side:'both'),`mode=${s.mode} meshes=${s.selectedMeshes}`);
    record(`desktop chip: ${chip.id} (${chip.side}) deep view stays inside its panel`,s.mode!=='deep'||await edgeContact(desk,results)===0);
  }
  // Print keeps a picture of the brain.
  await desk.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await desk.emulateMediaType('print');await wait(300);
  const printed=await desk.$eval('.cc-map-card .cc-brain-print-image',img=>img.getAttribute('src')?.startsWith('data:image/png')&&img.getBoundingClientRect().height>100);
  record('print view keeps the brain image',printed);
  const card=await desk.$('.cc-map-card');await card.screenshot({path:resolve(out,'desktop-results-print.png')});
  await desk.pdf({path:resolve(out,'results-print.pdf'),printBackground:true,format:'Letter'});
  await desk.emulateMediaType('screen');await desk.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
  // ---------------- phone 375 x 812
  const phone=await newPage(PHONE,'phone');
  await phone.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});
  await phone.waitForSelector('.cc-brain-poster');
  record('phone home starts with the poster, not the 3D download',await phone.$('.cc-hero-brain .cc-brain-canvas')===null);
  await clickText(phone,'Load interactive brain');await ready(phone,home);
  record('phone home loads the phone asset',(await state(phone,home)).lod==='mobile');
  await clickText(phone,'Deep structures',home);await wait(900);await shoot(phone,home,'phone-home-deep.png');
  record('phone home: deep view stays inside its panel',await edgeContact(phone,home)===0);
  await pickAll(phone,home,PHONE_PICKS,'phone-home');
  record('phone: no horizontal page overflow',await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await clickText(phone,'Explore sample profile');await ready(phone,results);
  await clickText(phone,'Deep structures',results);await wait(900);
  record('phone results: deep view stays inside its panel',await edgeContact(phone,results)===0);await shoot(phone,results,'phone-results-deep.png');
  await pickAll(phone,results,PHONE_PICKS,'phone-results');
  record('no console, CSP or network errors',errors.length===0,errors.slice(0,5).join(' | '));
  await contactSheet(picks.filter(p=>p.tag==='desktop-home'),'contact-desktop-home.png','Desktop 1440×1000 · home atlas · all 26 picks',6);
  await contactSheet(picks.filter(p=>p.tag==='desktop-results'),'contact-desktop-results.png','Desktop 1440×1000 · results explorer · all 26 picks',6);
  await contactSheet(picks.filter(p=>p.tag==='desktop-chip'),'contact-desktop-chips.png','Desktop 1440×1000 · results “show in 3D” chips',5);
  await contactSheet(picks.filter(p=>p.tag.startsWith('phone')),'contact-phone.png','Phone 375×812 · home and results picks',5);
}catch(error){failures.push(error.stack);process.exitCode=1;}
finally{await browser.close();}
if(failures.length)process.exitCode=1;
const result={origin,model:MODEL_VERSION,passed:passed.length,failed:failures.length,checks:passed,failures,errors,picks};
writeFileSync(resolve(out,'verification.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({origin,passed:passed.length,failed:failures.length,errors:errors.length},null,2));
