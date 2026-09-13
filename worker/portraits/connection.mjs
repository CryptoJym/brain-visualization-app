// Authenticated, non-billable provider readiness probe. Returns classifications, never secret values.
const classify=e=>{const m=String(e?.message||'');return /header/i.test(m)?'invalid-header':/invocation|this reference/i.test(m)?'native-receiver':/AbortSignal|timeout is not/i.test(m)?'timeout-api':/redirect/i.test(m)?'redirect-policy':/time|abort/i.test(m)?'timeout':/fetch|network|connect/i.test(m)?'network':String(e?.name||'unknown-error');};
export async function checkXaiConnection(key){
 const result={credentialHasOuterWhitespace:key!==key.trim(),credentialContainsLineBreak:/[\r\n]/.test(key),timeoutApi:typeof AbortSignal.timeout,provider:'xAI',checks:[]};
 for(const mode of ['original','normalized']){let timer;
 try{const controller=new AbortController();timer=setTimeout(()=>controller.abort(),15000);const original=fetch;const headers={Authorization:`Bearer ${mode==='original'?key:key.trim()}`};const init={headers,signal:mode==='original'?AbortSignal.timeout(15000):controller.signal,redirect:mode==='original'?'error':'manual'};const r=mode==='original'?await original('https://api.x.ai/v1/models',init):await globalThis.fetch('https://api.x.ai/v1/models',init);const body=await r.json();result.checks.push({mode,status:r.status,imageModelAvailable:body.data?.some(x=>x.id==='grok-imagine-image-2.0')||false});}
 catch(e){result.checks.push({mode,error:classify(e)});}finally{clearTimeout(timer);}}
 return result;
}
