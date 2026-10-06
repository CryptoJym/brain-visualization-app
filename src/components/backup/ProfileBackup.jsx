import React,{useEffect,useRef,useState} from 'react';
import CortexBrand from '../CortexBrand';
import {prepareBackupFile,previewBackupFile,openBackupInPage} from '../../utils/backup/backupActions.mjs';
import {validateBackupPassword,MAX_BACKUP_BYTES} from '../../utils/backup/cryptoEnvelope.mjs';
import {buildHeroProfile} from '../../utils/neurohero/engine.mjs';
import {deleteDevicePortrait} from '../../utils/neurohero/portraitDevice.mjs';
export default function ProfileBackup({snapshot,fictional=false,initialTab='export',onBack,onOpen}){
 const [tab,setTab]=useState(initialTab),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[unlockPassword,setUnlockPassword]=useState('');
 const [includeImage,setIncludeImage]=useState(true),[file,setFile]=useState(null),[preview,setPreview]=useState(null),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[download,setDownload]=useState(null);
 const lock=useRef(false),alive=useRef(true),urlRef=useRef(null);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;if(urlRef.current)URL.revokeObjectURL(urlRef.current);};},[]);
 const act=async fn=>{if(lock.current)return;lock.current=true;setBusy(true);setMessage('');try{await fn();}catch(e){if(alive.current)setMessage(e.message||'The backup could not be processed. Your saved profile is unchanged.');}finally{lock.current=false;if(alive.current)setBusy(false);}};
 const invalidateDownload=()=>{if(urlRef.current)URL.revokeObjectURL(urlRef.current);urlRef.current=null;setDownload(null);};
 const prepare=()=>act(async()=>{
  validateBackupPassword(password);if(password!==confirm)throw new Error('The two backup passwords do not match.');
  const result=await prepareBackupFile(snapshot,password,{includeImage,fictional});if(!alive.current)return;
  if(urlRef.current)URL.revokeObjectURL(urlRef.current);const url=URL.createObjectURL(result.blob);urlRef.current=url;
  setDownload({url,name:`Cortex-Compass-${fictional?'Fictional-':''}Backup.cortex`,bytes:result.blob.size,portrait:result.portrait});setPassword('');setConfirm('');setMessage('Your encrypted file is ready. Download it below and keep the password separately.');
 });
 const unlock=()=>act(async()=>{
  setPreview(null);setConsent(false);const result=await previewBackupFile(file,unlockPassword);if(!alive.current)return;
  setPreview(result);setUnlockPassword('');setMessage('Preview ready. No saved answers have been changed.');
 });
 const open=()=>act(async()=>{
  const profile=await openBackupInPage(preview,consent);if(!alive.current){if(profile.neurohero?.portraitAsset)await deleteDevicePortrait(profile.neurohero.portraitAsset);return;}
  onOpen(profile);
 });
 const changeTab=next=>{if(busy)return;invalidateDownload();setTab(next);setPreview(null);setConsent(false);setMessage('');setPassword('');setConfirm('');setUnlockPassword('');};
 const hero=preview?buildHeroProfile(preview.profile.neurohero?.answers||{},preview.profile.neurohero?.selectedId):null;
 return <main className="cc-shell cc-backup-screen"><header className="cc-nav"><div className="cc-brand"><CortexBrand/></div><button className="cc-secondary" disabled={busy} onClick={onBack}>Back to reflection</button></header>
 <section className="cc-backup-shell"><span className="cc-eyebrow">YOUR FIELD GUIDE · KEPT TOGETHER</span><h1>Take your story<br/><em>with you.</em></h1><p className="cc-backup-lead">A password-protected copy of your reflection and accepted artwork. Move it to another browser without uploading your answers to a profile service.</p>
 <div className="cc-backup-tabs" role="group" aria-label="Backup operation"><button className="cc-secondary" disabled={busy} aria-pressed={tab==='export'} onClick={()=>changeTab('export')}>Create backup</button><button className="cc-secondary" disabled={busy} aria-pressed={tab==='import'} onClick={()=>changeTab('import')}>Open a backup</button></div>
 {tab==='export'?<section className="cc-backup-panel" aria-label="Create encrypted backup"><h2>One file. Your reflection and portrait.</h2><p>Includes the current open-page answers, developmental context, hero observations and accepted artwork. It does not include portrait-access passes, sign-in cookies or API credentials.</p>
 {fictional&&<p className="cc-backup-warning">This is a fictional sample. The backup and restored reports keep that label.</p>}
 <label className="cc-backup-check"><input type="checkbox" disabled={busy} checked={includeImage} onChange={e=>{invalidateDownload();setIncludeImage(e.target.checked);}}/> Include the accepted portrait when available.</label>
 <div className="cc-backup-fields"><label>Backup password<input aria-label="Backup password" type="password" minLength={12} maxLength={256} autoComplete="new-password" disabled={busy} value={password} onChange={e=>{invalidateDownload();setPassword(e.target.value);}}/></label><label>Confirm backup password<input aria-label="Confirm backup password" type="password" autoComplete="new-password" maxLength={256} disabled={busy} value={confirm} onChange={e=>{invalidateDownload();setConfirm(e.target.value);}}/></label></div>
 <p className="cc-small-note">Use 12–256 characters, preferably several unrelated words. Keep this password separately from the file. Cortex Compass cannot recover it.</p><button className="cc-primary" disabled={busy||!password||!confirm} onClick={prepare}>{busy?'Preparing backup…':'Prepare encrypted backup'}</button>
 {download&&<div className="cc-backup-download"><b>Ready to keep</b><p>{download.portrait?'Reflection and portrait':'Reflection without a portrait'} · {(download.bytes/1048576).toFixed(2)} MB</p><a className="cc-primary" href={download.url} download={download.name}>Download encrypted backup</a><p className="cc-small-note">Download this file before leaving the page. On mobile, save it to Files. Preparing it does not replace your existing browser copy.</p></div>}
 </section>:<section className="cc-backup-panel" aria-label="Open encrypted backup"><h2>Bring your field guide back.</h2><p>Select a .cortex file you created, unlock it, and review the contents before opening. Your existing saved reflection will not be overwritten.</p>
 <label className="cc-backup-file">Choose your backup file<input aria-label="Choose Cortex backup" type="file" accept=".cortex,application/octet-stream" disabled={busy} onChange={e=>{const next=e.target.files?.[0]||null;setPreview(null);setConsent(false);setUnlockPassword('');setMessage('');setFile(next);if(next&&next.size>MAX_BACKUP_BYTES){setFile(null);setMessage('Choose a backup under 12 MB.');}}}/></label>
 <label className="cc-backup-password">Backup password<input aria-label="Unlock backup password" type="password" autoComplete="off" maxLength={256} disabled={busy} value={unlockPassword} onChange={e=>setUnlockPassword(e.target.value)}/></label><button className="cc-primary" disabled={busy||!file||!unlockPassword} onClick={unlock}>{busy?'Opening securely…':'Unlock for preview'}</button>
 {preview&&<div className="cc-backup-preview" data-backup-preview><span className="cc-eyebrow">DECRYPTED HERE · NOT UPLOADED</span><h3>{hero?.signature?.name||'Your Cortex Compass reflection'}</h3><p>{Object.keys(preview.profile.answers).length} history/support responses · {Object.keys(preview.profile.neurohero?.answers||{}).length} hero observations · {preview.portraitBytes?'Accepted portrait included':'No portrait included'}</p><p>Created {new Date(preview.createdAt).toLocaleDateString()}. {preview.fictional?'Fictional demonstration—not your personal history.':'Personal reflection.'}</p>
 <label className="cc-backup-check"><input aria-label="Consent to open backup" type="checkbox" checked={consent} disabled={busy} onChange={e=>setConsent(e.target.checked)}/> Open this reflection in the current page and keep its portrait in this browser. Any unsaved open-page edits will be replaced. The existing saved profile stays unchanged until I separately choose Save profile.</label>
 <button className="cc-primary" disabled={busy||!consent} onClick={open}>Open this reflection</button></div>}
 </section>}
 {message&&<p className="cc-backup-message" role="status">{message}</p>}<aside className="cc-backup-boundary"><h3>What this protects—and what it does not</h3><p>The downloaded file uses password-based encryption. The password is not saved or sent by this feature. Once opened, your answers and artwork are visible to this browser, just like an ordinary reflection. A weak password or compromised device can still put them at risk.</p><p>This is not cloud account recovery. Your portrait workspace pass remains separate. Share the backup only with someone you intend to give your complete reflection to.</p></aside>
 </section></main>;
}
