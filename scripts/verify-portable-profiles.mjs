import {chromium,webkit,devices} from '/Users/utlyze/Projects/freely-sweet/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {saveRecord} from '../src/utils/assessmentProfile.mjs';
import {makeHeroRecord} from '../src/utils/neurohero/storage.mjs';
import {SAMPLE_HERO_ANSWERS} from '../src/data/neurohero/processes.mjs';
import {decryptBackup} from '../src/utils/backup/cryptoEnvelope.mjs';
import {validateBackupPayload} from '../src/utils/backup/profileBackup.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');process.chdir(root);
const origin=process.env.CORTEX_TEST_ORIGIN||'http://127.0.0.1:5551',out=process.env.CORTEX_TEST_OUTPUT||'.local-evidence/portable-profiles/browser';mkdirSync(out,{recursive:true});
const phrase='Fictional test only river compass meadow';const blank={setItem:()=>{}};
const original=saveRecord(blank,{physical_assault:{value:'yes',development:{status:'reported',stages:['prepubertal'],source:'memory',response:'variable'}}},null,true,{noticing:'often'},{genderIdentity:'woman'},makeHeroRecord({answers:SAMPLE_HERO_ANSWERS,selectedId:'signal_cartographer',portraitChoices:{presentation:'woman'}}));
const previous=saveRecord(blank,{safe_adult:{value:'yes'}},null,true);
const checks=[],errors=[],failures=[];let posts=0;const check=(label,ok)=>{assert.ok(ok,label);checks.push(label);console.log('PASS '+label);};
const click=(p,name)=>p.getByRole('button',{name,exact:true}).click();
function watch(p){p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(r.method()==='POST')posts++;});}
async function seed(p,data){await p.goto(origin,{waitUntil:'domcontentloaded'});await p.evaluate(r=>localStorage.setItem('cortex-compass-profile',JSON.stringify(r)),data);await p.reload({waitUntil:'domcontentloaded'});}
async function download(p,name){const pending=p.waitForEvent('download');await p.getByRole('link',{name:'Download encrypted backup',exact:true}).click();const d=await pending;const path=resolve(out,name);await d.saveAs(path);return path;}
async function unlock(p,path,password=phrase){await p.getByLabel('Choose Cortex backup',{exact:true}).setInputFiles(path);await p.getByLabel('Unlock backup password',{exact:true}).fill(password);await click(p,'Unlock for preview');}
async function report(p){await click(p,'Choose my reports');await p.locator('[data-portrait-state="ready"]').waitFor({timeout:20000});}
const browser=await chromium.launch();let backupPath,payload;
try{
 const source=await browser.newContext({viewport:{width:1440,height:1050},acceptDownloads:true}),p=await source.newPage();watch(p);await seed(p,original);await click(p,'Open saved profile');await click(p,'Deep Hero Atlas · Signal Cartographer');await click(p,'Build my hero field guide →');
 await p.locator('.nh-image-availability .nh-image-consent input').check();await p.getByLabel('Choose device portrait',{exact:true}).setInputFiles(resolve('public/reports/xai/Cortex-Compass-xAI-Signal-Cartographer.jpg'));await p.locator('[data-portrait-state="ready"]').waitFor();
 await click(p,'Use this visual direction →');await p.locator('[data-portrait-state="ready"]').waitFor();await click(p,'Backup reflection & portrait');await p.getByLabel('Backup password',{exact:true}).fill(phrase);await p.getByLabel('Confirm backup password',{exact:true}).fill(phrase);await click(p,'Prepare encrypted backup');await p.locator('.cc-backup-download').waitFor();
 check('Preparing a backup does not overwrite the source saved profile',await p.evaluate(r=>localStorage.getItem('cortex-compass-profile')===JSON.stringify(r),original));
 check('Password inputs clear after preparing the file',await p.getByLabel('Backup password',{exact:true}).inputValue()===''&&await p.getByLabel('Confirm backup password',{exact:true}).inputValue()==='');
 backupPath=await download(p,'Fictional-Roundtrip.cortex');payload=await validateBackupPayload(await decryptBackup(readFileSync(backupPath),phrase));check('Actual browser download contains the chosen portrait and answers',!!payload.portraitBytes&&payload.profile.answers.physical_assault.value==='yes'&&payload.profile.neurohero.answers.signal_detection.value==='often');
 await p.screenshot({path:resolve(out,'backup-desktop.png'),fullPage:true});await p.locator('.cc-backup-panel .cc-backup-check input').uncheck();check('Changing portrait inclusion removes the previous download',await p.locator('.cc-backup-download').count()===0);
 const target=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true}),q=await target.newPage();watch(q);await seed(q,previous);await click(q,'Open a backup');
 await unlock(q,backupPath,'Wrong fictional password');await q.getByRole('status').filter({hasText:'incorrect'}).waitFor();check('Wrong password leaves the saved profile unchanged',await q.evaluate(r=>localStorage.getItem('cortex-compass-profile')===JSON.stringify(r),previous));check('Wrong password creates no preview',await q.locator('[data-backup-preview]').count()===0);
 await unlock(q,backupPath);await q.locator('[data-backup-preview]').waitFor();check('Preview is explicitly non-mutating',await q.evaluate(r=>localStorage.getItem('cortex-compass-profile')===JSON.stringify(r),previous));check('Opening remains disabled before consent',await q.getByRole('button',{name:'Open this reflection',exact:true}).isDisabled());
 await q.screenshot({path:resolve(out,'backup-mobile-preview.png'),fullPage:true});await q.getByLabel('Consent to open backup',{exact:true}).check();await click(q,'Open this reflection');await q.locator('.cc-results').waitFor();
 check('Imported developmental context is displayed',await q.locator('[data-timeline="physical_assault"]').innerText().then(t=>t.includes('before pubertal')));check('Opening still preserves the previously saved profile',await q.evaluate(r=>localStorage.getItem('cortex-compass-profile')===JSON.stringify(r),previous));
 await report(q);check('Accepted image works in an independent browser profile',await q.locator('.nh-portrait img').evaluate(e=>e.naturalWidth>0));
 await click(q,'Back to overview');await click(q,'Save profile');await q.locator('.cc-save-panel input').check();await click(q,'Save to this device');const saved=await q.evaluate(()=>JSON.parse(localStorage.getItem('cortex-compass-profile')));
 check('Explicit save preserves the exact accepted-image hash',saved.neurohero.portraitAsset.sha256===payload.profile.neurohero.portraitAsset.sha256);check('Image restoration uses a new local identifier',saved.neurohero.portraitAsset.id!==payload.profile.neurohero.portraitAsset.id);check('All normalized private context is preserved',saved.personContext.genderIdentity==='woman'&&saved.answers.physical_assault.development.stages[0]==='prepubertal');
 await q.reload({waitUntil:'domcontentloaded'});await click(q,'Open saved profile');await report(q);check('Restored profile and artwork survive reopening',await q.locator('.nh-portrait img').evaluate(e=>e.naturalWidth>0));
 await q.emulateMedia({media:'print'});await q.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.querySelectorAll('.cc-report-document img')].map(i=>i.decode()));});await q.pdf({path:resolve(out,'Restored-Fictional-Hero-A4.pdf'),format:'A4',printBackground:true});await q.emulateMedia({media:'screen'});
 await q.evaluate(()=>{window.__printed=0;window.print=()=>window.__printed++;});await click(q,'Print Superhero / Save PDF');check('Printing after restore invokes print without generation',await q.evaluate(()=>window.__printed===1)&&posts===0);
 await click(q,'Backup reflection & portrait');for(const width of [320,390,768,1440]){await q.setViewportSize({width,height:900});check(`${width}px backup page fits without horizontal scrolling`,await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));check(`${width}px visible backup controls have usable targets`,await q.locator('.cc-backup-shell button').evaluateAll(es=>es.filter(e=>e.getClientRects().length).every(e=>e.getBoundingClientRect().height>=44)));}
 await source.close();await target.close();
}catch(e){failures.push(e.stack);process.exitCode=1;}finally{await browser.close();}
if(backupPath&&failures.length===0){
 const b=await webkit.launch();
 try{
  const c=await b.newContext({...devices['iPhone 13'],acceptDownloads:true}),p=await c.newPage();watch(p);
  await seed(p,previous);await click(p,'Open a backup');await unlock(p,backupPath);await p.locator('[data-backup-preview]').waitFor();
  check('WebKit decrypts the Chromium-created backup',await p.locator('[data-backup-preview]').innerText().then(t=>t.includes('Accepted portrait included')));
  await p.getByLabel('Consent to open backup',{exact:true}).check();await click(p,'Open this reflection');await report(p);
  check('WebKit displays the byte-preserved portrait',await p.locator('.nh-portrait img').evaluate(e=>e.naturalWidth>0));
  await p.evaluate(()=>{window.__printed=0;window.print=()=>window.__printed++;});await click(p,'Print Superhero / Save PDF');
  check('WebKit restored report prints without regeneration',await p.evaluate(()=>window.__printed===1)&&posts===0);
  await click(p,'Backup reflection & portrait');check('iPhone backup page fits',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await p.screenshot({path:resolve(out,'backup-iphone-webkit.png'),fullPage:true});await c.close();
 }catch(e){failures.push(e.stack);process.exitCode=1;}finally{await b.close();}
}
check('No paid generation or data-upload POST occurred',posts===0);
check('No browser JavaScript errors',errors.length===0);
const result={origin,at:new Date().toISOString(),passed:checks.length,failed:failures.length,checks,errors,failures,providerCalls:0};
writeFileSync(resolve(out,'verification.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
