// Read-only workspace-theme check through the owner's existing secret helper.
// No private reflection or image is uploaded, and the credential is never printed.
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
let key=execFileSync('/Users/utlyze/bin/infisical-secret',['GAMMA_API_KEY','--project','new-reward','--env','prod'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const r=await fetch('https://public-api.gamma.app/v1.0/themes',{headers:{'X-API-KEY':key},signal:AbortSignal.timeout(20000),redirect:'error'});key='';
let result={status:r.status,available:r.ok};
if(r.ok){const body=await r.json();const list=Array.isArray(body)?body:(body.data||body.themes||[]);result={...result,themeCount:list.length,themes:list.map(t=>({id:t.id,name:t.name,type:t.type})),nextCursor:body.nextCursor||null};}
writeFileSync(new URL('../.local-evidence/hero-editions/gamma-capabilities.json',import.meta.url),JSON.stringify({...result,checkedAt:new Date().toISOString()},null,2));console.log(JSON.stringify(result,null,2));
