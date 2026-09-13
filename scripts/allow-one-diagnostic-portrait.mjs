// Authorize exactly one additional manual diagnostic attempt; never reset the spending ledger.
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
const metadata=JSON.parse(readFileSync('.local-evidence/xai-portraits/access-metadata.json'));
const entries=JSON.parse(execFileSync('/Users/utlyze/bin/infisical-secret',['CORTEX_PORTRAIT_ACCESS','--project','utlyze-web','--env','prod'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));
const target=entries.find(e=>e.account===metadata.verification.account);if(!target||![1,2,3].includes(target.limit))throw new Error('Unexpected verification grant; nothing changed.');
target.limit=3;metadata.verification.limit=3;
const receipt=execFileSync('/Users/utlyze/bin/hub-put',['CORTEX_PORTRAIT_ACCESS','--project','utlyze-web','--env','prod','--from','stdin'],{input:JSON.stringify(entries),encoding:'utf8',stdio:['pipe','pipe','pipe']});
writeFileSync('.local-evidence/xai-portraits/access-metadata.json',JSON.stringify(metadata,null,2));console.log(receipt.trim());console.log('Verification workspace allowance is three total attempts, including the two non-retried failed attempts. Owner grant unchanged.');
