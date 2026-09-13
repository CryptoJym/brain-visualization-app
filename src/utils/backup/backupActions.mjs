import {encryptBackup,decryptBackup,MAX_BACKUP_BYTES} from './cryptoEnvelope.mjs';
import {canonicalBackupProfile,createBackupPayload,validateBackupPayload} from './profileBackup.mjs';
import {getDevicePortrait,restoreDevicePortrait} from '../neurohero/portraitDevice.mjs';
// User-directed export of the open reflection. No network requests or filesystem traversal.
export async function prepareBackupFile(snapshot,password,{includeImage=true,fictional=false}={}){
 const profile=canonicalBackupProfile(snapshot),asset=profile.neurohero?.portraitAsset;
 const portrait=includeImage&&asset?await getDevicePortrait(asset):null;
 const payload=await createBackupPayload(profile,portrait,{includePortrait:includeImage,fictional});
 const bytes=await encryptBackup(payload,password);
 return {blob:new Blob([bytes],{type:'application/octet-stream'}),portrait:!!payload.portrait};
}
export async function previewBackupFile(file,password){
 if(!(file instanceof Blob)||file.size>MAX_BACKUP_BYTES)throw new Error('Choose a .cortex backup under 12 MB.');
 return validateBackupPayload(await decryptBackup(await file.arrayBuffer(),password));
}
export async function openBackupInPage(preview,consent){
 if(consent!==true)throw new Error('Choose permission to open this backup first.');
 const profile=canonicalBackupProfile(preview.profile);
 if(preview.portraitBytes){
  const ref=await restoreDevicePortrait(preview.portraitBytes,profile.neurohero?.portraitAsset,true);
  profile.neurohero={...profile.neurohero,portraitAsset:ref};
 }
 return profile;
}
