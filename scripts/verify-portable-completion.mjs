import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),out=resolve(root,'.local-evidence/portable-profiles');
const locations={editions:'live/editions',backup:'live/backup',hero:'review-live-hero-cwd','hero-webkit':'live/hero-webkit',reports:'live/reports',development:'live/development',brand:'live/brand'};
const suites={};
for(const [name,folder] of Object.entries(locations)){const result=JSON.parse(readFileSync(resolve(out,folder,'verification.json')));assert.equal(result.origin,'https://cortexcompass.utlyze.com');assert.equal(result.failed,0,name);assert.equal(result.errors.length,0,name);suites[name]={passed:result.passed,evidence:folder+'/verification.json'};}
const hashes=JSON.parse(readFileSync(resolve(out,'public-hashes.json')));assert.equal(hashes.files.length,7);
const versions=JSON.parse(execFileSync('/Users/utlyze/Projects/freely-sweet/node_modules/.bin/wrangler',['deployments','list','--config',resolve(root,'wrangler.jsonc'),'--json'],{env:{...process.env,CLOUDFLARE_AUTH_USE_KEYRING:'true',WRANGLER_SEND_METRICS:'false'},encoding:'utf8'}));
const native=versions.at(-1);assert.deepEqual(native.versions,[{version_id:'6fc5170e-fbea-44f1-bfaf-07e0b6d7fec0',percentage:100}]);
const local=JSON.parse(readFileSync(resolve(out,'acceptance.json')));
const receipt={status:'released-and-publicly-verified',verifiedAt:new Date().toISOString(),origin:hashes.origin,sourceCommit:'df725752a7af85bda77f23073780541e4dea66fe',workerVersion:native.versions[0].version_id,deployedAt:native.created_on,unitTests:local.unitTests,liveSuites:suites,liveChecks:Object.values(suites).reduce((n,x)=>n+x.passed,0),publicAssetHashes:hashes.files.length,paidImageRequests:0,portraitLibraryTests:'simulated workspace responses in the live application',backupTests:'actual encrypted download and cross-browser restoration; synthetic profile only',priorFailedReceiptsRetained:['live/hero/verification.json','review-live-hero/verification.json']};
writeFileSync(resolve(out,'COMPLETION.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt,null,2));
