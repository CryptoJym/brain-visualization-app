import {migrateSavedRecord,saveRecord,SAVE_SCHEMA,STORAGE_KEY} from '../assessmentProfile.mjs';
export const BACKUP_FORMAT='cortex-compass-profile-backup',BACKUP_VERSION=1,MAX_PORTRAIT_BYTES=8*1024*1024;
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
export async function digestBytes(bytes){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');}
function base64(bytes){let raw='';for(let i=0;i<bytes.length;i+=32768)raw+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(raw);}
function fromBase64(text){if(typeof text!=='string'||text.length>Math.ceil(MAX_PORTRAIT_BYTES/3)*4||text.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(text))throw new Error('The portrait data in this backup is invalid.');let raw;try{raw=atob(text);}catch{throw new Error('The portrait data in this backup is invalid.');}const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return bytes;}
export function canonicalBackupProfile(raw){
 if(!object(raw)||raw.schemaVersion!==SAVE_SCHEMA||JSON.stringify(raw).length>256000)throw new Error('This backup uses an unsupported profile or exceeds the supported size.');
 const p=migrateSavedRecord(raw);const record=saveRecord({setItem:()=>{}},p.answers,p.legacyRecord,true,p.insights,p.personContext,p.neurohero);
 return {...record,fictional:raw.fictional===true};
}
export async function createBackupPayload(raw,blob=null,{includePortrait=true,fictional=false}={}){
 const profile=canonicalBackupProfile({...raw,fictional});let portrait=null;const asset=profile.neurohero?.portraitAsset;
 if(includePortrait&&asset){if(!(blob instanceof Blob))throw new Error('The accepted portrait is not available on this device. Restore it from your portrait library or turn off image inclusion.');
  const bytes=new Uint8Array(await blob.arrayBuffer());if(bytes.length>MAX_PORTRAIT_BYTES||bytes.length<4||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)throw new Error('The accepted portrait cannot be backed up as a supported JPEG.');
  const sha256=await digestBytes(bytes);if(sha256!==asset.sha256)throw new Error('Portrait integrity check failed. No backup was created.');portrait={contentType:'image/jpeg',sha256,data:base64(bytes)};
 }else if(asset){profile.neurohero={...profile.neurohero,portraitAsset:null};}
 return {format:BACKUP_FORMAT,version:BACKUP_VERSION,createdAt:new Date().toISOString(),fictional:fictional===true,profile,portrait};
}
export async function validateBackupPayload(raw){
 if(!object(raw)||raw.format!==BACKUP_FORMAT||raw.version!==BACKUP_VERSION||Object.keys(raw).some(k=>!['format','version','createdAt','fictional','profile','portrait'].includes(k)))throw new Error('This backup format is not supported.');
 if(typeof raw.createdAt!=='string'||!Number.isFinite(Date.parse(raw.createdAt))||typeof raw.fictional!=='boolean')throw new Error('The backup metadata is invalid.');
 const profile=canonicalBackupProfile({...raw.profile,fictional:raw.fictional}),asset=profile.neurohero?.portraitAsset;let bytes=null;
 if(raw.portrait!==null){const image=raw.portrait;if(!asset||!object(image)||Object.keys(image).some(k=>!['contentType','sha256','data'].includes(k))||image.contentType!=='image/jpeg')throw new Error('The backup portrait does not match its profile.');
  bytes=fromBase64(image.data);if(bytes.length<4||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255||image.sha256!==asset.sha256||await digestBytes(bytes)!==asset.sha256)throw new Error('The backup portrait failed its integrity check.');
 }else if(asset)throw new Error('This backup is missing the portrait referenced by its profile.');
 return {profile,portraitBytes:bytes,createdAt:raw.createdAt,fictional:raw.fictional};
}
