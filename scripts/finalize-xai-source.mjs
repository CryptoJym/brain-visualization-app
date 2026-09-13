// Surgical changes in this owned working copy. Does not call providers or access credentials.
import {readFileSync,writeFileSync} from 'node:fs';
const path=new URL('../worker/portraits/service.mjs',import.meta.url);
let source=readFileSync(path,'utf8');
const replace=(oldText,newText)=>{if(source.split(oldText).length!==2)throw new Error('Source changed; inspect before editing.');source=source.replace(oldText,newText);};
replace("import {checkXaiConnection} from './connection.mjs';\n",'');
replace(" if(path==='/connection'&&request.method==='GET')return json(await checkXaiConnection(this.env.CORTEX_XAI_API_KEY));\n",'');
replace("if(request.method==='DELETE'&&!isImage){if(j.status==='running'){await this.store.put(key,{...j,deleteRequested:true});return json({deletionPending:true},202);}await this.env.PORTRAIT_IMAGES.delete(s.account+'/'+id);await this.store.put(key,{id:j.id,account:j.account,status:'deleted',createdAt:j.createdAt});return json({deleted:true});}",
"if(request.method==='DELETE'&&!isImage){const state=await this.store.transaction(async tx=>{const current=await tx.get(key);if(!current||current.status==='deleted')throw new PortraitError('not_found',404);const status=current.status==='running'?'running':'deleting';await tx.put(key,{...current,status,deleteRequested:true});return status;});if(state==='running')return json({deletionPending:true},202);await this.env.PORTRAIT_IMAGES.delete(s.account+'/'+id);await this.finish(key,{status:'deleted',spec:null});return json({deleted:true});}");
replace("if(j)await tx.put(key,{...j,...patch});","if(j){const removed=j.deleteRequested||['deleted','deleting'].includes(j.status)||patch.status==='deleted';await tx.put(key,removed?{id:j.id,account:j.account,status:'deleted',createdAt:j.createdAt}:{...j,...patch});}");
replace("if(!j||j.status==='deleted'){","if(j?.status==='deleting'){await this.env.PORTRAIT_IMAGES.delete(j.account+'/'+j.id);await this.finish(key,{status:'deleted',spec:null});await this.store.setAlarm(Date.now()+100);return;}\n if(!j||j.status==='deleted'){");
replace("if(!j||j.status==='deleted')throw new PortraitError('not_found',404);","if(!j||['deleted','deleting'].includes(j.status))throw new PortraitError('not_found',404);");
replace("filter(j=>j.status!=='deleted')","filter(j=>!['deleted','deleting'].includes(j.status))");
writeFileSync(path,source);
console.log('Removed temporary provider diagnostic route and made cloud deletion intent durable before storage I/O.');
