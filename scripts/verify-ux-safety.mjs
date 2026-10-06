import puppeteer from 'puppeteer';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {SECTIONS} from '../src/data/assessmentQuestions.mjs';

const origin=process.env.CORTEX_TEST_ORIGIN||'http://127.0.0.1:5791';
const out=resolve(process.env.CORTEX_TEST_OUTPUT||'.local-evidence/ux-safety');mkdirSync(out,{recursive:true});
const checks=[],errors=[],failures=[],journey=[],posts=[];
const check=(name,ok)=>{assert.ok(ok,name);checks.push(name);console.log('PASS '+name);};
const click=async(p,text,scope='')=>{
 await p.waitForFunction((t,s)=>[...document.querySelectorAll(`${s} button`)].some(b=>b.textContent.trim()===t&&!b.disabled),{},text,scope);
 for(const b of await p.$$(`${scope} button`))if(await b.evaluate(e=>e.textContent.trim())===text){await b.click();return;}
 throw new Error(`Missing button: ${text}`);
};
const route=async(p,hash)=>{await p.waitForFunction(h=>location.hash===h,{},hash);journey.push({hash,state:await p.evaluate(()=>history.state)});};
const screenshot=(p,name)=>p.screenshot({path:resolve(out,name+'.jpg'),type:'jpeg',quality:85});
const browser=await puppeteer.launch({headless:'new',timeout:60000});
async function page(width=1440,height=1000){
 const context=await browser.createIncognitoBrowserContext(),p=await context.newPage();
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 p.on('request',r=>{if(r.method()==='POST')posts.push(r.url());});
 await p.setViewport({width,height});await p.goto(origin,{waitUntil:'networkidle0',timeout:60000});await route(p,'#/welcome');
 return {context,p};
}
function axNodes(node){return [node,...(node.children||[]).flatMap(axNodes)];}
async function support(p,label){
 check(`${label}: support summary visible`,await p.$eval('.cc-support-now summary',e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.top<80&&r.height>=44;}));
 check(`${label}: no horizontal overflow`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await p.focus('.cc-support-now summary');await p.keyboard.press('Enter');await p.waitForFunction(()=>document.querySelector('.cc-support-now details').open);
 const links=await p.$$eval('.cc-support-options a',es=>es.map(e=>({href:e.getAttribute('href'),height:e.getBoundingClientRect().height,target:e.target,rel:e.rel})));
 assert.deepEqual(links.map(l=>l.href),['tel:988','sms:988','https://chat.988lifeline.org/','sms:741741','tel:911','https://findahelpline.com/']);
 check(`${label}: current support actions and usable targets`,links.every(l=>l.height>=44));
 check(`${label}: external support keeps this page open with no referrer`,links.filter(l=>l.href.startsWith('https:')).every(l=>l.target==='_blank'&&l.rel.includes('noreferrer')));
 const ax=await p.accessibility.snapshot({root:await p.$('.cc-support-now'),interestingOnly:false});
 writeFileSync(resolve(out,label+'-accessibility.json'),JSON.stringify(ax,null,2));
 check(`${label}: screen reader receives the expanded support disclosure`,axNodes(ax).some(n=>n.name?.includes('Need support now?')&&n.expanded===true));
 await p.keyboard.press('Tab');check(`${label}: keyboard reaches Call 988`,await p.evaluate(()=>document.activeElement.getAttribute('href')==='tel:988'));
 await screenshot(p,label+'-support-open');await p.keyboard.press('Escape');
 check(`${label}: Escape closes support and returns focus`,await p.evaluate(()=>!document.querySelector('.cc-support-now details').open&&document.activeElement.matches('.cc-support-now summary')));
 await screenshot(p,label);
 await p.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
 check(`${label}: support stays within reach while reading`,await p.$eval('.cc-support-now summary',e=>e.getBoundingClientRect().top>=0&&e.getBoundingClientRect().top<80));
 await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
}
async function leaveWarning(p,action){
 const client=await p.target().createCDPSession();
 let timer;
 const seen=new Promise((resolvePromise,reject)=>{
  timer=setTimeout(()=>reject(new Error(`No native ${action} warning`)),5000);
  p.once('dialog',async d=>{try{assert.equal(d.type(),'beforeunload');await d.dismiss();clearTimeout(timer);resolvePromise();}catch(e){clearTimeout(timer);reject(e);}});
 });
 try{await client.send(action==='close'?'Page.close':'Page.reload');await seen;check(`Native ${action} leave warning can be cancelled`,!p.isClosed());}
 finally{clearTimeout(timer);await client.detach();}
}
async function armed(p){return p.evaluate(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented;});}
async function download(p,action){
 const client=await p.target().createCDPSession();
 const {targetInfo}=await client.send('Target.getTargetInfo');
 await client.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:out,eventsEnabled:true,browserContextId:targetInfo.browserContextId});
 let filename,timer;
 const finished=new Promise((resolvePromise,reject)=>{
  timer=setTimeout(()=>reject(new Error('Browser download did not finish')),15000);
  client.on('Browser.downloadWillBegin',event=>{filename=event.suggestedFilename;});
  client.on('Browser.downloadProgress',event=>{if(event.state==='completed'){clearTimeout(timer);resolvePromise();}else if(event.state==='canceled'){clearTimeout(timer);reject(new Error('Browser download cancelled'));}});
 });
 try{await action();await finished;assert.ok(filename);return resolve(out,filename);}finally{clearTimeout(timer);await client.detach();}
}

