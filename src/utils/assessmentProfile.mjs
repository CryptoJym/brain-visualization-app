import {normalizeHeroRecord} from './neurohero/storage.mjs';
import {normalizeDevelopment,normalizePersonContext} from './developmentProfile.mjs';
import {DEVELOPMENT_VERSION,CONTEXT_VERSION} from '../data/developmentContext.mjs';
import {normalizeInsights} from './insightProfile.mjs';
import {INSIGHT_VERSION} from '../data/insightQuestions.mjs';
import {researchForQuestion,studyIdsForQuestions} from '../data/questionRegionLinks.mjs';
import {REGION_STUDIES} from '../data/regionStudies.mjs';
import {REGIONS} from '../data/brainSystems.mjs';
import {ALL_QUESTIONS,SECTIONS,QUESTIONNAIRE_VERSION,FREQUENCIES,ANSWER_CHOICES} from '../data/assessmentQuestions.mjs';
import {EVIDENCE_VERSION} from '../data/assessmentEvidence.mjs';
import {safeTiming,timingLabel,KNOWLEDGE_SOURCES} from './assessmentTiming.mjs';
export const SAVE_SCHEMA=5;
export const STORAGE_KEY='cortex-compass-profile';
const choices=new Set(ANSWER_CHOICES.map(([id])=>id));
const frequencies=new Set(FREQUENCIES.map(([id])=>id));
export function normalizeAnswers(raw={}) {
  const result={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
  for(const q of ALL_QUESTIONS){
    const a=Object.hasOwn(raw,q.id)?raw[q.id]:null;
    if(!a||!choices.has(a.value))continue;
    result[q.id]={value:a.value};
    if(a.value==='yes'&&q.kind!=='support'){
      result[q.id].timing=safeTiming(a.timing,q.kind==='prenatal');
      if(q.kind==='history'&&Object.hasOwn(a,'development'))result[q.id].development=normalizeDevelopment(a.development);
      if(q.kind==='history'&&frequencies.has(a.frequency))result[q.id].frequency=a.frequency;
    }
  }
  return result;
}
export function calculateProfile(raw={}) {
  const answers=normalizeAnswers(raw),answered=Object.keys(answers).length;
  const yes=ALL_QUESTIONS.filter(q=>answers[q.id]?.value==='yes');
  const history=yes.filter(q=>q.kind==='history'),supports=yes.filter(q=>q.kind==='support');
  const prenatal=yes.filter(q=>q.kind==='prenatal');
  const topics=new Set(history.flatMap(q=>q.topics));
  const studyIds=studyIdsForQuestions(yes);
  const evidenceIds=new Set(['mace','brfss',...yes.flatMap(q=>q.sources),...studyIds]);
  const studyLinks=studyIds.map(id=>({id,questions:yes.filter(q=>researchForQuestion(q.id).studies.includes(id)).map(q=>({id:q.id,title:q.title,kind:q.kind,status:researchForQuestion(q.id).status,note:researchForQuestion(q.id).note}))}));
  const rows=[...history,...prenatal].map(q=>({
    id:q.id,title:q.title,kind:q.kind,timing:answers[q.id].timing,development:normalizeDevelopment(answers[q.id].development),
    timingText:timingLabel(answers[q.id].timing,q.kind==='prenatal'),
    frequency:answers[q.id].frequency||'unanswered',
    source:KNOWLEDGE_SOURCES.find(s=>s.id===answers[q.id].timing.source)?.label||'Not recorded',
    sources:q.sources,
  }));
  return {
    version:QUESTIONNAIRE_VERSION,evidenceVersion:EVIDENCE_VERSION,answered,total:ALL_QUESTIONS.length,
    substantive:Object.values(answers).filter(a=>a.value==='yes'||a.value==='no').length,
    unsure:Object.values(answers).filter(a=>a.value==='unsure').length,
    skipped:Object.values(answers).filter(a=>a.value==='skip').length,unanswered:ALL_QUESTIONS.length-answered,
    historyCount:history.length,protective:supports.length,prenatalCount:prenatal.length,
    themes:SECTIONS.filter(s=>history.some(q=>q.section===s.id)).map(s=>s.title),
    supports:supports.map(q=>({id:q.id,title:q.title})),timeline:rows,
    evidenceIds:[...evidenceIds],studyLinks,
    researchCoverage:{endorsed:yes.length,withStudies:yes.filter(q=>researchForQuestion(q.id).studies.length).length,unmapped:yes.filter(q=>!researchForQuestion(q.id).studies.length).map(q=>({id:q.id,title:q.title,note:researchForQuestion(q.id).note}))},
    regions:REGIONS.map(r=>({...r,active:topics.has(r.id),
      reasons:history.filter(q=>q.topics.includes(r.id)).map(q=>q.title),
      evidenceIds:[...new Set(history.flatMap(q=>researchForQuestion(q.id).guide).filter(id=>REGION_STUDIES[id].regions.some(item=>item.id===r.id)))],
      studyFocus:history.flatMap(q=>researchForQuestion(q.id).guide).flatMap(id=>REGION_STUDIES[id].regions.filter(item=>item.id===r.id).map(item=>({...item,studyId:id}))),
    })),
  };
}
export function migrateSavedRecord(record) {
  if(!record||typeof record!=='object'||!record.answers||typeof record.answers!=='object'||Array.isArray(record.answers))throw new Error('Saved reflection is not readable. It has not been changed.');
  if(record.schemaVersion===4){
    if(record.questionnaireVersion!=='cc-reflection-4.0')throw new Error('This reflection uses a different questionnaire version. It has not been changed.');
    if(record.insightsVersion!==undefined&&record.insightsVersion!==INSIGHT_VERSION)throw new Error('This reflection uses a different present-day questionnaire version. It has not been changed.');
    const answers=normalizeAnswers(record.answers);for(const a of Object.values(answers))delete a.development;
    return {answers,insights:record.insightsVersion===INSIGHT_VERSION?normalizeInsights(record.insights):{},personContext:{},legacyRecord:record.legacyRecord||null,migrated:true,developmentMigration:true,evidenceUpdated:record.evidenceVersion!==EVIDENCE_VERSION};
  }
  if(record.schemaVersion===SAVE_SCHEMA){
    if(record.developmentVersion!==DEVELOPMENT_VERSION||record.contextVersion!==CONTEXT_VERSION)throw new Error('This reflection uses an unsupported developmental-context version. It has not been changed.');
    if(record.insightsVersion!==undefined&&record.insightsVersion!==INSIGHT_VERSION)throw new Error('This reflection uses a different present-day questionnaire version. It has not been changed.');
    if(record.questionnaireVersion!==QUESTIONNAIRE_VERSION)throw new Error('This reflection uses a different questionnaire version. It has not been changed.');
    return {neurohero:normalizeHeroRecord(record.neurohero),answers:normalizeAnswers(record.answers),personContext:normalizePersonContext(record.personContext),insights:record.insightsVersion===INSIGHT_VERSION?normalizeInsights(record.insights):{},legacyRecord:record.legacyRecord||null,migrated:false,evidenceUpdated:record.evidenceVersion!==EVIDENCE_VERSION};
  }
  if(record.schemaVersion!==undefined)throw new Error('Unsupported saved version. It has not been changed.');
  // Only unchanged support prompts transfer automatically. Never split the old
  // household_instability answer into alcohol, drugs and incarceration guesses.
  const supportIds=new Set(ALL_QUESTIONS.filter(q=>q.kind==='support').map(q=>q.id));
  const answers=Object.fromEntries(Object.entries(normalizeAnswers(record.answers)).filter(([id])=>supportIds.has(id)));
  return {answers,legacyRecord:record,migrated:true};
}
export function readSavedRecord(storage) {
  const raw=storage.getItem(STORAGE_KEY);
  if(!raw)return null;
  if(raw.length>256000)throw new Error('Saved reflection is unexpectedly large. It has not been changed.');
  try{return migrateSavedRecord(JSON.parse(raw));}
  catch(error){if(error instanceof SyntaxError)throw new Error('Saved reflection contains invalid JSON. It has not been changed.');throw error;}
}
export function saveRecord(storage,raw,legacyRecord,consent,insights={},personContext={},neurohero=null) {
  if(consent!==true)throw new Error('Choose explicit device-save consent first.');
  const record={neurohero:normalizeHeroRecord(neurohero),schemaVersion:SAVE_SCHEMA,developmentVersion:DEVELOPMENT_VERSION,contextVersion:CONTEXT_VERSION,personContext:normalizePersonContext(personContext),questionnaireVersion:QUESTIONNAIRE_VERSION,evidenceVersion:EVIDENCE_VERSION,
    savedAt:new Date().toISOString(),answers:normalizeAnswers(raw),insightsVersion:INSIGHT_VERSION,insights:normalizeInsights(insights),legacyRecord:legacyRecord||null};
  const text=JSON.stringify(record);
  if(text.length>256000)throw new Error('Reflection is too large to save. Existing data was not changed.');
  storage.setItem(STORAGE_KEY,text);
  return record;
}
export const SAMPLE_ANSWERS={
  emotional_neglect:{value:'yes',timing:{status:'known',periods:[{startMonth:36,endMonth:72},{startMonth:132,endMonth:156}],source:'memory'},frequency:'often'},
  household_incarceration:{value:'yes',timing:{status:'known',periods:[{startMonth:84,endMonth:108}],source:'family'}},
  household_drugs:{value:'no'},peer_emotional:{value:'yes',timing:{status:'known',periods:[{startMonth:120,endMonth:144}],source:'memory'}},
  safe_adult:{value:'yes'},close_friend:{value:'yes'},competence:{value:'yes'},
};
