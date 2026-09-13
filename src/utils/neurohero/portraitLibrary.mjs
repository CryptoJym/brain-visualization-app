import {normalizePortraitChoices} from './portraitBrief.mjs';
import {COMPOSITION_BY_ID} from '../../data/neurohero/compositions.mjs';
export function visualDirection(raw={}){return {heroId:Object.hasOwn(COMPOSITION_BY_ID,raw.heroId||'')?raw.heroId:'unclassified',choices:normalizePortraitChoices(raw.choices)};}
export const directionKey=raw=>JSON.stringify(visualDirection(raw));
export function matchingPortraits(jobs,spec){const key=directionKey(spec);return (Array.isArray(jobs)?jobs:[]).filter(j=>j&&j.spec&&Number.isInteger(j.spec.edition)&&j.spec.edition>=0&&j.spec.edition<=20&&directionKey(j.spec)===key).sort((a,b)=>b.spec.edition-a.spec.edition||b.createdAt-a.createdAt);}
export function nextPortraitEdition(jobs,spec){const matching=matchingPortraits(jobs,spec);const max=matching.reduce((n,j)=>Math.max(n,j.spec.edition),-1);return max<20?max+1:null;}
export function savedEdition(jobs,spec,selectedEdition=null){const matching=matchingPortraits(jobs,spec);if(selectedEdition!==null)return selectedEdition;return matching.find(j=>j.status==='ready')?.spec.edition??matching[0]?.spec.edition??0;}
export function portraitLabel(job){const name=COMPOSITION_BY_ID[job?.spec?.heroId]?.name||'Compass Explorer';return `${name} · Edition ${(job?.spec?.edition??0)+1}`;}
export const STAGE_LABELS={'requesting-image':'Creating your original artwork','provider-responded':'Receiving the completed image','reading-image':'Receiving image details','decoding-image':'Preparing the image','image-validated':'Saving the private portrait'};
export function portraitProgress(job){return job?.status==='queued'?'Queued safely — no duplicate request needed':job?.status==='running'?(STAGE_LABELS[job.progress]||'Creating your original artwork'):job?.status==='ready'?'Saved and ready to use':job?.status==='deleted'?'Removed from cloud storage':'Could not complete this edition — it will not retry automatically';}
