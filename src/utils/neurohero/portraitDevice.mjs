import {normalizePortraitAsset} from './storage.mjs';
const DB='cortex-compass-portrait-assets';
async function open(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('assets',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(new Error('Device image storage is unavailable.'));});}
async function transact(mode,action){const db=await open();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('assets',mode);let result;const req=action(tx.objectStore('assets'));req.onsuccess=()=>{result=req.result;};tx.oncomplete=()=>resolve(result);tx.onerror=tx.onabort=()=>reject(new Error('Could not complete device image storage.'));});}finally{db.close();}}
export async function getDevicePortrait(asset){const a=normalizePortraitAsset(asset);if(!a)return null;const row=await transact('readonly',s=>s.get(a.id));if(!row||row.sha256!==a.sha256)return null;const bytes=row.bytes||(row.blob?await row.blob.arrayBuffer():null);if(!(bytes instanceof ArrayBuffer)||bytes.byteLength>8*1024*1024)return null;const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');return digest===a.sha256?new Blob([bytes],{type:'image/jpeg'}):null;}
export async function deleteDevicePortrait(asset){const a=normalizePortraitAsset(asset);if(a)await transact('readwrite',s=>s.delete(a.id));}
export async function saveDevicePortrait(file,consent=false){
 if(consent!==true)throw new Error('Choose explicit device-image saving first.');
 if(!(file instanceof Blob)||file.size>8*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Use a PNG, JPEG or WebP under 8 MB.');
 // Decode and re-encode the pixels; never retain SVG, metadata, filenames or arbitrary URLs.
 const bitmap=await createImageBitmap(file);let blob,width,height;
 try{if(bitmap.width*bitmap.height>32000000||bitmap.width<32||bitmap.height<32)throw new Error('Choose a portrait between 32 pixels and 32 megapixels.');
 const scale=Math.min(1,1920/bitmap.width,2400/bitmap.height);width=Math.round(bitmap.width*scale);height=Math.round(bitmap.height*scale);const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle='#f7fbfd';ctx.fillRect(0,0,width,height);ctx.drawImage(bitmap,0,0,width,height);blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Image conversion failed.')),'image/jpeg',.9));}finally{bitmap.close();}
 const bytes=await blob.arrayBuffer();const sha256=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');const id=crypto.randomUUID();await transact('readwrite',s=>s.put({id,sha256,bytes,width,height}));return {kind:'device',id,sha256,width,height};
}
// Restore an already accepted JPEG without re-encoding it. Existing image entries are never overwritten.
export async function restoreDevicePortrait(bytes,reference,consent=false){
 if(consent!==true)throw new Error('Choose permission to open this backup on the device first.');
 const source=normalizePortraitAsset(reference);
 if(!source||!(bytes instanceof Uint8Array)||bytes.length>8*1024*1024||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)throw new Error('Unsupported backup portrait.');
 const sha256=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
 if(sha256!==source.sha256)throw new Error('The backup image does not match its saved fingerprint.');
 const bitmap=await createImageBitmap(new Blob([bytes],{type:'image/jpeg'}));let width,height;
 try{width=bitmap.width;height=bitmap.height;if(width<32||height<32||width*height>32000000)throw new Error('The backup image dimensions are unsupported.');}finally{bitmap.close();}
 const id=crypto.randomUUID();await transact('readwrite',store=>store.put({id,sha256,bytes:bytes.slice().buffer,width,height}));
 return {...source,id,width,height};
}
