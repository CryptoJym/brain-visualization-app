import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ALL_QUESTIONS,QUESTIONNAIRE_VERSION} from '../src/data/assessmentQuestions.mjs';
import {REGIONS,REGION_BY_ID} from '../src/data/anatomyCatalog.mjs';
import {REGION_STUDIES,RESEARCH_VERSION} from '../src/data/regionStudies.mjs';
import {QUESTION_RESEARCH,guideRegions} from '../src/data/questionRegionLinks.mjs';
import {SOURCES} from '../src/data/assessmentEvidence.mjs';
import {calculateProfile,normalizeAnswers,migrateSavedRecord,SAMPLE_ANSWERS} from '../src/utils/assessmentProfile.mjs';
const active=answers=>calculateProfile(answers).regions.filter(r=>r.active).map(r=>r.id);
const manifest=JSON.parse(readFileSync(new URL('../public/models/cortex-brain-v5.manifest.json',import.meta.url)));

test('All 28 question IDs have an explicit reviewed disposition',()=>{
  assert.equal(ALL_QUESTIONS.length,28);assert.deepEqual(new Set(ALL_QUESTIONS.map(q=>q.id)),new Set(Object.keys(QUESTION_RESEARCH)));
});
test('Every question-to-study link resolves; guide studies are a subset',()=>{
  for(const [id,r] of Object.entries(QUESTION_RESEARCH)){
    assert.ok(['domain','related','unmapped'].includes(r.status));assert.ok(r.note.length>50);
    r.studies.forEach(s=>assert.ok(REGION_STUDIES[s],`${id}: ${s}`));r.guide.forEach(s=>assert.ok(r.studies.includes(s)));
  }
});
test('15 primary study records have traceable measurement and limits',()=>{
  assert.equal(Object.keys(REGION_STUDIES).length,15);
  for(const s of Object.values(REGION_STUDIES))for(const field of ['doi','url','sample','measure','finding','limit','timing','review'])assert.ok(s[field],field);
  assert.equal(new Set(Object.values(REGION_STUDIES).map(s=>s.doi)).size,15);
});
test('Every study region and laterality resolves to the anatomy catalog',()=>{
  for(const s of Object.values(REGION_STUDIES))for(const r of s.regions){assert.ok(REGION_BY_ID[r.id]);assert.ok(['L','R','both'].includes(r.side));}
});
test('Verbal mistreatment links specifically to auditory association, not generic ACC',()=>{
  assert.deepEqual(guideRegions('verbal_harm'),['auditory']);assert.equal(REGION_STUDIES.verbalAuditory.regions[0].side,'L');
});
test('Witnessed violence preserves visual and threat-task studies as distinct measurements',()=>{
  assert.ok(guideRegions('witnessed_violence').includes('visual'));
  assert.notEqual(REGION_STUDIES.witnessedVisual.measure,REGION_STUDIES.familyThreat.measure);
});
test('Emotional neglect guide concerns reward activity rather than assumed cortical injury',()=>assert.deepEqual(active({emotional_neglect:{value:'yes'}}),['ventral_striatum']));
test('Two peer items do not double-count the same study',()=>{
  const p=calculateProfile({peer_emotional:{value:'yes'},peer_physical:{value:'yes'}});
  assert.equal(p.studyLinks.length,1);assert.equal(p.studyLinks[0].id,'peerStriatum');assert.equal(p.studyLinks[0].questions.length,2);
  assert.deepEqual(new Set(active({peer_physical:{value:'yes'}})),new Set(['putamen','caudate']));
});
test('Sexual-exposure sensory study has its sample and localization limits',()=>{
  assert.deepEqual(guideRegions('sexual_boundary'),['somatosensory']);assert.match(REGION_STUDIES.sexualSomatic.limit,/not that precise field/);
});
test('Related income and racial-discrimination studies do not silently imply matching exposures',()=>{
  assert.deepEqual(active({material_needs:{value:'yes'},discrimination:{value:'yes'}}),[]);
  assert.ok(calculateProfile({discrimination:{value:'yes'}}).studyLinks.some(s=>s.id==='discriminationNetwork'));
});
test('Household alcohol, drugs and incarceration stay separate and unmapped',()=>{
  for(const id of ['household_alcohol','household_drugs','household_incarceration'])assert.deepEqual(active({[id]:{value:'yes'}}),[]);
});
test('Prenatal cards can be explored without activating personal brain topics',()=>{
  const p=calculateProfile({prenatal_depression:{value:'yes'},prenatal_alcohol:{value:'yes'}});
  assert.equal(p.prenatalCount,2);assert.equal(p.historyCount,0);assert.equal(p.regions.filter(r=>r.active).length,0);assert.equal(p.studyLinks.length,2);
  assert.equal(REGION_STUDIES.prenatalDepression.regions[0].side,'R');assert.match(REGION_STUDIES.prenatalDepression.finding,/not a volume difference/);
});
test('Support studies never subtract history or generate a buffering percentage',()=>{
  const p=calculateProfile({safe_adult:{value:'yes'},physical_assault:{value:'yes'}});assert.equal(p.historyCount,1);assert.equal(p.protective,1);assert.ok(!('buffer' in p));
});
test('Recent research records retain null findings and measurement cautions',()=>{
  assert.match(REGION_STUDIES.enigma2026.finding,/no significant effects/);assert.match(REGION_STUDIES.enigma2026.limit,/power limitations/);
  assert.match(REGION_STUDIES.development2025.limit,/not automatically injury/);assert.match(REGION_STUDIES.development2025.limit,/share participants/);
});
test('Evidence changes leave v4 answers and ages intact',()=>{
  const before={schemaVersion:4,questionnaireVersion:QUESTIONNAIRE_VERSION,evidenceVersion:'cc-evidence-2026-09-11',answers:SAMPLE_ANSWERS};
  const result=migrateSavedRecord(before);assert.deepEqual(result.answers,normalizeAnswers(SAMPLE_ANSWERS));assert.equal(result.evidenceUpdated,true);assert.equal(result.migrated,false);
});
test('Reports deduplicate source IDs and remain deterministic',()=>{
  const p=calculateProfile(SAMPLE_ANSWERS);assert.equal(p.evidenceVersion,RESEARCH_VERSION);
  assert.equal(p.evidenceIds.length,new Set(p.evidenceIds).size);p.evidenceIds.forEach(id=>assert.ok(SOURCES[id]));
  assert.deepEqual(p,calculateProfile(Object.fromEntries(Object.entries(SAMPLE_ANSWERS).reverse())));
});
test('Unknown or No responses do not activate a study or region',()=>{
  const p=calculateProfile({verbal_harm:{value:'unsure'},physical_assault:{value:'no'},sexual_boundary:{value:'skip'}});
  assert.deepEqual(p.studyLinks,[]);assert.equal(p.regions.filter(r=>r.active).length,0);
});
test('All 26 teaching regions have real exported mesh objects',()=>{
  assert.equal(REGIONS.length,26);assert.equal(manifest.meshes.length,47);assert.deepEqual(new Set(manifest.meshes.map(m=>m.regionId)),new Set(REGIONS.map(r=>r.id)));
  for(const m of manifest.meshes)assert.ok(m.triangles>0);
});
test('Both anatomical sides exist for all bilateral cortical and deep regions',()=>{
  for(const r of REGIONS.filter(r=>r.hemispheres==='bilateral'&&r.kind!=='support'))assert.deepEqual(new Set(manifest.meshes.filter(m=>m.regionId===r.id).map(m=>m.hemisphere)),new Set(['L','R']),r.id);
});
for(const [name,expected] of Object.entries(manifest.assets))test(`GLB integrity and attribution metadata: ${name}`,()=>{
  const b=readFileSync(new URL('../public/models/'+name,import.meta.url));assert.equal(b.readUInt32LE(8),b.length);assert.equal(b.length,expected.bytes);
  assert.equal(createHash('sha256').update(b).digest('hex'),expected.sha256);
  const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());assert.equal(g.meshes.length,47);
  const nodes=g.nodes.filter(n=>n.mesh!==undefined);nodes.forEach(n=>assert.equal(n.extras.educationalOnly,true));
  assert.ok(g.materials.some(m=>m.normalTexture));assert.ok(b.length<25*1024*1024);
});
test('Deprivation-study sample uses the final DTI analysis, not the original trial enrollment',()=>{
  const s=REGION_STUDIES.deprivationWhiteMatter;
  assert.match(s.sample,/69 children/);assert.match(s.sample,/23 foster-care/);
  assert.match(s.sample,/26 institutional-care/);assert.match(s.sample,/20 never-institutionalized/);
  assert.match(s.finding,/still differed/);
});
test('Export manifest pins the exact catalog, Blender source and builder',()=>{
  const hash=path=>createHash('sha256').update(readFileSync(new URL(path,import.meta.url))).digest('hex');
  assert.equal(manifest.catalogSha256,hash('../src/data/anatomyRegions.json'));
  assert.equal(manifest.sourceBlendSha256,hash('../art/blender/cortex-brain-v2.blend'));
  assert.equal(manifest.builderSha256,hash('../art/blender/build_research_regions.py'));
});