try{
 // A delayed step-heading focus must not pull a person out of support options.
 const focus=await page();await click(focus.p,'Explore sample profile');await click(focus.p,'Edit strengths & friction →');
 await focus.p.waitForSelector('.cc-insight-title');await focus.p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await focus.p.evaluate(()=>{window.__nativeRAF=window.requestAnimationFrame;window.__pendingFocus=[];window.requestAnimationFrame=fn=>{window.__pendingFocus.push(fn);return 1;};});
 await click(focus.p,'Continue →');await focus.p.focus('.cc-support-now summary');await focus.p.keyboard.press('Enter');await focus.p.keyboard.press('Tab');
 await focus.p.evaluate(()=>{window.requestAnimationFrame=window.__nativeRAF;window.__pendingFocus.forEach(fn=>fn(performance.now()));});
 check('Pending step focus preserves keyboard focus inside support',await focus.p.evaluate(()=>document.activeElement.getAttribute('href')==='tel:988'));
 await focus.p.keyboard.press('Escape');check('Support still closes after a pending step focus update',await focus.p.evaluate(()=>!document.querySelector('.cc-support-now details').open));await focus.context.close();
 for(const [size,width,height] of [['desktop',1440,1000],['mobile',375,812]]){
  const {context,p}=await page(width,height);await click(p,'Begin my reflection →');await route(p,'#/context');
  await support(p,`${size}-context`);
  check(`${size}: held biological-sex requirement unchanged`,await p.$eval('[data-context-question=sexAssigned] select',e=>e.required&&e.value==='')&&await p.$eval('.cc-context-page .cc-primary',e=>e.disabled));
  await p.select('[data-context-question=sexAssigned] select','male');await click(p,'Continue to experiences →');await route(p,'#/reflect/1');
  const answered=[];
  for(let i=0;i<SECTIONS.length;i++){
   await support(p,`${size}-assessment-${i+1}`);
   check(`${size} section ${i+1}: pace box retained`,await p.$eval('.cc-safety',e=>e.textContent.includes('You control the pace.')));
   const id=await p.$eval('[data-question]',e=>e.dataset.question);answered.push(id);
   await click(p,'No',`[data-question="${id}"] .cc-choice`);
   check(`${size} section ${i+1}: support does not cover selected answer`,await p.$eval(`[data-question="${id}"] .cc-choice [aria-pressed=true]`,e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e;}));
   await screenshot(p,`${size}-assessment-${i+1}-answered`);
   if(i<SECTIONS.length-1){await click(p,'Continue →','.cc-section-actions');await route(p,`#/reflect/${i+2}`);}
   else{await click(p,'Build my reflection →','.cc-section-actions');await route(p,'#/results');}
  }
  await support(p,`${size}-results`);
  check(`${size}: no automatic device saving`,await p.evaluate(()=>localStorage.getItem('cortex-compass-profile')===null));
  const documentToken=await p.evaluate(()=>window.__uxDocument=crypto.randomUUID());
  for(let i=SECTIONS.length-1;i>=0;i--){
   await p.goBack();await route(p,`#/reflect/${i+1}`);
   check(`${size}: Back keeps section ${i+1} answer`,await p.$eval(`[data-question="${answered[i]}"] .cc-choice [aria-pressed=true]`,e=>e.textContent==='No'));
  }
  await p.goBack();await route(p,'#/context');check(`${size}: Back keeps context`,await p.$eval('[data-context-question=sexAssigned] select',e=>e.value==='male'));
  await p.goBack();await route(p,'#/welcome');
  await p.goForward();await route(p,'#/context');
  for(let i=0;i<SECTIONS.length;i++){await p.goForward();await route(p,`#/reflect/${i+1}`);check(`${size}: Forward keeps section ${i+1} answer`,await p.$eval(`[data-question="${answered[i]}"] .cc-choice [aria-pressed=true]`,e=>e.textContent==='No'));}
  await p.goForward();await route(p,'#/results');
  check(`${size}: traversal stays in the same document`,await p.evaluate(token=>window.__uxDocument===token,documentToken));
  check(`${size}: sensitive fields absent from history and URL`,await p.evaluate(()=>!JSON.stringify(history.state).match(/answers|personContext|male|physical_assault/)&&!location.href.includes('?')));
  await leaveWarning(p,'reload');await leaveWarning(p,'close');
  check(`${size}: cancelling leave keeps all answers`,await p.$eval('.cc-load strong',(e,count)=>e.textContent.startsWith(String(count)+' /'),SECTIONS.length));
  await click(p,'Choose my reports');await route(p,'#/report');await support(p,`${size}-report`);
  await p.emulateMediaType('print');check(`${size}: support UI excluded from print`,await p.$eval('.cc-support-now',e=>getComputedStyle(e).display==='none'));await p.emulateMediaType('screen');
  await click(p,'Edit strengths & friction');await route(p,'#/insights');
  for(let i=0;i<3;i++){await support(p,`${size}-insights-${i+1}`);if(i<2)await click(p,'Continue →');}
  await click(p,'Build my reports →');await route(p,'#/report');await click(p,'Back to overview');await route(p,'#/results');
  if(!await p.$('.cc-save-panel'))await click(p,'Save profile');await p.click('.cc-save-panel input[type=checkbox]');await click(p,'Save to this device');
  await p.waitForFunction(()=>document.querySelector('.cc-results .cc-nav').textContent.includes('Saved on device'));
  check(`${size}: explicit save retains the selected answers`,await p.evaluate(ids=>{const r=JSON.parse(localStorage.getItem('cortex-compass-profile'));return ids.every(id=>r.answers[id].value==='no')&&r.personContext.sexAssigned==='male';},answered));
  check(`${size}: saved data removes the warning`,!await armed(p));
  let dialogs=0;const unexpected=async d=>{dialogs++;await d.dismiss();};p.on('dialog',unexpected);
  await p.reload({waitUntil:'networkidle0'});p.off('dialog',unexpected);await route(p,'#/welcome');check(`${size}: saved reload has no leave warning`,dialogs===0);
  await p.goBack();await route(p,'#/welcome');check(`${size}: old history cannot reconstruct answers after reload`,!await p.$('.cc-results')&&!await p.$('.cc-assessment'));
  await click(p,'Open saved profile');await route(p,'#/results');check(`${size}: resume still opens only by explicit choice`,await p.$eval('.cc-load strong',(e,count)=>e.textContent.startsWith(String(count)+' /'),SECTIONS.length));
  await context.close();
 }

 // Export and save boundaries in a separate, fictional test session.
 const {context,p}=await page();await click(p,'Begin my reflection →');await p.select('[data-context-question=sexAssigned] select','female');await click(p,'Continue to experiences →');
 await click(p,'No','[data-question="physical_assault"] .cc-choice');await click(p,'Review what I’ve shared');await route(p,'#/results');await click(p,'Save profile');
 const raw=await download(p,()=>click(p,'Export my reflection (.json)'));
 check('Explicit JSON export contains the actual open-page answer',JSON.parse(readFileSync(raw,'utf8')).answers.physical_assault.value==='no');check('JSON export preserves the warning because file saving cannot be confirmed by the page',await armed(p));
 await click(p,'Edit answers');await route(p,'#/reflect/1');await click(p,'Yes','[data-question="physical_assault"] .cc-choice');check('Editing an exported reflection re-arms the warning',await armed(p));
 await click(p,'Review what I’ve shared');await click(p,'Backup / restore');await route(p,'#/backup');
 const phrase='Fictional test only river compass meadow';await p.type('[aria-label="Backup password"]',phrase);await p.type('[aria-label="Confirm backup password"]',phrase);await click(p,'Prepare encrypted backup');await p.waitForSelector('.cc-backup-download');
 check('Preparing a backup keeps the warning until download',await armed(p));
 await download(p,()=>p.click('.cc-backup-download a'));check('Encrypted download preserves the warning for unsaved page answers',await armed(p));
 check('Exports do not automatically save to browser storage',await p.evaluate(()=>localStorage.getItem('cortex-compass-profile')===null));await context.close();

 for(const hash of ['#/reflect/3','#/context','#/results','#/report','#/portrait']){
  const {context,p}=await page();await p.goto(origin+'/'+hash,{waitUntil:'networkidle0'});await route(p,'#/welcome');check(`Fresh ${hash} safely replaces with welcome`,!await p.$('.cc-results')&&!await p.$('.cc-assessment'));await context.close();
 }
 const sample=await page();await click(sample.p,'Explore sample profile');await route(sample.p,'#/results');await sample.p.waitForFunction(()=>document.querySelector('[data-model]')?.dataset.model==='loaded');
 await sample.p.evaluate(()=>window.__uxCanvas=document.querySelector('.cc-brain-stage canvas'));await support(sample.p,'desktop-sample-results');
 check('Support does not remount the live 3D canvas',await sample.p.evaluate(()=>!!window.__uxCanvas&&window.__uxCanvas===document.querySelector('.cc-brain-stage canvas')));
 check('Fictional sample has no leave warning',!await armed(sample.p));await sample.context.close();
 const hero=await page();await click(hero.p,'Explore hero sample');await route(hero.p,'#/neurohero');check('Hero sample navigates once directly to the atlas',await hero.p.evaluate(()=>history.length===3));check('Hero sample has no leave warning',!await armed(hero.p));await hero.p.goBack();await route(hero.p,'#/welcome');await hero.context.close();
 check('No data-upload or paid-generation POST occurred',posts.length===0);check('No browser console or JavaScript errors',errors.length===0);
}catch(error){failures.push(error.stack);process.exitCode=1;console.error(error.stack);}
finally{await browser.close();}
const result={origin,at:new Date().toISOString(),viewports:[[1440,1000],[375,812]],passed:checks.length,failed:failures.length,checks,errors,posts,failures};
writeFileSync(resolve(out,'verification.json'),JSON.stringify(result,null,2));writeFileSync(resolve(out,'navigation.json'),JSON.stringify(journey,null,2));console.log(JSON.stringify(result,null,2));
