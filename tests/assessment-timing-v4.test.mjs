import test from 'node:test';
import assert from 'node:assert/strict';
import {AGE_PRESETS,emptyTiming,mergePeriods,periodError,normalizeTiming,safeTiming,toggleBand,putPeriod,ageLabel,timingLabel} from '../src/utils/assessmentTiming.mjs';
import {ALL_QUESTIONS} from '../src/data/assessmentQuestions.mjs';
import {SOURCES} from '../src/data/assessmentEvidence.mjs';
import {REGIONS} from '../src/data/brainSystems.mjs';
import {calculateProfile,normalizeAnswers,migrateSavedRecord,readSavedRecord,saveRecord,STORAGE_KEY,SAMPLE_ANSWERS} from '../src/utils/assessmentProfile.mjs';
const known=(startMonth,endMonth)=>({...emptyTiming('known'),periods:[{startMonth,endMonth}]});
const active=answers=>calculateProfile(answers).regions.filter(r=>r.active).map(r=>r.id);
function storage(initial=null){let value=initial;return {getItem:()=>value,setItem:(_,s)=>{value=s;},removeItem:()=>{value=null;}};}

test('Quick presets cover birth to 18 with nonoverlapping boundaries',()=>{
  assert.equal(AGE_PRESETS[0].startMonth,0);assert.equal(AGE_PRESETS.at(-1).endMonth,216);
  AGE_PRESETS.slice(1).forEach((p,i)=>assert.equal(p.startMonth,AGE_PRESETS[i].endMonth));
  assert.equal(AGE_PRESETS[0].endMonth,18);
});
test('Human labels distinguish infancy and years',()=>{
  assert.equal(ageLabel(0),'Birth');assert.equal(ageLabel(18),'18 months');assert.equal(ageLabel(24),'2 years');assert.equal(ageLabel(28),'2 years 4 months');
});
test('Valid endpoints and same-age events are accepted',()=>{assert.equal(periodError(6,24),'');assert.equal(periodError(36,36),'');assert.equal(periodError(215,216),'');});
test('Reversed, negative, noninteger and adult ranges fail',()=>{
  for(const pair of [[24,6],[-1,6],[0,217],[216,216],[0.5,18],[NaN,18],['6',24]])assert.notEqual(periodError(...pair),'');
});
test('Merge is sorted, nonmutating and canonical',()=>{
  const input=[{startMonth:84,endMonth:120},{startMonth:6,endMonth:24},{startMonth:18,endMonth:36}];const copy=structuredClone(input);
  assert.deepEqual(mergePeriods(input),[{startMonth:6,endMonth:36},{startMonth:84,endMonth:120}]);assert.deepEqual(input,copy);
});
test('Separate episodes retain the gap',()=>assert.equal(mergePeriods([{startMonth:0,endMonth:18},{startMonth:84,endMonth:120}]).length,2));
test('Toggle a band removes only its span',()=>{
  const result=toggleBand(known(0,216),AGE_PRESETS[2]);
  assert.deepEqual(result.periods,[{startMonth:0,endMonth:36},{startMonth:72,endMonth:216}]);
});
test('Preset and custom representations share one timeline',()=>{
  const first=toggleBand(emptyTiming(),AGE_PRESETS[0]);const changed=putPeriod(first,{startMonth:6,endMonth:24},0);
  assert.deepEqual(changed.periods,[{startMonth:6,endMonth:24}]);assert.equal(changed.status,'known');
});
test('Malformed stored ages stay unknown rather than becoming zero',()=>{assert.equal(safeTiming(known(-1,20)).status,'unknown');assert.equal(safeTiming(known(-1,20)).invalid,true);});
test('Unknown and withheld clear latent ranges',()=>{
  for(const status of ['unknown','withheld'])assert.deepEqual(normalizeTiming({...known(12,36),status}).periods,[]);
});
test('Prenatal timing is never represented as a post-birth interval',()=>{
  const t=normalizeTiming({...known(0,18),source:'records'},true);assert.equal(t.status,'prenatal');assert.deepEqual(t.periods,[]);assert.equal(t.source,'records');
  assert.equal(timingLabel(t,true),'Before birth · during pregnancy');
});
test('Prenatal source cannot be personal recollection',()=>assert.equal(normalizeTiming({source:'memory'},true).source,'unknown'));
test('Question and source identifiers are unique and valid',()=>{
  assert.equal(ALL_QUESTIONS.length,28);assert.equal(new Set(ALL_QUESTIONS.map(q=>q.id)).size,28);
  for(const q of ALL_QUESTIONS){q.sources.forEach(id=>assert.ok(SOURCES[id],`${q.id}: ${id}`));q.topics.forEach(id=>assert.ok(REGIONS.some(r=>r.id===id)));}
  Object.values(SOURCES).forEach(s=>assert.ok(s.url.startsWith('https://')&&s.limit&&s.finding));
});
test('Alcohol, drugs and incarceration are distinct and context-only',()=>{
  for(const id of ['household_alcohol','household_drugs','household_incarceration']){assert.ok(ALL_QUESTIONS.find(q=>q.id===id));assert.deepEqual(active({[id]:{value:'yes'}}),[]);}
  assert.ok(!ALL_QUESTIONS.some(q=>q.id==='household_instability'));
});
test('Different exposures do not populate each other',()=>{
  const a=normalizeAnswers({household_incarceration:{value:'yes'}});assert.equal(a.household_drugs,undefined);assert.equal(a.household_alcohol,undefined);
});
test('Not sure, skipped, unanswered and No remain distinct',()=>{
  const p=calculateProfile({physical_assault:{value:'no'},household_drugs:{value:'unsure'},household_alcohol:{value:'skip'}});
  assert.equal(p.substantive,1);assert.equal(p.unsure,1);assert.equal(p.skipped,1);assert.equal(p.unanswered,25);assert.equal(p.historyCount,0);
});
test('No endorsed domains means no affected-region inference',()=>assert.deepEqual(active({}),[]));
test('Ages and frequency never change brain-topic selection',()=>{
  const a={physical_assault:{value:'yes',timing:known(0,18),frequency:'once'}};
  const b={physical_assault:{value:'yes',timing:known(120,216),frequency:'chronic'}};
  assert.deepEqual(active(a),active(b));
});
test('Protective factors do not subtract adversity or change topics',()=>{
  const a={physical_assault:{value:'yes'}},b={...a,safe_adult:{value:'yes'},close_friend:{value:'yes'}};
  assert.equal(calculateProfile(a).historyCount,calculateProfile(b).historyCount);assert.deepEqual(active(a),active(b));assert.equal(calculateProfile(b).protective,2);
});
test('Prenatal context is separate from childhood events and topic inference',()=>{
  const p=calculateProfile({prenatal_depression:{value:'yes'},prenatal_alcohol:{value:'yes'}});
  assert.equal(p.historyCount,0);assert.equal(p.prenatalCount,2);assert.equal(p.regions.filter(r=>r.active).length,0);
});
test('Reports expose no unvalidated score fields',()=>{
  const p=calculateProfile(SAMPLE_ANSWERS);for(const key of ['score','load','band','buffer','severity'])assert.ok(!(key in p));
  p.regions.forEach(r=>assert.ok(!('score' in r)));
});
test('Report determinism is independent of answer-key order',()=>{
  assert.deepEqual(calculateProfile(SAMPLE_ANSWERS),calculateProfile(Object.fromEntries(Object.entries(SAMPLE_ANSWERS).reverse())));
});
test('Changing Yes to No removes timing from calculations',()=>{
  const p=calculateProfile({physical_assault:{value:'no',timing:known(0,18)}});assert.equal(p.timeline.length,0);
  assert.deepEqual(normalizeAnswers({physical_assault:{value:'no',timing:known(0,18)}}).physical_assault,{value:'no'});
});
test('Legacy combined answers are preserved, never silently split',()=>{
  const old={answers:{household_instability:{value:'yes',ages:['0-3','3-5']},safe_adult:{value:'yes'}}};
  const copy=structuredClone(old),m=migrateSavedRecord(old);
  assert.deepEqual(m.answers,{safe_adult:{value:'yes'}});assert.deepEqual(m.legacyRecord,copy);assert.deepEqual(old,copy);assert.equal(m.migrated,true);
});
test('New schema round trips months and separate periods',()=>{
  const s=storage();saveRecord(s,SAMPLE_ANSWERS,null,true);const r=readSavedRecord(s);assert.deepEqual(r.answers,normalizeAnswers(SAMPLE_ANSWERS));assert.equal(r.migrated,false);
});
test('Save requires explicit consent and preserves earlier copy on refusal',()=>{
  const s=storage('original');assert.throws(()=>saveRecord(s,{},null,false));assert.equal(s.getItem(STORAGE_KEY),'original');
});
test('Original legacy snapshot survives saving the new version',()=>{
  const old={answers:{household_instability:{value:'yes',ages:['throughout']}}};const s=storage();saveRecord(s,{},old,true);assert.deepEqual(readSavedRecord(s).legacyRecord,old);
});
test('Corrupt storage is not overwritten or deleted',()=>{
  const s=storage('{bad');assert.throws(()=>readSavedRecord(s));assert.equal(s.getItem(STORAGE_KEY),'{bad');
});
test('Future versions and invalid record shapes are rejected',()=>{
  assert.throws(()=>migrateSavedRecord({schemaVersion:99,answers:{}}));assert.throws(()=>migrateSavedRecord({answers:[]}));
  assert.throws(()=>migrateSavedRecord({schemaVersion:4,questionnaireVersion:'future',answers:{}}));
});
test('Unknown fields and invalid response values are ignored safely',()=>{
  assert.deepEqual(normalizeAnswers({household_drugs:{value:true},unknown_field:{value:'yes'}}),{});
});
test('Missing frequency is distinct from an explicit Not sure',()=>{
  const p=calculateProfile({physical_assault:{value:'yes'},household_drugs:{value:'yes',frequency:'unknown'}});
  assert.equal(p.timeline.find(r=>r.id==='physical_assault').frequency,'unanswered');
  assert.equal(p.timeline.find(r=>r.id==='household_drugs').frequency,'unknown');
});
