// Browser tests use simulated portrait-service responses. No sign-in credentials or paid requests.
import {chromium,webkit,devices} from '/Users/utlyze/Projects/freely-sweet/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {saveRecord} from '../src/utils/assessmentProfile.mjs';
import {makeHeroRecord} from '../src/utils/neurohero/storage.mjs';
import {SAMPLE_HERO_ANSWERS} from '../src/data/neurohero/processes.mjs';
import {normalizePortraitChoices} from '../src/utils/neurohero/portraitBrief.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');process.chdir(root);
const origin=process.env.CORTEX_TEST_ORIGIN||'http://127.0.0.1:5551',out=process.env.CORTEX_TEST_OUTPUT||'.local-evidence/portable-profiles/editions';mkdirSync(out,{recursive:true});
const image=readFileSync('public/reports/xai/Cortex-Compass-xAI-Signal-Cartographer.jpg'),sha256=createHash('sha256').update(image).digest('hex');
const choices=normalizePortraitChoices({presentation:'woman'}),spec={heroId:'signal_cartographer',choices,edition:2};
const fixture=saveRecord({setItem:()=>{}},{},null,true,{},{},makeHeroRecord({answers:SAMPLE_HERO_ANSWERS,selectedId:'signal_cartographer',portraitChoices:choices}));
const checks=[],errors=[],failures=[];const check=(label,ok)=>{assert.ok(ok,label);checks.push(label);console.log('PASS '+label);};
const click=(p,name)=>p.getByRole('button',{name,exact:true}).click();
for(const [engine,name,viewport] of [[chromium,'Chromium',{viewport:{width:1440,height:1000}}],[webkit,'WebKit',devices['iPhone 13']]]){
 const browser=await engine.launch();
 try{
 const context=await browser.newContext(viewport),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));let posts=0,authenticated=true,remaining=0,hold=false,release=null;
 const ready={id:'22222222-2222-4222-8222-222222222222',status:'ready',createdAt:2,spec,sha256,contentType:'image/jpeg',bytes:image.length};
 let jobs=[{...ready,id:'11111111-1111-4111-8111-111111111111',status:'failed',spec:{...spec,edition:0}},ready];
 await p.route('**/api/portraits/**',async route=>{
  const r=route.request(),path=new URL(r.url()).pathname;
  const send=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  if(path.endsWith('/status')){const value={available:true,authenticated,remaining,jobs};if(hold){hold=false;await new Promise(resolve=>release=resolve);}return send(value);}
  if(path.endsWith('/session')&&r.method()==='DELETE'){authenticated=false;return send({authenticated:false});}
  if(path.endsWith('/jobs')&&r.method()==='POST'){
   posts++;const body=JSON.parse(r.postData());check(`${name}: new request carries only the confirmed visual specification`,Object.keys(body).sort().join(',')==='consent,requestId,spec'&&body.consent===true&&body.spec.edition===3);
   const job={...ready,id:'33333333-3333-4333-8333-333333333333',status:'running',progress:'requesting-image',spec:body.spec};jobs=[...jobs,job];remaining--;return send({job});
  }
  if(path.endsWith('/image'))return route.fulfill({status:200,contentType:'image/jpeg',body:image});
  return route.fulfill({status:404,contentType:'application/json',body:'{"error":"not_found"}'});
 });
 await p.goto(origin);await p.evaluate(r=>localStorage.setItem('cortex-compass-profile',JSON.stringify(r)),fixture);await p.reload();await click(p,'Open saved profile');await click(p,'Deep Hero Atlas · Signal Cartographer');await click(p,'Build my hero field guide →');await p.locator('.nh-xai-account').waitFor();
 check(`${name}: saved edition remains available with zero generation allowance`,await p.getByRole('button',{name:'Open saved edition 3',exact:true}).isEnabled());
 await click(p,'Open saved edition 3');await p.locator('.nh-xai-preview img').waitFor();await p.waitForFunction(()=>document.querySelector('.nh-xai-preview img')?.naturalWidth>0);
 check(`${name}: opening a saved edition submits no generation request`,posts===0);await click(p,'Use this portrait in my report');await p.locator('[data-portrait-state="ready"]').waitFor();
 await p.getByLabel('Hero presentation',{exact:true}).selectOption('man');await p.locator('.nh-xai-library button').filter({hasText:'Edition 3'}).click();await p.locator('.nh-visual-mismatch').waitFor();
 check(`${name}: different saved artwork needs an explicit choice`,await p.getByRole('button',{name:'Use this portrait in my report',exact:true}).isDisabled());
 await p.locator('.nh-visual-mismatch input').check();await click(p,'Use this portrait in my report');await p.getByRole('status').filter({hasText:'Artwork added'}).waitFor();
 check(`${name}: adopting different artwork does not change current visual preferences`,await p.getByLabel('Hero presentation',{exact:true}).inputValue()==='man');
 await p.getByLabel('Hero presentation',{exact:true}).selectOption('woman');await p.locator('header').getByRole('button',{name:'Back to hero atlas',exact:true}).click();await click(p,'Build my hero field guide →');await p.locator('.nh-xai-account').waitFor();
 check(`${name}: reopening does not reset the accepted library edition to zero`,await p.getByRole('button',{name:'Open saved edition 3',exact:true}).isEnabled());
 remaining=2;await click(p,'Refresh my portraits');p.once('dialog',d=>d.accept());await click(p,'Choose another edition');
 check(`${name}: next edition is unused and needs fresh consent`,await p.getByRole('button',{name:'Create my xAI portrait',exact:true}).isDisabled()&&await p.locator('.nh-edition-status').innerText().then(t=>t.includes('Edition 4')));
 await p.locator('.nh-xai-panel>.nh-image-consent input').check();await click(p,'Create my xAI portrait');await p.locator('[data-xai-status="running"]').waitFor();
 jobs=jobs.map(j=>j.id.startsWith('3333')?{...j,progress:'image-validated'}:j);await p.locator('.nh-xai-preview [role="status"]').filter({hasText:'Saving the private portrait'}).waitFor({timeout:15000});
 check(`${name}: progress changes display without changing job status`,true);check(`${name}: only the explicit generation action posts`,posts===1);
 await p.screenshot({path:resolve(out,`${name}-library.png`),fullPage:true});hold=true;await p.waitForRequest(r=>new URL(r.url()).pathname.endsWith('/api/portraits/status'),{timeout:10000});
 await click(p,'Sign out of portraits');await p.locator('.nh-xai-access input').waitFor();if(release)release();await p.waitForTimeout(400);
 check(`${name}: a late library response cannot restore the signed-out UI`,await p.locator('.nh-xai-account').count()===0&&await p.locator('.nh-xai-access input').isVisible());
 await context.close();
 }catch(e){failures.push(`${name}: ${e.stack}`);process.exitCode=1;}finally{await browser.close();}
}
if(errors.length){failures.push(...errors);process.exitCode=1;}else check('No JavaScript errors across both engines',true);
const result={origin,at:new Date().toISOString(),passed:checks.length,failed:failures.length,checks,errors,failures,providerCalls:0,serviceMode:'Simulated private library and job responses; no credentials or paid generation'};
writeFileSync(resolve(out,'verification.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
