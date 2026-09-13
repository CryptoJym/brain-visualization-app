import {HERO_PROCESSES,PROCESS_CHOICES,COUNTER_CHOICES,NEUROHERO_VERSION} from '../../data/neurohero/processes.mjs';
import {HERO_COMPOSITIONS} from '../../data/neurohero/compositions.mjs';
import {EVIDENCE_BY_ID,HERO_EVIDENCE_VERSION} from '../../data/neurohero/evidence.mjs';
const primary=new Set(PROCESS_CHOICES.map(([id])=>id)),counter=new Set(COUNTER_CHOICES.map(([id])=>id));
export function normalizeHeroAnswers(raw={}){
 const result={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
 for(const p of HERO_PROCESSES){if(!Object.hasOwn(raw,p.id)||!raw[p.id]||typeof raw[p.id]!=='object'||Array.isArray(raw[p.id]))continue;const a=raw[p.id],next={};if(Object.hasOwn(a,'value')&&primary.has(a.value))next.value=a.value;if(Object.hasOwn(a,'counter')&&counter.has(a.counter))next.counter=a.counter;if(Object.keys(next).length)result[p.id]=next;}
 return result;
}
export function processStatus(answer={}){
 if(!['often','sometimes'].includes(answer.value))return answer.value==='rarely'?'not-current':'unknown';
 if(answer.counter==='often')return 'counterexample';
 if(answer.counter==='sometimes')return 'qualified';
 return 'recognized';
}
const usable=status=>status==='recognized'||status==='qualified';
export function buildHeroProfile(raw={},preferredId=''){
 const answers=normalizeHeroAnswers(raw),processes=HERO_PROCESSES.map(p=>({...p,answer:answers[p.id]||{},status:processStatus(answers[p.id]),counterReviewed:['often','sometimes','rarely'].includes(answers[p.id]?.counter)}));
 const byId=Object.fromEntries(processes.map(p=>[p.id,p]));
 const compositions=HERO_COMPOSITIONS.map((c,index)=>{const parts=c.requires.map(id=>byId[id]),statuses=parts.map(p=>p.status),fit=statuses.every(usable),unchecked=parts.some(p=>!p.counterReviewed);return {...c,index,parts,statuses,fit,counterUnchecked:unchecked,fitStatus:!fit?'not-selected':unchecked||statuses.includes('qualified')?'tentative-fit':'reported-fit',evidenceRecords:c.evidence.map(id=>EVIDENCE_BY_ID[id]).filter(Boolean),often:parts.filter(p=>p.answer.value==='often').length};}).filter(c=>c.fit);
 // Editorial ordering, not an estimated neurological or performance score.
 compositions.sort((a,b)=>b.often-a.often||a.index-b.index);
 const signature=compositions.find(c=>c.id===preferredId)||compositions[0]||null,alternates=compositions.filter(c=>c.id!==signature?.id);
 const recognized=processes.filter(p=>usable(p.status)),counterexamples=processes.filter(p=>p.status==='counterexample'),unknown=processes.filter(p=>p.status==='unknown');
 const evidenceIds=[...new Set(recognized.flatMap(p=>p.evidence).concat(compositions.flatMap(c=>c.evidence)))];
 return {version:NEUROHERO_VERSION,evidenceVersion:HERO_EVIDENCE_VERSION,answers,processes,recognized,counterexamples,unknown,compositions,signature,alternates,evidence:evidenceIds.map(id=>EVIDENCE_BY_ID[id]).filter(Boolean),limits:'Reported functional patterns and editorial compositions are not measurements of anatomy, diagnoses, or validated individual neurological predictions.'};
}
