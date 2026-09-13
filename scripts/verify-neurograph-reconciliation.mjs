// NG01 acceptance: graph-only import; existing application and built assets remain unchanged.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,readdirSync,mkdirSync} from 'node:fs';
import {resolve,relative,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {validateGraph} from '../src/utils/neurograph/graphEngine.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const baseline='2aa769bc3728146a3bfa8801da0253b93c4293f8';
const checkpoint='aae0e60e9d0b36c17ec19154c32881a11be90413';
const evidence=resolve(root,'.local-evidence/neurograph-next');mkdirSync(evidence,{recursive:true});
const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const checks=[];
const baselineFiles=git('ls-tree','-r','--name-only',baseline).split('\n').filter(p=>p.startsWith('src/')||p.startsWith('public/')||p.startsWith('worker/')||/^(package(-lock)?\.json|wrangler\.jsonc|index\.html|vite\.config\.)/.test(p));
for(const path of baselineFiles){const original=execFileSync('git',['-C',root,'show',`${baseline}:${path}`],{maxBuffer:64*1024*1024});assert.equal(hash(readFileSync(resolve(root,path))),hash(original),`Existing runtime file changed: ${path}`);}
checks.push({name:'existing-runtime-files-identical',count:baselineFiles.length});
const graphFiles=git('show','--pretty=format:','--name-only',checkpoint).split('\n').filter(Boolean);
for(const path of graphFiles){const original=execFileSync('git',['-C',root,'show',`${checkpoint}:${path}`],{maxBuffer:64*1024*1024});assert.equal(hash(readFileSync(resolve(root,path))),hash(original),`Graph checkpoint changed: ${path}`);}
checks.push({name:'graph-checkpoint-files-identical',count:graphFiles.length});
function walk(folder){return readdirSync(folder,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(folder,e.name)):[resolve(folder,e.name)]);}
const built=walk(resolve(root,'dist')).map(p=>relative(resolve(root,'dist'),p)).sort();
const prior=resolve(root,'../cortex-compass-hero-editions-20260913/.local-evidence/hero-editions/final-release-snapshot/dist');
const originalBuilt=walk(prior).map(p=>relative(prior,p)).sort();assert.deepEqual(built,originalBuilt,'Built asset list changed');
for(const path of built)assert.equal(hash(readFileSync(resolve(root,'dist',path))),hash(readFileSync(resolve(prior,path))),`Built asset changed: ${path}`);
checks.push({name:'built-assets-identical-to-deployed-snapshot',count:built.length});
const unit=readFileSync(resolve(evidence,'all-tests.log'),'utf8');assert.match(unit,/# pass 262\b/);assert.match(unit,/# fail 0\b/);
const prototype=readFileSync(resolve(evidence,'prototype-tests.log'),'utf8');assert.match(prototype,/# pass 9\b/);assert.match(prototype,/# fail 0\b/);
checks.push({name:'test-baseline',applicationTests:253,prototypeTests:9,total:262,clinicalValidation:false});
const graph=validateGraph();assert.equal(graph.ok,true);
const wrangler='/Users/utlyze/Projects/freely-sweet/node_modules/.bin/wrangler';
const env={...process.env,CLOUDFLARE_AUTH_USE_KEYRING:'true',WRANGLER_SEND_METRICS:'false'};
const deployment=JSON.parse(execFileSync(wrangler,['deployments','list','--config',resolve(root,'wrangler.jsonc'),'--json'],{env,encoding:'utf8'})).at(-1);
assert.deepEqual(deployment.versions,[{version_id:'e127727f-f809-4b6f-85ca-fa7e7f67b75d',percentage:100}]);
checks.push({name:'production-unchanged',version:deployment.versions[0].version_id});
const receipt={status:'baseline-reconciliation-verified',verifiedAt:new Date().toISOString(),workItem:'eco-eib7d3',baselineCommit:baseline,originalGraphCheckpoint:checkpoint,branch:git('branch','--show-current'),graph,checks,liveGraphEnabled:false,scientificCalibrationCompleted:false,paidRequests:0};
writeFileSync(resolve(evidence,'verification.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt,null,2));
