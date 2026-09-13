import {spawnSync} from 'node:child_process';
import {openSync,closeSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'.local-evidence/portable-profiles');mkdirSync(output,{recursive:true});
const origin=process.env.CORTEX_TEST_ORIGIN||'http://127.0.0.1:5551';
const suites=[['editions','verify-portrait-editions.mjs'],['backup','verify-portable-profiles.mjs'],['hero','verify-neurohero-v9.mjs'],['hero-webkit','verify-neurohero-webkit.mjs'],['reports','verify-reports-v6.mjs'],['development','verify-development-v7.mjs'],['brand','verify-brand.mjs']];
const receipts=[];
for(const [name,script] of suites){
 const log=resolve(output,`${name}.log`),fd=openSync(log,'w');
 const result=spawnSync(process.execPath,[resolve(root,'scripts',script)],{cwd:root,env:{...process.env,CORTEX_TEST_ORIGIN:origin,CORTEX_TEST_OUTPUT:resolve(output,name)},stdio:['ignore',fd,fd],timeout:240000});closeSync(fd);
 const item={name,exitCode:result.status,error:result.error?.message||null};receipts.push(item);console.log(JSON.stringify(item));
 if(result.status!==0)console.log(readFileSync(log,'utf8').slice(-5000));
}
writeFileSync(resolve(output,'check-chain.json'),JSON.stringify({origin,at:new Date().toISOString(),suites:receipts},null,2));
if(receipts.some(r=>r.exitCode!==0))process.exitCode=1;
