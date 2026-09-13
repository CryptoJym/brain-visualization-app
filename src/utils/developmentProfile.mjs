import {DEVELOPMENT_STAGES,DEVELOPMENT_SOURCES,RESPONSE_CONTEXT,SUPPORT_CONTEXT,MEASUREMENT_CONTEXT,CONTEXT_QUESTIONS,RETIRED_CONTEXT_CHOICES} from '../data/developmentContext.mjs';
import {DEVELOPMENT_STUDIES} from '../data/developmentEvidence.mjs';
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const pick=(raw,key,choices)=>plain(raw)&&Object.hasOwn(raw,key)&&choices.some(([id])=>id===raw[key])?raw[key]:undefined;
export function normalizeDevelopment(raw={}) {
 const d=plain(raw)?Object.fromEntries(Object.entries(raw)):{};
 const status=['reported','unknown','skip'].includes(d.status)?d.status:'unreviewed';
 const stages=status==='reported'&&Array.isArray(d.stages)?DEVELOPMENT_STAGES.filter(s=>d.stages.includes(s.id)).map(s=>s.id):[];
 const result={status:status==='reported'&&!stages.length?'unreviewed':status,stages};
 for(const [key,choices] of [['source',DEVELOPMENT_SOURCES],['response',RESPONSE_CONTEXT],['support',SUPPORT_CONTEXT],['measurement',MEASUREMENT_CONTEXT]]){const value=pick(d,key,choices);if(value)result[key]=value;}
 return result;
}
export function normalizePersonContext(raw={}) {
 const result={};for(const q of CONTEXT_QUESTIONS){const value=pick(raw,q.id,q.choices);if(value)result[q.id]=value;}
 for(const [id,values] of Object.entries(RETIRED_CONTEXT_CHOICES)){const value=pick(raw,id,values.map(v=>[v,v]));if(value)result[id]=value;}
 if(plain(raw)&&Object.hasOwn(raw,'sexAssigned')&&['another','unknown','skip'].includes(raw.sexAssigned))result.legacySexAssigned=raw.sexAssigned;
 return result;
}
export const developmentLabel=raw=>{const d=normalizeDevelopment(raw);return d.status==='reported'?d.stages.map(id=>DEVELOPMENT_STAGES.find(s=>s.id===id).label).join('; '):d.status==='skip'?'Developmental stage not shared':d.status==='unknown'?'Developmental stage uncertain':'Developmental stage not reviewed';};
export function developmentReading(raw={}) {
 const d=normalizeDevelopment(raw);
 return DEVELOPMENT_STUDIES.filter(s=>s.stages.some(stage=>d.stages.includes(stage))).map(s=>({id:s.id,label:s.label,reason:'Related developmental research selected from your reported stage; exposure, task and population may not match.'}));
}
export function contextInterpretation(raw={}) {
 const saved=normalizePersonContext(raw),c=Object.fromEntries(CONTEXT_QUESTIONS.filter(q=>Object.hasOwn(saved,q.id)).map(q=>[q.id,saved[q.id]])),notes=[];
 if(['female','male'].includes(c.sexAssigned))notes.push(`You reported ${c.sexAssigned} sex at birth. Research comparisons retain the studies’ own definitions; this is not a verified match to every sampled group.`);
 else notes.push('No binary sex-at-birth comparison is selected. Nothing is inferred from gender identity. All study contrasts remain available.');
 if(c.sexTraits==='yes'||c.hormonalContext==='yes')notes.push('You flagged sex-characteristic or historical hormonal variation. Applicability of binary-group puberty findings is especially uncertain; no substitute hormone level or stage is assigned.');
 if(Object.keys(RETIRED_CONTEXT_CHOICES).some(id=>Object.hasOwn(saved,id)))notes.push('Earlier questionnaire fields are preserved in saved data and backups but are not collected or used in this biological-context interpretation.');
 return {answers:c,notes,brainMaturation:'Not measured by Cortex Compass',sensitiveWindow:'Not established for an individual'};
}
