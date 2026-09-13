// Prepare and verify an immutable local release. This script does not deploy or alter cloud resources.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,cpSync,readdirSync,statSync,existsSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),out=resolve(root,'.local-evidence/hero-editions'),snapshot=resolve(out,'release-candidate');
const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();
assert.equal(git('status','--porcelain','--','src','worker','wrangler.jsonc','public'),'');
assert.equal(git('diff','43ceccb','--name-only','--','worker','wrangler.jsonc','src/data/neurohero'),'');
const proof=JSON.parse(readFileSync(resolve(out,'final-checks/receipt.json')));assert.equal(proof.ok,true);assert.ok(proof.passed>=281);
const unit=readFileSync(resolve(out,'unit-final.log'),'utf8');assert.match(unit,/# pass 253/);assert.match(unit,/# fail 0/);
const executable='/Users/utlyze/Projects/freely-sweet/node_modules/.bin/wrangler';
const env={...process.env,CLOUDFLARE_AUTH_USE_KEYRING:'true',WRANGLER_SEND_METRICS:'false'};
const native=()=>JSON.parse(execFileSync(executable,['deployments','list','--config',resolve(root,'wrangler.jsonc'),'--json'],{env,encoding:'utf8'})).at(-1);
const expected='6fc5170e-fbea-44f1-bfaf-07e0b6d7fec0';assert.deepEqual(native().versions,[{version_id:expected,percentage:100}]);
assert.equal(existsSync(snapshot),false);mkdirSync(snapshot);
for(const name of ['src','worker','dist'])cpSync(resolve(root,name),resolve(snapshot,name),{recursive:true});cpSync(resolve(root,'wrangler.jsonc'),resolve(snapshot,'wrangler.jsonc'));
function paths(dir){return readdirSync(dir).flatMap(n=>{const p=resolve(dir,n);return statSync(p).isDirectory()?paths(p):[p];});}
const files=Object.fromEntries(paths(snapshot).map(p=>[relative(snapshot,p),createHash('sha256').update(readFileSync(p)).digest('hex')]));
assert.deepEqual(native().versions,[{version_id:expected,percentage:100}]);
const record={sourceCommit:git('rev-parse','HEAD'),previousVersion:expected,verifiedAt:new Date().toISOString(),files};
writeFileSync(resolve(out,'release-manifest.json'),JSON.stringify(record,null,2));console.log(JSON.stringify({sourceCommit:record.sourceCommit,snapshot,files:Object.keys(files).length,previousVersion:expected}));
