// Create narrowly scoped pilot access in the existing vault. No pass or key is printed.
import {execFileSync} from 'node:child_process';
import {randomBytes,createHash,randomUUID} from 'node:crypto';
import {writeFileSync,mkdirSync,existsSync,readFileSync} from 'node:fs';
const root=new URL('../.local-evidence/xai-portraits/',import.meta.url);mkdirSync(root,{recursive:true});
const read=name=>{try{return execFileSync('/Users/utlyze/bin/infisical-secret',[name,'--project','utlyze-web','--env','prod'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();}catch{return null;}};
const put=(name,value)=>{const receipt=execFileSync('/Users/utlyze/bin/hub-put',[name,'--project','utlyze-web','--env','prod','--from','stdin'],{input:value,encoding:'utf8',stdio:['pipe','pipe','pipe']});console.log(receipt.trim());};
const path=new URL('access-metadata.json',root);let meta=existsSync(path)?JSON.parse(readFileSync(path)):{};
const entries=[];
for(const [label,name,limit] of [['owner','CORTEX_PORTRAIT_OWNER_PASS',10],['verification','CORTEX_PORTRAIT_TEST_PASS',1]]){
 let pass=read(name);if(!pass){pass=randomBytes(32).toString('base64url');put(name,pass);}if(!/^[A-Za-z0-9_-]{43}$/.test(pass))throw new Error('Unexpected access-pass format; nothing overwritten.');
 const account=meta[label]?.account||randomUUID();const expires=meta[label]?.expires||Date.now()+90*86400000;
 meta[label]={account,expires,limit,vaultReference:`utlyze-web/prod/${name}`};entries.push({account,expires,limit,hash:createHash('sha256').update(pass).digest('hex')});
}
put('CORTEX_PORTRAIT_ACCESS',JSON.stringify(entries));let salt=read('CORTEX_PORTRAIT_RATE_SALT');if(!salt)put('CORTEX_PORTRAIT_RATE_SALT',randomBytes(32).toString('base64url'));
writeFileSync(path,JSON.stringify(meta,null,2));console.log('Private portrait pilot access preserved in the secret hub. No public signup or email identity claim.');
