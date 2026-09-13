import React,{useEffect,useRef,useState} from 'react';
import {compileXaiPortraitPrompt} from '../../utils/neurohero/xaiVisual.mjs';
import {normalizePortraitChoices} from '../../utils/neurohero/portraitBrief.mjs';
import {directionKey,matchingPortraits,nextPortraitEdition,savedEdition,portraitLabel,portraitProgress} from '../../utils/neurohero/portraitLibrary.mjs';
import {saveDevicePortrait,deleteDevicePortrait} from '../../utils/neurohero/portraitDevice.mjs';
const API='/api/portraits';
const messages={edition_deleted:'This edition was deleted. Choose another edition to create a new portrait.',sign_in_required:'Sign in to your private portrait workspace.',access_not_available:'That access pass is not available. Check it and try again.',portrait_allowance_used:'Your generation allowance is used. Saved portraits remain available.',pilot_budget_reached:'The current generation budget is reached. Saved portraits remain available.',try_later:'Too many sign-in attempts. Try again later.',image_filtered:'The provider did not approve this image. It will not be automatically retried.',provider_outcome_unknown:'The provider outcome is uncertain. No automatic paid retry will be made.',provider_access_denied:'The image service is temporarily unavailable.',service_not_configured:'AI portraits are not enabled on this deployment.'};
async function api(path,method='GET',body){const r=await fetch(API+path,{method,credentials:'same-origin',cache:'no-store',headers:{...(body?{'Content-Type':'application/json'}:{}),...(method!=='GET'?{'X-Cortex-Request':'portrait-v1'}:{})},...(body?{body:JSON.stringify(body)}:{})});let data;try{data=await r.json();}catch{throw new Error('The portrait service could not be reached.');}if(!r.ok)throw new Error(messages[data.error]||'The request could not be completed. No automatic paid retry was made.');return data;}
async function imageBlob(job,signal){const r=await fetch(`${API}/jobs/${job.id}/image`,{credentials:'same-origin',cache:'no-store',signal});if(!r.ok)throw new Error('Sign in again to retrieve this private portrait.');const blob=await r.blob();if(blob.size>8*1024*1024||!['image/png','image/jpeg'].includes(blob.type))throw new Error('The stored portrait has an unsupported format.');const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].map(v=>v.toString(16).padStart(2,'0')).join('');if(hash!==job.sha256)throw new Error('Portrait integrity check failed. No image was saved.');return blob;}
export default function XaiPortraitControls({profile,choices,onAsset}){
 const [service,setService]=useState(null),[pass,setPass]=useState(''),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const [selectedId,setSelectedId]=useState(null),[preview,setPreview]=useState(null),[editionChoice,setEditionChoice]=useState(null),[adoptDifferent,setAdoptDifferent]=useState(false);
 const alive=useRef(true),epoch=useRef(0),sequence=useRef(0),lock=useRef(false),requests=useRef(new Map());
 const direction={heroId:profile?.signature?.id||'unclassified',choices:normalizePortraitChoices(choices)},visualKey=directionKey(direction);
 const currentVisual=useRef(visualKey),currentSelected=useRef(selectedId);currentVisual.current=visualKey;currentSelected.current=selectedId;
 const edition=savedEdition(service?.jobs,direction,editionChoice?.key===visualKey?editionChoice.edition:null),spec={...direction,edition},specKey=JSON.stringify(spec);
 const matches=matchingPortraits(service?.jobs,direction),existing=matches.find(j=>j.spec.edition===edition),selected=service?.jobs?.find(j=>j.id===selectedId)||null;
 const different=!!selected&&directionKey(selected.spec)!==visualKey,canGenerate=(service?.remaining||0)>0;
 const refresh=async()=>{const serial=++sequence.current,version=epoch.current;const data=await api('/status');if(alive.current&&version===epoch.current&&serial===sequence.current)setService(data);return data;};
 useEffect(()=>{alive.current=true;refresh().catch(()=>{if(alive.current)setService({available:false});});return()=>{alive.current=false;epoch.current++;sequence.current++;};},[]);
 useEffect(()=>{setConsent(false);setAdoptDifferent(false);setSelectedId(null);},[visualKey]);
 useEffect(()=>{setConsent(false);},[edition]);
 useEffect(()=>{setAdoptDifferent(false);},[selectedId]);
 const pending=service?.jobs?.some(j=>['queued','running'].includes(j.status));
 useEffect(()=>{if(!pending)return;let cancelled=false,working=false;const start=Date.now();const timer=setInterval(async()=>{if(working||cancelled)return;if(Date.now()-start>240000){clearInterval(timer);setNotice('Generation is taking longer. Refresh the library to check; no second request was sent.');return;}working=true;try{await refresh();}catch{}finally{working=false;}},3000);return()=>{cancelled=true;clearInterval(timer);};},[pending]);
 useEffect(()=>{setPreview(null);if(selected?.status!=='ready')return;const controller=new AbortController();let disposed=false,url;imageBlob(selected,controller.signal).then(blob=>{if(disposed)return;url=URL.createObjectURL(blob);setPreview({id:selected.id,blob,url});}).catch(e=>{if(!disposed)setNotice(e.message);});return()=>{disposed=true;controller.abort();if(url)URL.revokeObjectURL(url);};},[selected?.id,selected?.status,selected?.sha256]);
 const action=async fn=>{if(lock.current)return;lock.current=true;setBusy(true);setNotice('');try{await fn();}catch(e){if(alive.current)setNotice(e.message);}finally{lock.current=false;if(alive.current)setBusy(false);}};
 const login=()=>action(async()=>{await api('/session','POST',{pass:pass.trim()});setPass('');await refresh();if(alive.current)setNotice('Portrait workspace unlocked. Your questionnaire answers remain on this device.');});
 const signout=()=>action(async()=>{epoch.current++;sequence.current++;await api('/session','DELETE');if(!alive.current)return;setSelectedId(null);setPreview(null);setConsent(false);setAdoptDifferent(false);await refresh();});
 const generate=()=>action(async()=>{
  if(existing){setSelectedId(existing.id);setNotice('Opened your existing edition. No generation request was sent.');return;}
  if(!consent)throw new Error('Review and accept the visual-brief consent first.');
  const key=specKey,visual=visualKey,version=epoch.current;let requestId=requests.current.get(key);if(!requestId){requestId=crypto.randomUUID();requests.current.set(key,requestId);}
  const result=await api('/jobs','POST',{spec,requestId,consent:true});if(!alive.current||version!==epoch.current)return;await refresh();
  if(alive.current&&currentVisual.current===visual){setSelectedId(result.job.id);setNotice(result.job.status==='ready'?'Your saved edition is ready. No new image charge.':'Portrait queued. It will stay in the library while you continue.');}
 });
 const selectJob=j=>{setSelectedId(j.id);if(directionKey(j.spec)===visualKey)setEditionChoice({key:visualKey,edition:j.spec.edition});};
 const chooseNext=()=>{const available=nextPortraitEdition(service?.jobs,direction),next=Math.max(available??21,edition+1);if(next>20){setNotice('This direction has reached its edition limit. Saved portraits remain available.');return;}if(window.confirm('Choose a new visual edition? Creating it later uses one generation. Your saved artwork is kept.')){setEditionChoice({key:visualKey,edition:next});setSelectedId(null);setConsent(false);setNotice(`Edition ${next+1} selected. Review and consent before creating it.`);}};
 const remove=()=>action(async()=>{const chosen=selected;if(!chosen||!window.confirm('Delete this portrait from the private cloud library? Device and PDF copies are unchanged.'))return;const result=await api(`/jobs/${chosen.id}`,'DELETE');if(!alive.current)return;setSelectedId(null);await refresh();setNotice(result.deletionPending?'Deletion requested; the in-progress image will not be retained.':'Cloud portrait deleted. Device and PDF copies remain unchanged.');});
 const useImage=()=>action(async()=>{
  const chosen=selected,visual=currentVisual.current,version=epoch.current;
  if(!chosen||chosen.status!=='ready'||(different&&!adoptDifferent))throw new Error('Review the saved artwork direction before using it.');
  const blob=preview?.id===chosen.id?preview.blob:await imageBlob(chosen);
  if(!alive.current||epoch.current!==version||currentVisual.current!==visual||currentSelected.current!==chosen.id)return;
  const asset=await saveDevicePortrait(blob,true);
  if(!alive.current||epoch.current!==version||currentVisual.current!==visual||currentSelected.current!==chosen.id){await deleteDevicePortrait(asset);return;}
  onAsset({...asset,provider:'xAI',cloudId:chosen.id,visualSpec:chosen.spec});setNotice('Artwork added to your report. Save your profile to preserve the link, or make an encrypted backup. No new image was generated.');
 });
 const previewURL=preview && selected && preview.id===selected.id ? preview.url : null;
 return <section className="nh-xai-panel" aria-label="xAI portrait generation"><span className="cc-eyebrow">XAI · YOUR PORTRAIT STUDIO</span><h2>Give your hero a face.</h2><p>Original anime-inspired artwork. Choose an edition, keep the accepted portrait, and reuse it in every report.</p>
 {!service?.available?<p role="status">{service===null?'Checking portrait availability…':'The portrait service is unavailable right now. Ordinary reports and device artwork still work.'}</p>:!service.authenticated?<><p><b>Private portrait pilot.</b> Enter your portrait access pass. This is a restricted workspace, not public account registration.</p><label className="nh-xai-access">Portrait access pass<input type="password" autoComplete="off" spellCheck={false} value={pass} maxLength={64} disabled={busy} onChange={e=>setPass(e.target.value)}/></label><button className="cc-primary" disabled={busy||!pass.trim()} onClick={login}>Unlock portrait studio</button></>:<>
 <div className="nh-xai-account"><b>{service.remaining} generation{service.remaining===1?'':'s'} remaining</b><button className="cc-secondary" disabled={busy} onClick={signout}>Sign out of portraits</button></div>
 <p className="nh-edition-status">Current visual direction · Edition {edition+1}{existing?' · already in your library':''}. Saved images are available even when no generation allowance remains.</p>
 <details className="nh-brief"><summary>Review the exact visual brief</summary><p>{compileXaiPortraitPrompt(profile,choices)}</p><p>Only these appearance choices and public hero motifs go to xAI—not your history, questionnaire answers, research variables, name, or contact details.</p></details>
 <label className="nh-image-consent"><input type="checkbox" checked={consent} disabled={busy} onChange={e=>setConsent(e.target.checked)}/> Send this visual brief to xAI and store the resulting portrait privately. This is fictional artwork, not measured brain anatomy.</label>
 <p className="cc-small-note">xAI states API data is not used for training without permission and is normally retained for 30 days for abuse auditing. <a href="https://docs.x.ai/developers/faq/security" target="_blank" rel="noreferrer">Provider privacy details</a>. Keep your workspace pass private.</p>
 <div className="cc-actions">
 <button className="cc-primary" disabled={busy||(!existing&&(!consent||!canGenerate))} onClick={generate}>{existing?`Open saved edition ${edition+1}`:'Create my xAI portrait'}</button>
 <button className="cc-secondary" disabled={busy} onClick={()=>action(refresh)}>Refresh my portraits</button>
 {canGenerate&&<button className="cc-secondary" disabled={busy||nextPortraitEdition(service.jobs,direction)===null||edition>=20} onClick={chooseNext}>Choose another edition</button>}
 </div>
 <div className="nh-xai-library" aria-label="Private portrait library">
 {service.jobs?.map(j=><button type="button" className="cc-secondary" disabled={busy} key={j.id} aria-pressed={selectedId===j.id} onClick={()=>selectJob(j)}><span>{portraitLabel(j)}</span><small>{portraitProgress(j)}</small></button>)}
 </div>
 {selected&&<div className="nh-xai-preview" data-xai-status={selected.status}>
 {previewURL&&<img src={previewURL} alt="Private fictional hero portrait generated by xAI"/>}
 <p role="status">{selected.status==='failed'?(messages[selected.error]||portraitProgress(selected)):portraitProgress(selected)}</p>
 {different&&<label className="nh-image-consent nh-visual-mismatch"><input type="checkbox" checked={adoptDifferent} disabled={busy} onChange={e=>setAdoptDifferent(e.target.checked)}/> This saved artwork uses a different hero or appearance direction. Use it as chosen artwork without changing my answers or current hero.</label>}
 {selected.status==='ready'&&<><button className="cc-primary" disabled={busy||!previewURL||(different&&!adoptDifferent)} onClick={useImage}>Use this portrait in my report</button><p className="cc-small-note">This keeps the accepted image on the device. Save your profile or create a backup to keep it linked. Printing never generates another image.</p></>}
 <button className="cc-secondary" disabled={busy} onClick={remove}>Delete cloud portrait</button>
 </div>}
 </>}{notice&&<p className="nh-xai-notice" role="status">{notice}</p>}</section>;
}
