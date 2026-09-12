import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildInsights,normalizeInsights} from '../src/utils/insightProfile.mjs';
import {INSIGHT_QUESTIONS,COMBINATIONS,SAMPLE_INSIGHTS,INSIGHT_VERSION} from '../src/data/insightQuestions.mjs';
import {saveRecord,readSavedRecord,STORAGE_KEY,SAMPLE_ANSWERS} from '../src/utils/assessmentProfile.mjs';
import {QUESTIONNAIRE_VERSION} from '../src/data/assessmentQuestions.mjs';
const storage=()=>{const map=new Map();return {getItem:key=>map.get(key)||null,setItem:(key,value)=>map.set(key,value)};};
test('16 unique present-day observations',()=>assert.equal(new Set(INSIGHT_QUESTIONS.map(q=>q.id)).size,16));
test('empty reflection cannot create powers or friction',()=>{const p=buildInsights();assert.equal(p.strengths.length+p.frictions.length+p.combinations.length,0);assert.equal(p.unknown.length,16);});
for(const choice of ['rarely','unsure','skip'])test(`${choice} never selects a strength`,()=>{const p=buildInsights(Object.fromEntries(INSIGHT_QUESTIONS.map(q=>[q.id,choice])));assert.equal(p.strengths.length+p.frictions.length+p.combinations.length,0);});
test('rarely is a substantive time-specific response, not unknown',()=>assert.equal(buildInsights({noticing:'rarely'}).unknown.includes('noticing'),false));
test('malformed arrays, nested values, and unknown IDs rejected',()=>{for(const v of [null,[],false,42,'often'])assert.deepEqual(normalizeInsights(v),{});assert.deepEqual(normalizeInsights({noticing:{value:'often'},evil:'often',focus:'yes'}),{});});
test('prototype data never supplies an observation',()=>assert.deepEqual(normalizeInsights(Object.create({noticing:'often'})),{}));
test('history cannot select insight outputs',()=>{const p=buildInsights({...SAMPLE_ANSWERS,brain_damage:100});assert.equal(p.answered,0);assert.equal(p.combinations.length,0);});
test('strengths do not invent corresponding friction',()=>assert.equal(buildInsights({noticing:'often',ideas:'often'}).frictions.length,0));
for(const c of COMBINATIONS){
 test(`${c.id}: both explicit components required`,()=>{assert.equal(buildInsights({[c.requires[0]]:'often'}).combinations.some(x=>x.id===c.id),false);assert.equal(buildInsights({[c.requires[0]]:'often',[c.requires[1]]:'unsure'}).combinations.some(x=>x.id===c.id),false);assert.equal(buildInsights(Object.fromEntries(c.requires.map(id=>[id,'sometimes']))).combinations.some(x=>x.id===c.id),true);});
}
test('combination labels preserve untested status and basis',()=>{for(const c of buildInsights(SAMPLE_INSIGHTS).combinations){assert.equal(c.status,'Untested combination hypothesis');assert.equal(c.basis.length,2);assert.match(c.evidence,/No study/);}});
test('unendorsed support cannot become a protective modifier',()=>assert.equal(buildInsights({focus:'often',organize:'often',current_agency:'unsure'}).combinations[0].reportedResources.length,0));
test('save/reopen preserves insights and original history',()=>{const st=storage();saveRecord(st,SAMPLE_ANSWERS,null,true,SAMPLE_INSIGHTS);const r=readSavedRecord(st);assert.deepEqual(r.insights,SAMPLE_INSIGHTS);assert.equal(r.answers.emotional_neglect.timing.periods.length,2);});
test('old schema-4 save reopens with unknown insights, not invented defaults',()=>{const st=storage();st.setItem(STORAGE_KEY,JSON.stringify({schemaVersion:4,questionnaireVersion:'cc-reflection-4.0',answers:SAMPLE_ANSWERS}));const r=readSavedRecord(st);assert.deepEqual(r.insights,{});assert.equal(r.answers.household_incarceration.value,'yes');});
test('unknown insight version is not silently reinterpreted',()=>{const st=storage();st.setItem(STORAGE_KEY,JSON.stringify({schemaVersion:4,questionnaireVersion:'cc-reflection-4.0',answers:{},insightsVersion:'future',insights:SAMPLE_INSIGHTS}));assert.throws(()=>readSavedRecord(st),/different present-day questionnaire version/);});
test('explicit save consent remains mandatory',()=>assert.throws(()=>saveRecord(storage(),{},null,false,SAMPLE_INSIGHTS),/consent/));
test('only known strings are saved',()=>{const st=storage();const r=saveRecord(st,{},null,true,{noticing:'often',unknown:'often'});assert.equal(r.insightsVersion,INSIGHT_VERSION);assert.deepEqual(r.insights,{noticing:'often'});});
test('insight model does not import anatomy or childhood profile',()=>{const s=readFileSync(new URL('../src/utils/insightProfile.mjs',import.meta.url),'utf8');assert.doesNotMatch(s,/from .*assessmentProfile|from .*anatomy|from .*regionStudies/);});
test('report default excludes sensitive history appendix',()=>{const s=readFileSync(new URL('../src/components/CompassReports.jsx',import.meta.url),'utf8');assert.match(s,/\[privateHistory,setPrivateHistory\]=useState\(false\)/);assert.match(s,/privateHistory&&<Page>/);});
