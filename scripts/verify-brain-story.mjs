// Browser acceptance for the results-page brain map and walkthrough (BrainStory.jsx on the shared
// CortexBrain viewer). Checks the map, every walkthrough stop, play/pause/next/previous/exit, keyboard
// use, the text version, reduced motion, phone, a fresh reflection, the empty state, and that there
// are no console, CSP or network errors. Writes screenshots and verification.json to CORTEX_TEST_OUTPUT.
// Run against the production headers: npm run build && node scripts/serve-dist-with-worker.mjs 5682
//   CORTEX_TEST_ORIGIN=http://127.0.0.1:5682 node scripts/verify-brain-story.mjs
// CORTEX_CHROME may point at a local Chrome for Testing binary.
import puppeteer from 'puppeteer';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {calculateProfile,SAMPLE_ANSWERS} from '../src/utils/assessmentProfile.mjs';
import {buildBrainStory,stepDwellMs,STORY_COPY} from '../src/utils/brainStory.mjs';
import {MODEL_VERSION} from '../src/data/brainModel.mjs';

const origin=process.env.CORTEX_TEST_ORIGIN||'http://127.0.0.1:5682';
const out=resolve(process.env.CORTEX_TEST_OUTPUT||'.local-evidence/brain-story/verify');
mkdirSync(out,{recursive:true});
const passed=[],failures=[],errors=[],shots=[];
const record=(name,ok,detail='')=>{(ok?passed:failures).push(detail?`${name} — ${detail}`:name);if(!ok)console.error('FAIL',name,detail);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const DESKTOP={width:1440,height:1000,deviceScaleFactor:1};
const PHONE={width:375,height:812,deviceScaleFactor:2,isMobile:true,hasTouch:true};
// A fresh reflection: four Yes answers with region-specific studies and one without (incarceration).
const FRESH_YES=[['care','verbal_harm'],['household','witnessed_violence'],['household','household_incarceration'],['peers','peer_physical'],['peers','sexual_boundary']];
const yes=ids=>Object.fromEntries(ids.map(id=>[id,{value:'yes'}]));
const SAMPLE=buildBrainStory(calculateProfile(SAMPLE_ANSWERS));
const FRESH=buildBrainStory(calculateProfile(yes(FRESH_YES.map(([,id])=>id))));
// Wording the brain story itself must never use (the viewer's own notes are checked elsewhere).
const FORBIDDEN=[/damag/i,/injur/i,/\bscan/i,/diagnos/i,/\bimpacted\b/i,/\baffected\b/i,/your (own )?brain (was|is|has|had)\b/i];

const browser=await puppeteer.launch({headless:'new',executablePath:process.env.CORTEX_CHROME||undefined,
  args:['--use-angle=metal','--ignore-gpu-blocklist'],protocolTimeout:180000});
async function newPage(viewport,label,reduced=false){
  const context=await browser.createIncognitoBrowserContext(),page=await context.newPage();await page.setViewport(viewport);
  if(reduced)await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  page.on('console',m=>{if(m.type()==='error')errors.push(`${label}: ${m.text()}`);});
  page.on('pageerror',e=>errors.push(`${label}: ${e.message}`));
  page.on('requestfailed',r=>{if(!r.url().includes('/api/'))errors.push(`${label}: request failed ${r.url()} ${r.failure()?.errorText}`);});
  return {page,context};
}
const clickText=async(page,text,scope='')=>{
  await page.waitForFunction((t,s)=>[...document.querySelectorAll(`${s} button`)].some(b=>b.textContent.trim()===t),{timeout:20000},text,scope);
  for(const b of await page.$$(`${scope} button`))if((await b.evaluate(e=>e.textContent.trim()))===text){await b.evaluate(e=>e.scrollIntoView({block:'center'}));await b.click();return;}
  throw new Error(`Button not found: ${text}`);
};
// Real clicks, with the target centred so the sticky support strip never sits on top of it.
const press=async(page,selector)=>{await page.$eval(selector,e=>e.scrollIntoView({block:'center'}));await page.click(selector);};
const brain=page=>page.$eval('.bs-story .cc-brain-canvas',e=>({...e.dataset}));
const story=page=>page.$eval('.bs-story',e=>({...e.dataset}));
const stage=page=>page.$eval('.bs-story .cc-brain-stage',e=>e.scrollIntoView({block:'start'}));
const shoot=async(page,file,note)=>{await page.screenshot({path:resolve(out,file),captureBeyondViewport:false});shots.push({file,note});return file;};
const noOverflow=page=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
const storyText=page=>page.$$eval('.bs-story .bs-panel, .bs-story .bs-slot',es=>es.map(e=>e.innerText).join('\n'));

async function openResults(page,how){
  await page.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});
  await how(page);
  await page.waitForFunction(()=>['loaded','failed','unavailable'].includes(document.querySelector('.bs-story .cc-brain-canvas')?.dataset.model),{timeout:90000});
  const s=await brain(page);
  record(`${page.__label}: results brain loads (${s.lod})`,s.model==='loaded'&&s.version===MODEL_VERSION&&s.meshes==='47',JSON.stringify({model:s.model,meshes:s.meshes,lod:s.lod}));
  await page.evaluate(()=>{window.__bsCanvas=document.querySelector('.bs-story canvas');});
}
const sample=async page=>clickText(page,'Explore sample profile');
// Map settled: every linked structure highlighted, its visibility probe done and every label placed.
async function settledMap(page,expected){
  await stage(page);
  await page.waitForFunction(n=>{const d=document.querySelector('.bs-story .cc-brain-canvas')?.dataset;
    return d&&d.story==='map'&&d.selected===''&&d.cameraMoving!=='true'&&d.highlightVisible===String(n)&&d.markers===String(n);},{timeout:20000},expected.steps.length)
    .catch(()=>{});
  await wait(400);return brain(page);
}
async function checkMap(page,expected,tag){
  const s=await settledMap(page,expected),view=await story(page);
  const meshes=s.highlightMeshes?s.highlightMeshes.split(','):[];
  record(`${tag}: map view shows`,view.storyView==='map'&&s.story==='map',`section=${view.storyView} viewer=${s.story}`);
  record(`${tag}: every linked structure is highlighted at once`,s.highlighted===expected.key,`${s.highlighted} vs ${expected.key}`);
  record(`${tag}: every highlighted structure is visible on the brain`,s.highlightVisible===String(expected.steps.length),`visible ${s.highlightVisible}/${expected.steps.length}`);
  record(`${tag}: a numbered label for each structure`,s.markers===String(expected.steps.length),`labels ${s.markers}`);
  record(`${tag}: all other structures are dimmed`,Number(s.dimmed)===47-meshes.length&&meshes.length>0,`dimmed ${s.dimmed}, highlighted meshes ${meshes.join(',')}`);
  record(`${tag}: map uses ${expected.mode} mode`,s.mode===expected.mode,s.mode);
  const legend=await page.$$eval('.bs-story [data-story-legend]',es=>es.map(e=>({id:e.dataset.storyLegend,side:e.dataset.side,text:e.innerText})));
  record(`${tag}: legend lists each linked structure, in order`,legend.map(l=>`${l.id}:${l.side}`).join(',')===expected.key,legend.map(l=>l.id).join(','));
  record(`${tag}: legend gives plain and scientific names and the linked answers`,expected.steps.every((st,i)=>legend[i]?.text.includes(st.plainName)&&legend[i].text.includes(st.scientificName)&&st.answers.every(a=>legend[i].text.includes(a.title))));
  const markers=await page.$$eval('.bs-story .cc-story-marker',es=>es.map(e=>({id:e.dataset.marker,shown:getComputedStyle(e).opacity==='1',n:e.querySelector('b').textContent})));
  record(`${tag}: label numbers match the legend`,markers.length===expected.steps.length&&markers.every((m,i)=>m.id===expected.steps[i].id&&m.n===String(i+1)&&m.shown));
  const text=await storyText(page);
  record(`${tag}: copy says research links experiences like these to the structures`,text.includes(STORY_COPY.intro(expected.steps.length))&&text.includes('groups of people'));
  const bad=FORBIDDEN.filter(p=>p.test(text));record(`${tag}: copy never claims a measured, scanned or damaged brain`,bad.length===0,bad.join(' '));
  return s;
}
// A walkthrough stop is settled when the camera has landed and the stop is drawn and labelled.
async function settledStop(page,step,index){
  await page.waitForFunction((id,side,i)=>{
    const d=document.querySelector('.bs-story .cc-brain-canvas')?.dataset,label=document.querySelector('.bs-story .cc-region-label'),view=document.querySelector('.bs-story')?.dataset;
    return d&&view?.storyStep===String(i)&&d.story==='stop'&&d.selected===id&&d.side===side&&d.cameraMoving!=='true'&&d.selectedVisible==='true'
      &&d.selectedMeshes.split(',').includes(d.labelTarget)&&label?.dataset.target===d.labelTarget;
  },{timeout:20000},step.id,step.side,index).catch(()=>{});
  await wait(350);return brain(page);
}
async function checkStop(page,expected,index,tag,before){
  const step=expected.steps[index],s=await settledStop(page,step,index);
  record(`${tag}: stop ${index+1} moves the camera to ${step.id} (${step.side}) and shows it`,s.story==='stop'&&s.selected===step.id&&s.side===step.side&&s.selectedVisible==='true'&&s.cameraMoving!=='true',
    `selected=${s.selected} side=${s.side} visible=${s.selectedVisible} mode=${s.mode} label→${s.labelTarget}`);
  if(before)record(`${tag}: stop ${index+1} camera moved`,s.camera!==before.camera&&Number(s.cameraMoves)>Number(before.cameraMoves||0),`${before.camera} → ${s.camera}, moves ${before.cameraMoves||0}→${s.cameraMoves}`);
  const shown=await page.$eval('.bs-story .bs-tour',e=>({count:e.querySelector('.bs-stop-count').textContent,name:e.querySelector('.bs-stop-name').innerText,science:e.querySelector('.bs-stop-science').innerText,
    answers:[...e.querySelectorAll('.bs-stop-answers li')].map(li=>li.innerText),findings:[...e.querySelectorAll('.bs-study')].map(d=>({text:d.querySelector('p').innerText,href:d.querySelector('a').href})),
    lead:e.querySelector('.bs-stop-lead').innerText,meaning:e.querySelector('.bs-stop-meaning p').innerText}));
  record(`${tag}: stop ${index+1} gives the plain and scientific names`,shown.name===step.plainName&&shown.science.includes(step.scientificName)&&shown.count.includes(STORY_COPY.stop(index,expected.steps.length)),`${shown.name} · ${shown.science}`);
  record(`${tag}: stop ${index+1} shows which answers link to it`,step.answers.length===shown.answers.length&&step.answers.every((a,i)=>shown.answers[i].includes(a.title)&&shown.answers[i].includes(a.text)));
  record(`${tag}: stop ${index+1} shows what studies found in groups, with a source link`,shown.lead===STORY_COPY.lead&&step.studies.length===shown.findings.length&&step.studies.every((st,i)=>shown.findings[i].text===st.finding&&shown.findings[i].href===st.url));
  record(`${tag}: stop ${index+1} says what it does and doesn’t mean`,shown.meaning===step.meaning);
  return s;
}

