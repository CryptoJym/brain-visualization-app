import {INSIGHT_VERSION,INSIGHT_CHOICES,INSIGHT_QUESTIONS,COMBINATIONS} from '../data/insightQuestions.mjs';
export const REPORT_VERSION='cc-reports-9.0';
const allowed=new Set(INSIGHT_CHOICES.map(([id])=>id));
export function normalizeInsights(raw={}) {
 const result={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
 for(const q of INSIGHT_QUESTIONS)if(Object.hasOwn(raw,q.id)&&allowed.has(raw[q.id]))result[q.id]=raw[q.id];
 return result;
}
export function buildInsights(raw={}) {
 const answers=normalizeInsights(raw),endorsed=id=>['often','sometimes'].includes(answers[id]);
 const selected=kind=>INSIGHT_QUESTIONS.filter(q=>q.kind===kind&&endorsed(q.id)).map(q=>({...q,response:answers[q.id],basis:'Direct present-day self-report; not independently measured'}));
 const strengths=selected('strength'),frictions=selected('friction'),resources=selected('resource');
 const combinations=COMBINATIONS.filter(c=>c.requires.every(endorsed)).map(c=>({...c,
  basis:c.requires.map(id=>({id,title:INSIGHT_QUESTIONS.find(q=>q.id===id).title,response:answers[id]})),
  status:'Untested combination hypothesis',evidence:'No study in this registry validates this named combination or its neural mechanism.',
  reportedFrictions:frictions.filter(q=>c.frictions.includes(q.id)),reportedResources:resources.filter(q=>c.resources.includes(q.id)),
 }));
 return {version:INSIGHT_VERSION,reportVersion:REPORT_VERSION,answers,strengths,frictions,resources,combinations,
  answered:Object.keys(answers).length,total:INSIGHT_QUESTIONS.length,
  unknown:INSIGHT_QUESTIONS.filter(q=>!answers[q.id]||['unsure','skip'].includes(answers[q.id])).map(q=>q.id),
  limits:'These labels are metaphors for reported experiences, not diagnoses, tested abilities, brain measurements, or evidence that adversity caused a strength.'};
}
