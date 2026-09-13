// Read-only Gamma workspace metadata. Credential arrives over stdin and is never logged.
import {writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const out=new URL('../.local-evidence/hero-editions/',import.meta.url);mkdirSync(out,{recursive:true});
let key='';for await(const chunk of process.stdin)key+=chunk;key=key.trim();
const response=await fetch('https://public-api.gamma.app/v1.0/themes',{headers:{'X-API-KEY':key},signal:AbortSignal.timeout(20000),redirect:'error'});key='';
if(!response.ok){console.log(JSON.stringify({status:response.status,available:false}));process.exitCode=1;}
else{const body=await response.json();const themes=Array.isArray(body)?body:(body.data||body.themes||[]);const receipt={observedAt:new Date().toISOString(),status:response.status,themeCount:themes.length,themes:themes.map(t=>({id:t.id,name:t.name,type:t.type})),nextCursor:body.nextCursor||null};writeFileSync(new URL('gamma-capabilities.json',out),JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt,null,2));}
