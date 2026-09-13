// No credentials or paid requests. WebKit renders the live app with an explicitly simulated portrait library.
import {webkit,devices} from '/Users/utlyze/Projects/freely-sweet/node_modules/playwright/index.mjs';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const origin='https://cortexcompass.utlyze.com',out='.local-evidence/xai-portraits/webkit-ui';mkdirSync(out,{recursive:true});
const image=readFileSync('.local-evidence/xai-portraits/live/live-xai-hero.png');
const job={id:'22222222-2222-4222-8222-222222222222',status:'ready',createdAt:1,spec:{heroId:'signal_cartographer',edition:0},sha256:createHash('sha256').update(image).digest('hex'),contentType:'image/png',bytes:image.length};
const checks=[],errors=[];const check=(name,ok)=>{assert.ok(ok,name);checks.push(name);console.log('PASS '+name);};
const browser=await webkit.launch();
try{
 const context=await browser.newContext({...devices['iPhone 13']});let signedIn=false,requests=0;
 await context.route('**/api/portraits/**',async route=>{
  const r=route.request(),path=new URL(r.url()).pathname;let data;
  if(path.endsWith('/status'))data={available:true,authenticated:signedIn,remaining:0,provider:'xAI',jobs:signedIn?[job]:[]};
  else if(path.endsWith('/session')&&r.method()==='POST'){signedIn=true;data={authenticated:true};}
  else if(path.endsWith('/image'))return route.fulfill({status:200,contentType:'image/png',body:image});
  else{requests++;return route.fulfill({status:403,contentType:'application/json',body:'{"error":"test_not_permitted"}'});}
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin,{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Explore hero sample',exact:true}).click();await page.getByRole('button',{name:'Build my hero field guide →',exact:true}).click();
 check('WebKit pilot explains restricted access',await page.locator('.nh-xai-panel').innerText().then(t=>t.includes('not public account registration')));
 await page.locator('.nh-xai-access input').fill('synthetic-not-a-real-pass');await page.getByRole('button',{name:'Unlock portrait studio',exact:true}).click();await page.locator('.nh-xai-account').waitFor();
 check('WebKit displays the simulated saved library',await page.locator('.nh-xai-library button').count()===1);
 await page.locator('.nh-xai-library button').click();await page.locator('.nh-xai-preview img').waitFor();await page.getByRole('button',{name:'Use this portrait in my report',exact:true}).click();await page.locator('[data-portrait-state="ready"]').waitFor();
 check('WebKit validates and saves accepted image bytes',await page.locator('.nh-portrait img').evaluate(e=>e.naturalWidth>0));
 check('iPhone studio has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:`out`,fullPage:false}).catch(()=>{});
 await page.screenshot({path:`${out}/portrait-studio-iphone.png`,fullPage:true});
 await page.getByRole('button',{name:'Use this visual direction →',exact:true}).click();await page.locator('[data-portrait-state="ready"]').waitFor();
 check('WebKit report embeds the accepted portrait',await page.locator('.nh-portrait img').evaluate(e=>e.naturalWidth>0));
 await page.evaluate(()=>{window.__printCount=0;window.print=()=>window.__printCount++;});
 await page.getByRole('button',{name:'Print Superhero / Save PDF',exact:true}).click();
 check('WebKit print uses the existing image without a paid request',await page.evaluate(()=>window.__printCount===1)&&requests===0);
 await page.getByRole('button',{name:'Strengths-only card',exact:true}).click();await page.locator('[data-portrait-state="ready"]').waitFor();
 check('WebKit strengths card keeps portrait but excludes private history',await page.locator('.nh-portrait img').evaluate(e=>e.naturalWidth>0)&&await page.locator('.cc-private-ledger').count()===0);
 check('No WebKit JavaScript errors',errors.length===0);
 writeFileSync(`${out}/verification.json`,JSON.stringify({origin,passed:checks.length,failed:0,checks,errors,providerCalls:0,mode:'Live application; simulated API library and sign-in; existing fictional xAI image. No production credentials used.'},null,2));
}finally{await browser.close();}
