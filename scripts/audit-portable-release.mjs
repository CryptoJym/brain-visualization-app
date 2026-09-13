import {spawnSync,execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,readdirSync,openSync,closeSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),out=resolve(root,'.local-evidence/portable-profiles');process.chdir(root);
const fd=openSync(resolve(out,'final-unit.log'),'w');const unit=spawnSync(process.execPath,['--test',...readdirSync('tests').filter(n=>n.endsWith('.test.mjs')).map(n=>resolve('tests',n))],{stdio:['ignore',fd,fd]});closeSync(fd);assert.equal(unit.status,0);const log=readFileSync(resolve(out,'final-unit.log'),'utf8');const unitCount=Number(log.match(/# pass (\d+)/)?.[1]);console.log('Unit checks:',unitCount);
const unchanged=execFileSync('git',['diff','a7b13ce','--name-only','--','worker','wrangler.jsonc','src/data'],{encoding:'utf8'}).trim();assert.equal(unchanged,'','Provider backend/config and neuroscience data must remain unchanged');
const suites={};for(const name of ['editions','backup','hero','hero-webkit','reports','development','brand']){const p=resolve(out,name,'verification.json'),d=JSON.parse(readFileSync(p));assert.equal(d.failed,0,name);assert.equal(d.errors?.length||0,0,name);suites[name]=d.passed;}
const pdf=resolve(out,'backup/Restored-Fictional-Hero-A4.pdf'),render=resolve(out,'print-render');mkdirSync(render,{recursive:true});
const info=execFileSync('pdfinfo',[pdf],{encoding:'utf8'});assert.match(info,/Pages:\s+2/);const images=execFileSync('pdfimages',['-list',pdf],{encoding:'utf8'});assert.ok(images.split('\n').some(l=>/\bimage\b/.test(l)&&Number(l.trim().split(/\s+/)[3])>=500));
execFileSync('pdftoppm',['-scale-to','1100','-png',pdf,resolve(render,'restored')],{stdio:'ignore'});
const receipt={at:new Date().toISOString(),unitTests:unitCount,localBrowserChecks:suites,browserTotal:Object.values(suites).reduce((a,b)=>a+b,0),backendAndNeuroscienceUnchanged:true,restoredPdfPages:2,portraitEmbedded:true,paidProviderCalls:0};
writeFileSync(resolve(out,'acceptance.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt,null,2));
