// Bounded runtime diagnostics: discard all headers, request bodies, cookies, logs and identities.
import {spawn} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const child=spawn('/Users/utlyze/Projects/freely-sweet/node_modules/.bin/wrangler',['tail','cortex-compass','--format','json'],{env:{...process.env,CLOUDFLARE_AUTH_USE_KEYRING:'true',WRANGLER_SEND_METRICS:'false'},stdio:['ignore','pipe','pipe']});
const rows=[];let buffer='',document='';
child.stdout.on('data',chunk=>{buffer+=chunk;let index;while((index=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,index);buffer=buffer.slice(index+1);if(!document&&line.trim()!=='{')continue;document+=line+'\n';try{const data=JSON.parse(document);document='';const row={at:new Date().toISOString(),outcome:data.outcome,wallTime:data.wallTime,cpuTime:data.cpuTime,eventType:data.event?.request?'request':'alarm-or-event',exceptions:(data.exceptions||[]).map(e=>({name:e.name,category:/memory/i.test(e.message||'')?'memory-limit':/cpu/i.test(e.message||'')?'cpu-limit':/duration|time/i.test(e.message||'')?'time-limit':'other'}))};rows.push(row);console.log(JSON.stringify(row));}catch{}}});
const stop=()=>{child.kill('SIGTERM');writeFileSync('.local-evidence/xai-portraits/runtime-diagnostics.json',JSON.stringify(rows,null,2));};
setTimeout(stop,240000);process.on('SIGTERM',()=>{stop();process.exit(0);});
