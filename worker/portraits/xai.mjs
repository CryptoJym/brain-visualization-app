import {compileXaiPortraitPrompt,XAI_STYLE_VERSION} from '../../src/utils/neurohero/xaiVisual.mjs';
import {COMPOSITION_BY_ID} from '../../src/data/neurohero/compositions.mjs';
import {PORTRAIT_OPTIONS,normalizePortraitChoices,compileImagePrompt,PORTRAIT_SPEC_VERSION} from '../../src/utils/neurohero/portraitBrief.mjs';
export const XAI_CONFIG=Object.freeze({model:'grok-imagine-image-2.0',quality:'medium',resolution:'2k',aspect_ratio:'3:4',n:1,response_format:'b64_json'});
export const STYLE_VERSION=XAI_STYLE_VERSION;
export const MAX_IMAGE_BYTES=8*1024*1024;
export class PortraitError extends Error{constructor(code,status=400){super(code);this.code=code;this.status=status;}}
export function normalizeVisualSpec(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).some(k=>!['heroId','choices','edition'].includes(k)))throw new PortraitError('invalid_visual_spec');
 if(raw.heroId!=='unclassified'&&!Object.hasOwn(COMPOSITION_BY_ID,raw.heroId||''))throw new PortraitError('unknown_hero');
 if(!raw.choices||typeof raw.choices!=='object'||Array.isArray(raw.choices)||Object.keys(raw.choices).some(k=>!Object.hasOwn(PORTRAIT_OPTIONS,k)))throw new PortraitError('invalid_visual_choices');
 for(const [key,value] of Object.entries(raw.choices))if(!PORTRAIT_OPTIONS[key].includes(value))throw new PortraitError('invalid_visual_choice');
 if(!Number.isInteger(raw.edition??0)||(raw.edition??0)<0||(raw.edition??0)>20)throw new PortraitError('invalid_edition');
 return {heroId:raw.heroId,choices:normalizePortraitChoices(raw.choices),edition:raw.edition??0};
}
export function portraitRequest(spec){const clean=normalizeVisualSpec(spec);return {...XAI_CONFIG,prompt:compileXaiPortraitPrompt({signature:{id:clean.heroId}},clean.choices)};}
export async function sha256(bytes){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',typeof bytes==='string'?new TextEncoder().encode(bytes):bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');}
export async function visualFingerprint(spec){return sha256(JSON.stringify({spec:normalizeVisualSpec(spec),style:STYLE_VERSION,promptVersion:PORTRAIT_SPEC_VERSION,config:XAI_CONFIG}));}
async function boundedText(response,max){const reader=response.body?.getReader();if(!reader)throw new PortraitError('empty_provider_response',502);let total=0;const chunks=[];for(;;){const {value,done}=await reader.read();if(done)break;total+=value.length;if(total>max){await reader.cancel();throw new PortraitError('provider_response_too_large',502);}chunks.push(value);}const bytes=new Uint8Array(total);let at=0;for(const c of chunks){bytes.set(c,at);at+=c.length;}return new TextDecoder().decode(bytes);}
export async function generateXaiPortrait(spec,{apiKey,fetchImpl=fetch,timeoutMs=180000,onProgress=async()=>{}}={}){
 if(typeof apiKey!=='string'||!apiKey.trim())throw new PortraitError('image_service_not_configured',503);
 await onProgress('requesting-image');let response;try{response=await fetchImpl('https://api.x.ai/v1/images/generations',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(portraitRequest(spec)),signal:AbortSignal.timeout(timeoutMs),redirect:'error'});}catch{throw new PortraitError('provider_outcome_unknown',502);}
 await onProgress('provider-responded');if(!response.ok){await response.body?.cancel();throw new PortraitError(response.status===401||response.status===403?'provider_access_denied':response.status===429?'provider_rate_limit':'provider_rejected',502);}
 await onProgress('reading-image');let body;try{body=JSON.parse(await boundedText(response,12*1024*1024));}catch(e){if(e instanceof PortraitError)throw e;throw new PortraitError('invalid_provider_response',502);}
 if(body.respect_moderation===false||body.data?.some(x=>x.respect_moderation===false||x.finish_reason==='content_filter'))throw new PortraitError('image_filtered',422);
 if(body.data?.length!==1||typeof body.data[0].b64_json!=='string')throw new PortraitError('missing_image',502);
 await onProgress('decoding-image');let bytes;try{const binary=atob(body.data[0].b64_json.replace(/^data:image\/(?:jpeg|png|webp);base64,/,''));bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);}catch{throw new PortraitError('invalid_image_encoding',502);}
 const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;
 if(bytes.length<512||bytes.length>MAX_IMAGE_BYTES||(!jpeg&&!png))throw new PortraitError('invalid_image_bytes',502);
 await onProgress('image-validated');return {bytes,contentType:jpeg?'image/jpeg':'image/png',sha256:await sha256(bytes),model:typeof body.model==='string'?body.model:XAI_CONFIG.model,moderation:body.respect_moderation===true||body.data[0].respect_moderation===true?'provider-approved':'provider-returned-image',styleVersion:STYLE_VERSION};
}
