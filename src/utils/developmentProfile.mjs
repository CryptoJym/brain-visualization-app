import {DEVELOPMENT_STAGES,DEVELOPMENT_SOURCES,RESPONSE_CONTEXT,SUPPORT_CONTEXT,MEASUREMENT_CONTEXT,CONTEXT_QUESTIONS} from '../data/developmentContext.mjs';
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
 const result={};for(const q of CONTEXT_QUESTIONS){const value=pick(raw,q.id,q.choices);if(value)result[q.id]=value;}return result;
}
export const developmentLabel=raw=>{const d=normalizeDevelopment(raw);return d.status==='reported'?d.stages.map(id=>DEVELOPMENT_STAGES.find(s=>s.id===id).label).join('; '):d.status==='skip'?'Developmental stage not shared':d.status==='unknown'?'Developmental stage uncertain':'Developmental stage not reviewed';};
export function developmentReading(raw={}) {
 const d=normalizeDevelopment(raw);
 return DEVELOPMENT_STUDIES.filter(s=>s.stages.some(stage=>d.stages.includes(stage))).map(s=>({id:s.id,label:s.label,reason:'Related developmental research selected from your reported stage; exposure, task and population may not match.'}));
}
export function contextInterpretation(raw={}) {
 const c=normalizePersonContext(raw),notes=[];
 if(['female','male'].includes(c.sexAssigned))notes.push(`You reported ${c.sexAssigned} sex at birth. Research comparisons retain the studies’ own definitions; this is not a verified match to every sampled group.`);
 else notes.push('No binary sex-at-birth comparison is selected. Nothing is inferred from gender identity. All study contrasts remain available.');
 if(c.sexTraits==='yes'||c.hormonalContext==='yes')notes.push('You flagged sex-characteristic or historical hormonal variation. Applicability of binary-group puberty findings is especially uncertain; no substitute hormone level or stage is assigned.');
 if(c.genderedExperience==='yes')notes.push('You reported that gender expectations or perception shaped these experiences. This is social context, not evidence of an innate neural difference.');
 if(c.genderSupport==='yes')notes.push('You reported gender-related acceptance as a support. It is retained as a protective context, without subtracting adversity or predicting a neural outcome.');
 return {answers:c,notes,brainMaturation:'Not measured by Cortex Compass',sensitiveWindow:'Not established for an individual'};
}