const report={sample:SAMPLE.key,fresh:FRESH.key,dwellMs:SAMPLE.steps.map(stepDwellMs)};
try{
  // ---------------- desktop 1440 x 1000: sample profile, map and the full walkthrough
  const {page:desk}=await newPage(DESKTOP,'desktop');desk.__label='desktop';
  await openResults(desk,sample);
  const map=await checkMap(desk,SAMPLE,'desktop sample');
  const walkButton=await desk.$eval('.bs-story [data-control="walk"]',e=>({text:e.textContent.trim(),hint:document.getElementById(e.getAttribute('aria-describedby'))?.textContent}));
  record('desktop: walk button and hint',walkButton.text===STORY_COPY.walk&&walkButton.hint===STORY_COPY.walkHint,JSON.stringify(walkButton));
  await stage(desk);await shoot(desk,'desktop-map.png','Sample profile: brain map, all linked structures highlighted');
  await press(desk,'.bs-story [data-control="walk"]');const started=Date.now();
  let s=await checkStop(desk,SAMPLE,0,'desktop sample',map);
  let view=await story(desk);
  record('desktop: walkthrough plays from stop 1',view.storyView==='tour'&&view.storyPlaying==='true');
  record('desktop: focus moves to the play/pause control',await desk.evaluate(()=>document.activeElement?.dataset.control==='play'));
  record('desktop: the crisis strip stays visible above the walkthrough',await desk.$eval('.cc-support-now summary',e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.top<80&&r.height>=44;}));
  await shoot(desk,'desktop-stop-1.png','Walkthrough stop 1 (playing)');
  // Play advances by itself after the reading time.
  await desk.waitForFunction(()=>document.querySelector('.bs-story')?.dataset.storyStep==='1',{timeout:stepDwellMs(SAMPLE.steps[0])+8000});
  report.autoplayAdvanceMs=Date.now()-started;
  record('desktop: Play advances to the next stop after the reading time',report.autoplayAdvanceMs>=stepDwellMs(SAMPLE.steps[0])-500,`${report.autoplayAdvanceMs} ms (dwell ${stepDwellMs(SAMPLE.steps[0])} ms)`);
  s=await checkStop(desk,SAMPLE,1,'desktop sample',s);
  await press(desk,'.bs-story [data-control="play"]');
  view=await story(desk);record('desktop: Pause stops autoplay',view.storyPlaying==='false'&&await desk.$eval('.bs-story [data-control="play"]',e=>e.textContent.trim())===STORY_COPY.play);
  await shoot(desk,'desktop-stop-2.png','Walkthrough stop 2 (paused)');
  await wait(2500);record('desktop: paused stays on its stop',(await story(desk)).storyStep==='1');
  // Keyboard: Next with Enter, then arrow keys inside the walkthrough.
  await desk.focus('.bs-story [data-control="next"]');await desk.keyboard.press('Enter');
  s=await checkStop(desk,SAMPLE,2,'desktop sample',s);
  await shoot(desk,'desktop-stop-3.png','Walkthrough stop 3 (keyboard Next)');
  record('desktop: Next at the last stop stays put',await desk.$eval('.bs-story [data-control="next"]',e=>e.getAttribute('aria-disabled')==='true'));
  await desk.keyboard.press('ArrowLeft');s=await checkStop(desk,SAMPLE,1,'desktop keyboard ←',s);
  await desk.keyboard.press('ArrowRight');s=await checkStop(desk,SAMPLE,2,'desktop keyboard →',s);
  await press(desk,'.bs-story [data-control="previous"]');s=await checkStop(desk,SAMPLE,1,'desktop Previous',s);
  record('desktop: legend marks the current stop',await desk.$$eval('.bs-story [data-story-legend]',es=>es.map(e=>e.getAttribute('aria-current')).join(',')===',step,'));
  // Exit with Escape: back to the map, focus on the walk button.
  await desk.focus('.bs-story [data-control="next"]');await desk.keyboard.press('Escape');
  await checkMap(desk,SAMPLE,'desktop after Escape');
  record('desktop: Escape exits and returns focus to “Walk me through it”',await desk.evaluate(()=>document.activeElement?.dataset.control==='walk'));
  // Legend: open a stop directly (paused), then Exit with the button.
  await press(desk,`.bs-story [data-story-legend="${SAMPLE.steps[2].id}"]`);
  s=await checkStop(desk,SAMPLE,2,'desktop legend',null);
  record('desktop: a legend stop opens paused',(await story(desk)).storyPlaying==='false');
  await press(desk,'.bs-story [data-control="exit"]');await checkMap(desk,SAMPLE,'desktop after Exit');
  // Text version: same stops, same order, same words.
  await press(desk,'.bs-story .bs-text summary');
  const text=await desk.$$eval('.bs-story .bs-text [data-story-text-step]',es=>es.map(e=>({id:e.dataset.storyTextStep,text:e.innerText,links:[...e.querySelectorAll('a')].map(a=>a.href)})));
  record('desktop: full text version has every stop in walkthrough order',text.map(t=>t.id).join(',')===SAMPLE.steps.map(st=>st.id).join(','));
  record('desktop: text version carries the same names, answers, findings, links and meaning',SAMPLE.steps.every((st,i)=>[st.plainName,st.scientificName,st.lead,st.meaning,...st.answers.map(a=>a.title),...st.studies.map(x=>x.finding)].every(part=>text[i]?.text.includes(part))&&st.studies.every(x=>text[i].links.includes(x.url))));
  await (await desk.$('.bs-story .bs-panel')).screenshot({path:resolve(out,'desktop-text-version.png')});shots.push({file:'desktop-text-version.png',note:'Text version of the walkthrough'});
  // The person's own pick hands control back; “Show the brain map” returns.
  await desk.select('.bs-story .cc-brain-region-selector select','hippocampus');await wait(300);
  s=await brain(desk);view=await story(desk);
  record('desktop: picking a region yourself switches to free exploring',view.storyView==='explore'&&s.story===''&&s.highlighted===''&&s.selected==='hippocampus',`${view.storyView} ${s.story} ${s.selected}`);
  record('desktop: free exploring keeps the existing region info',await desk.$eval('.bs-story .cc-selected-info',e=>e.textContent.includes('Hippocampus')));
  await press(desk,'.bs-story [data-control="map"]');await checkMap(desk,SAMPLE,'desktop Show the brain map');
  const chip=await desk.$eval('.cc-report-evidence .cc-study-region[data-region-link]',e=>({id:e.dataset.regionLink,side:e.dataset.side}));
  await press(desk,`.cc-report-evidence .cc-study-region[data-region-link="${chip.id}"][data-side="${chip.side}"]`);await wait(400);
  s=await brain(desk);
  record('desktop: a study’s “show in 3D” still selects that region and side',s.selected===chip.id&&s.side===(['L','R'].includes(chip.side)?chip.side:'both')&&(await story(desk)).storyView==='explore',`${chip.id}/${chip.side}`);
  record('desktop: one renderer for the whole flow',await desk.evaluate(()=>window.__bsCanvas===document.querySelector('.bs-story canvas')&&document.querySelectorAll('canvas').length===1));
  record('desktop: no horizontal overflow',await noOverflow(desk));

  // ---------------- desktop, reduced motion: a still step list instead of camera moves
  const {page:still}=await newPage(DESKTOP,'reduced',true);still.__label='desktop reduced motion';
  await openResults(still,sample);
  const stillMap=await checkMap(still,SAMPLE,'reduced motion');
  record('reduced motion: the walk hint promises still steps',await still.$eval('#bs-walk-hint',e=>e.textContent)===STORY_COPY.walkHintStill);
  await press(still,'.bs-story [data-control="walk"]');await wait(600);
  view=await story(still);s=await brain(still);
  record('reduced motion: “Walk me through it” opens the still step list',view.storyView==='list'&&await still.$('.bs-story .bs-tour')===null&&await still.$('.bs-story .bs-progress')===null);
  const steps=await still.$$eval('.bs-story .bs-still [data-story-text-step]',es=>es.map(e=>({id:e.dataset.storyTextStep,text:e.innerText})));
  record('reduced motion: every stop is listed, in order, with its words',steps.map(x=>x.id).join(',')===SAMPLE.steps.map(x=>x.id).join(',')&&SAMPLE.steps.every((st,i)=>[st.plainName,st.scientificName,st.meaning,...st.studies.map(x=>x.finding)].every(part=>steps[i].text.includes(part))));
  record('reduced motion: no camera move',s.story==='map'&&s.camera===stillMap.camera&&(s.cameraMoves||'0')===(stillMap.cameraMoves||'0')&&s.cameraMoving!=='true',`camera ${stillMap.camera} → ${s.camera}, moves ${s.cameraMoves||0}`);
  record('reduced motion: focus moves to the step list heading',await still.evaluate(()=>document.activeElement?.id==='bs-still-title'));
  await shoot(still,'desktop-reduced-steps.png','Reduced motion: still step list');
  await press(still,`.bs-story [data-story-legend="${SAMPLE.steps[1].id}"]`);await wait(400);
  record('reduced motion: a legend stop jumps to its still step',await still.evaluate(id=>document.activeElement?.dataset.storyTextStep===id,SAMPLE.steps[1].id));
  s=await brain(still);record('reduced motion: still no camera move after a legend pick',s.camera===stillMap.camera&&(s.cameraMoves||'0')===(stillMap.cameraMoves||'0'));
  await still.keyboard.press('Escape');await wait(300);
  record('reduced motion: Escape closes the steps and returns focus',(await story(still)).storyView==='map'&&await still.evaluate(()=>document.activeElement?.dataset.control==='walk'));

  // ---------------- phone 375 x 812
  const {page:phone}=await newPage(PHONE,'phone');phone.__label='phone';
  await openResults(phone,sample);
  await checkMap(phone,SAMPLE,'phone sample');
  record('phone: phone model asset',(await brain(phone)).lod==='mobile');
  await stage(phone);await shoot(phone,'phone-map.png','Phone: brain map');
  await press(phone,'.bs-story [data-control="walk"]');
  s=await checkStop(phone,SAMPLE,0,'phone sample',null);
  record('phone: brain and stop text are on screen together',await phone.evaluate(()=>{const st=document.querySelector('.bs-story .cc-brain-stage').getBoundingClientRect(),name=document.querySelector('.bs-story .bs-tour .bs-stop-name').getBoundingClientRect();return st.top>=0&&st.bottom<=innerHeight&&name.top<innerHeight-30;}));
  record('phone: walkthrough controls are at least 44 px tall',await phone.$$eval('.bs-story .bs-controls button',es=>es.length===4&&es.every(e=>e.getBoundingClientRect().height>=44)));
  await shoot(phone,'phone-stop-1.png','Phone: walkthrough stop 1');
  await press(phone,'.bs-story [data-control="play"]');
  for(const i of [1,2]){await press(phone,'.bs-story [data-control="next"]');s=await checkStop(phone,SAMPLE,i,'phone sample',s);await stage(phone);await shoot(phone,`phone-stop-${i+1}.png`,`Phone: walkthrough stop ${i+1}`);}
  await press(phone,'.bs-story [data-control="exit"]');await checkMap(phone,SAMPLE,'phone after Exit');
  record('phone: no horizontal overflow',await noOverflow(phone));
  record('phone: one renderer for the whole flow',await phone.evaluate(()=>window.__bsCanvas===document.querySelector('.bs-story canvas')));
  const {page:phoneStill}=await newPage(PHONE,'phone-reduced',true);phoneStill.__label='phone reduced motion';
  await openResults(phoneStill,sample);await checkMap(phoneStill,SAMPLE,'phone reduced motion');
  await press(phoneStill,'.bs-story [data-control="walk"]');await wait(600);
  record('phone reduced motion: still step list',(await story(phoneStill)).storyView==='list'&&(await phoneStill.$$('.bs-story .bs-still [data-story-text-step]')).length===SAMPLE.steps.length);
  await shoot(phoneStill,'phone-reduced-steps.png','Phone, reduced motion: still step list');
  record('phone reduced motion: no horizontal overflow',await noOverflow(phoneStill));

  // ---------------- a fresh reflection with Yes answers (desktop)
  const {page:fresh}=await newPage(DESKTOP,'fresh');fresh.__label='fresh reflection';
  await openResults(fresh,async page=>{
    await clickText(page,'Begin my reflection →');
    await page.waitForSelector('[data-context-question=sexAssigned] select');await page.select('[data-context-question=sexAssigned] select','female');
    await clickText(page,'Continue to experiences →');
    for(const section of ['care','household','peers']){
      for(const [where,id] of FRESH_YES)if(where===section){await page.waitForSelector(`[data-question="${id}"]`);await clickText(page,'Yes',`[data-question="${id}"]`);}
      if(section!=='peers')await clickText(page,'Continue →');
    }
    await clickText(page,'Review what I’ve shared');
  });
  record('fresh reflection: answers recorded',await fresh.$eval('.cc-summary-grid>div:first-child strong',e=>e.textContent.trim())===String(FRESH_YES.length));
  let last=await checkMap(fresh,FRESH,'fresh reflection');
  await stage(fresh);await shoot(fresh,'fresh-map.png',`Fresh reflection (${FRESH_YES.length} Yes answers): brain map, ${FRESH.steps.length} structures`);
  await press(fresh,`.bs-story [data-story-legend="${FRESH.steps[0].id}"]`);
  for(let i=0;i<FRESH.steps.length;i++){
    if(i)await press(fresh,'.bs-story [data-control="next"]');
    last=await checkStop(fresh,FRESH,i,'fresh reflection',i?last:null);
    await stage(fresh);await shoot(fresh,`fresh-stop-${i+1}.png`,`Fresh reflection: stop ${i+1}, ${FRESH.steps[i].id} (${last.mode})`);
  }
  await press(fresh,'.bs-story [data-control="exit"]');await checkMap(fresh,FRESH,'fresh after Exit');
  record('fresh reflection: an answer without a region-specific study adds no structure',!FRESH.key.includes('incarceration')&&!(await fresh.$eval('.bs-story .bs-panel',e=>e.innerText)).includes('Household incarceration'));

  // ---------------- nothing linked: calm empty state (desktop)
  const {page:empty}=await newPage(DESKTOP,'empty');empty.__label='empty state';
  await openResults(empty,async page=>{
    await clickText(page,'Begin my reflection →');
    await page.waitForSelector('[data-context-question=sexAssigned] select');await page.select('[data-context-question=sexAssigned] select','male');
    await clickText(page,'Continue to experiences →');
    await page.waitForSelector('[data-question="verbal_harm"]');await clickText(page,'No','[data-question="verbal_harm"]');await clickText(page,'Not sure','[data-question="physical_assault"]');
    await clickText(page,'Review what I’ve shared');
  });
  await wait(800);s=await brain(empty);view=await story(empty);
  record('empty state: shown when nothing is linked',view.storyView==='empty'&&view.storyCount==='0');
  const emptyText=await empty.$eval('.bs-story .bs-panel',e=>e.innerText);
  record('empty state: calm explanation, no walkthrough',emptyText.includes(STORY_COPY.emptyHeading)&&emptyText.includes(STORY_COPY.empty)&&await empty.$('.bs-story [data-control="walk"]')===null);
  record('empty state: the teaching brain still works, nothing highlighted',s.model==='loaded'&&s.story===''&&s.highlighted===''&&(s.dimmed||'0')==='0');
  record('empty state: heading stays “Explore the systems”',await empty.$eval('.bs-story h2',e=>e.textContent)===STORY_COPY.emptyTitle);
  await empty.$eval('.bs-story',e=>e.scrollIntoView({block:'start'}));await wait(500);await shoot(empty,'desktop-empty.png','Nothing linked: calm empty state');

  record('no console, CSP or network errors',errors.length===0,errors.slice(0,5).join(' | '));
}catch(error){failures.push(error.stack);process.exitCode=1;}
finally{await browser.close();}
if(failures.length)process.exitCode=1;
const result={origin,model:MODEL_VERSION,passed:passed.length,failed:failures.length,checks:passed,failures,errors,screenshots:shots,...report};
writeFileSync(resolve(out,'verification.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({origin,passed:passed.length,failed:failures.length,errors:errors.length,screenshots:shots.length},null,2));
