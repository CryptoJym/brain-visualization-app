// Transfer only hashed pilot grant configuration from the existing vault to the native Worker secret.
import {execFileSync} from 'node:child_process';
const grants=execFileSync('/Users/utlyze/bin/infisical-secret',['CORTEX_PORTRAIT_ACCESS','--project','utlyze-web','--env','prod'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const entries=JSON.parse(grants);if(!Array.isArray(entries)||entries.some(e=>!/^[a-f0-9]{64}$/.test(e.hash)||e.limit>25))throw new Error('Grant configuration did not validate.');
const receipt=execFileSync('/Users/utlyze/Projects/freely-sweet/node_modules/.bin/wrangler',['secret','put','CORTEX_PORTRAIT_ACCESS','--config','wrangler.jsonc'],{input:grants,env:{...process.env,CLOUDFLARE_AUTH_USE_KEYRING:'true',WRANGLER_SEND_METRICS:'false'},encoding:'utf8',stdio:['pipe','pipe','pipe']});
console.log(receipt.trim());
