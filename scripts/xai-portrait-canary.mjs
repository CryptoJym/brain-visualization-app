import {generateXaiPortrait,XAI_CONFIG} from '../worker/portraits/xai.mjs';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
const dir=new URL('../.local-evidence/xai-portraits/',import.meta.url);mkdirSync(dir,{recursive:true});
if(existsSync(new URL('canary-receipt.json',dir)))throw new Error('A completed canary already exists; no second paid request was made.');
let key='';for await(const part of process.stdin)key+=part;key=key.trim();
const spec={heroId:'signal_cartographer',choices:{presentation:'woman',skinTone:'medium',build:'athletic',hair:'curly',accessibility:'none-specified',setting:'mountain-observatory'},edition:0};
const start=Date.now();try{
 const image=await generateXaiPortrait(spec,{apiKey:key});key='';
 const name=image.contentType==='image/jpeg'?'xai-hero-canary.jpg':'xai-hero-canary.png';writeFileSync(new URL(name,dir),image.bytes);
 const receipt={provider:'xAI',at:new Date().toISOString(),model:image.model,requestConfig:XAI_CONFIG,elapsedSeconds:(Date.now()-start)/1000,bytes:image.bytes.length,sha256:image.sha256,moderation:image.moderation,file:name,fixture:'Fictional adult hero. No real questionnaire answers or personal information sent.',estimatedImageCostUsd:0.08};
 writeFileSync(new URL('canary-receipt.json',dir),JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt,null,2));
}catch(e){key='';console.log(JSON.stringify({success:false,code:e.code||'canary_failed'}));process.exitCode=1;}
