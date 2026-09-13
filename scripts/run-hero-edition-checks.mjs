import {spawnSync} from 'node:child_process';
import {openSync,closeSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=resolve(process.env.CORTEX_CHECK_OUTPUT||resolve(root,'.local-evidence/hero-editions/final-checks'));mkdirSync(out,{recursive:true});
const origin=process.env.CORTEX_TEST_ORIGIN||'http://127.0.0.1:5681';
const suites=[['hero-editions','verify-hero-editions.mjs'],['edition-webkit','verify-hero-editions-webkit.mjs'],['hero','verify-neurohero-v9.mjs'],['webkit','verify-neurohero-webkit.mjs'],['reports','verify-reports-v6.mjs'],['development','verify-development-v7.mjs'],['backup','verify-portable-profiles.mjs'],['portrait-editions','verify-portrait-editions.mjs'],['brand','verify-brand.mjs']];
const receipts=[];
for(const [name,script] of suites){const fd=openSync(resolve(out,name+'.log'),'w');const r=spawnSync(process.execPath,[resolve(root,'scripts',script)],{cwd:root,env:{...process.env,CORTEX_TEST_ORIGIN:origin,CORTEX_TEST_OUTPUT:resolve(out,name)},stdio:['ignore',fd,fd],timeout:240000});closeSync(fd);let proof=null;try{proof=JSON.parse(readFileSync(resolve(out,name,'verification.json'),'utf8'));}catch{}
 const row={name,exitCode:r.status,passed:proof?.passed||0,failed:proof?.failed??1,errorCount:proof?.errors?.length??0};receipts.push(row);console.log(JSON.stringify(row));if(r.status!==0)console.log(readFileSync(resolve(out,name+'.log'),'utf8').slice(-3000));}
const result={origin,observedAt:new Date().toISOString(),suites:receipts,passed:receipts.reduce((sum,r)=>sum+r.passed,0),ok:receipts.every(r=>r.exitCode===0&&r.failed===0&&r.errorCount===0)};writeFileSync(resolve(out,'receipt.json'),JSON.stringify(result,null,2));if(!result.ok)process.exitCode=1;
