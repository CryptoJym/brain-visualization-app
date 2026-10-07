import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ALL_QUESTIONS} from '../src/data/assessmentQuestions.mjs';
import {REGION_BY_ID} from '../src/data/anatomyCatalog.mjs';
import {REGION_STUDIES} from '../src/data/regionStudies.mjs';
import {SOURCES} from '../src/data/assessmentEvidence.mjs';
import {calculateProfile,SAMPLE_ANSWERS} from '../src/utils/assessmentProfile.mjs';
import {buildBrainStory,meshMatches,meshNamesFor,mergeSides,mapView,stepText,stepDwellMs,PLAIN_NAMES,STORY_COPY,SIDE_TEXT} from '../src/utils/brainStory.mjs';

const root=new URL('../',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('public/models/cortex-brain-v6.manifest.json',root)));
// Mesh records straight from each GLB's node extras: the data the 3D viewer actually matches against.
const glbRecords=name=>{
  const b=readFileSync(new URL('public/models/'+name,root));const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());
  return g.nodes.filter(n=>n.mesh!==undefined).map(n=>({name:n.name,...n.extras}));
};
const MODELS=Object.fromEntries(Object.entries(manifest.lods).map(([lod,name])=>[lod,glbRecords(name)]));
const yes=ids=>Object.fromEntries(ids.map(id=>[id,{value:'yes'}]));
const story=answers=>buildBrainStory(calculateProfile(answers));
const history=ALL_QUESTIONS.filter(q=>q.kind==='history');

test('sample profile: three linked structures, in profile order, with the sides the studies reported',()=>{
  const s=story(SAMPLE_ANSWERS);
  assert.deepEqual(s.highlight,[{id:'ventral_striatum',side:'both'},{id:'caudate',side:'L'},{id:'putamen',side:'L'}]);
  assert.equal(s.key,'ventral_striatum:both,caudate:L,putamen:L');
  assert.deepEqual(s.steps.map(x=>x.answers.map(a=>a.id)),[['emotional_neglect'],['peer_emotional'],['peer_emotional']]);
  assert.deepEqual(s.steps.map(x=>x.studies.map(st=>st.id)),[['neglectReward'],['peerStriatum'],['peerStriatum']]);
  assert.deepEqual(s.steps.map(x=>x.number),[1,2,3]);
  assert.deepEqual({mode:s.mode,view:s.view},{mode:'deep',view:'perspective'});
});

test('answer → structure → mesh: a fresh reflection with three Yes answers resolves to real meshes in both model files',()=>{
  const s=story(yes(['verbal_harm','witnessed_violence','sexual_boundary']));
  // Profile order is the anatomy catalog order, not the order the questions were answered.
  assert.deepEqual(s.highlight,[{id:'somatosensory',side:'L'},{id:'auditory',side:'L'},{id:'visual',side:'both'},{id:'amygdala',side:'both'},{id:'insula',side:'both'}]);
  const expected={somatosensory:['Cortex_somatosensory_L'],auditory:['Cortex_auditory_L'],visual:['Cortex_visual_L','Cortex_visual_R'],amygdala:['Amygdala_L','Amygdala_R'],insula:['Insula_L','Insula_R']};
  for(const [lod,records] of Object.entries(MODELS))for(const step of s.steps)
    assert.deepEqual(meshNamesFor(records,step.id,step.side).sort(),expected[step.id],`${lod}: ${step.id}`);
  assert.deepEqual(s.steps.find(x=>x.id==='amygdala').answers.map(a=>a.id),['witnessed_violence'],'only the answers that link it');
  assert.deepEqual(s.steps.find(x=>x.id==='visual').studies.map(st=>st.id),['witnessedVisual']);
});

test('every structure any answer can link is drawn by meshes on the side its studies reported, in both LODs',()=>{
  const all=story(yes(history.map(q=>q.id)));
  assert.deepEqual(all.steps.map(x=>x.id),['somatosensory','auditory','visual','amygdala','insula','ventral_striatum','caudate','putamen']);
  for(const [lod,records] of Object.entries(MODELS)){
    assert.equal(records.length,manifest.assets[manifest.lods[lod]].meshes,lod);
    for(const step of all.steps){
      const names=meshNamesFor(records,step.id,step.side);
      assert.ok(names.length>0,`${lod}: ${step.id} has meshes`);
      const sides=new Set(records.filter(r=>names.includes(r.name)).map(r=>r.hemisphere));
      assert.deepEqual(sides,step.side==='both'?new Set(['L','R']):new Set([step.side]),`${lod}: ${step.id} ${step.side}`);
      for(const name of names)assert.ok(manifest.meshes.some(m=>m.name===name&&m.regionId===step.id),`${name} is a ${step.id} mesh in the manifest`);
    }
  }
});

test('the mesh rule: helpers never match, midline meshes match every side, lobes include their member regions',()=>{
  const desktop=MODELS.desktop;
  assert.deepEqual(meshNamesFor(desktop,'putamen','R'),['Putamen_R']);
  assert.deepEqual(meshNamesFor(desktop,'hypothalamus','L'),['Hypothalamus']);
  assert.deepEqual(meshNamesFor(desktop,'temporal','L').sort(),['Cortex_auditory_L','Cortex_temporal_L']);
  for(const helper of desktop.filter(r=>r.helper))for(const id of Object.keys(REGION_BY_ID))assert.equal(meshMatches(helper,id),false,helper.name);
  assert.equal(meshMatches({regionId:'amygdala',hemisphere:'L'},''),false);
  assert.equal(meshMatches(null,'amygdala'),false);
});

test('the 3D viewer uses the same tested mesh rule',()=>{
  const source=readFileSync(new URL('src/components/CortexBrain.jsx',root),'utf8');
  assert.match(source,/import \{[^}]*meshMatches[^}]*\} from '\.\.\/utils\/brainStory\.mjs'/);
  assert.match(source,/meshMatches\(mesh\.userData,id,selectedSide\)/);
});

test('links come only from the profile: active regions, their reasons and their study focus',()=>{
  for(const q of [...history,...ALL_QUESTIONS.filter(item=>item.kind!=='history')]){
    const profile=calculateProfile(yes([q.id])),s=buildBrainStory(profile),active=profile.regions.filter(r=>r.active);
    assert.deepEqual(s.steps.map(x=>x.id),active.map(r=>r.id),q.id);
    s.steps.forEach((step,i)=>{
      const region=active[i];
      assert.deepEqual(step.answers.map(a=>a.title),region.reasons,`${q.id}: ${step.id} reasons`);
      assert.deepEqual(step.studies.map(st=>st.id),[...new Set(region.studyFocus.map(f=>f.studyId))],`${q.id}: ${step.id} studies`);
      assert.equal(step.side,mergeSides(region.studyFocus.map(f=>f.side)));
    });
  }
});

test('study text and source links are the site’s own study records, unchanged',()=>{
  const all=story(yes(history.map(q=>q.id)));
  for(const step of all.steps)for(const st of step.studies){
    const record=REGION_STUDIES[st.id];
    for(const field of ['label','type','url','doi','sample','measure','finding'])assert.equal(st[field],record[field],`${step.id}/${st.id}.${field}`);
    assert.equal(st.url,SOURCES[st.id].url);assert.match(st.url,/^https:\/\//);
    assert.ok(['Domain study','Related evidence'].includes(st.evidence));
  }
});

test('answers shown for a structure are the person’s own Yes history questions, with their wording',()=>{
  const titles=history.map(q=>q.title);assert.equal(new Set(titles).size,titles.length,'history titles are unique');
  const all=story(yes(history.map(q=>q.id)));
  for(const step of all.steps)for(const a of step.answers){const q=history.find(item=>item.id===a.id);assert.ok(q);assert.equal(a.text,q.text);assert.equal(a.title,q.title);}
  const amygdala=all.steps.find(x=>x.id==='amygdala');
  assert.deepEqual(amygdala.answers.map(a=>a.id),['physical_assault','threatened_harm','witnessed_violence']);
  assert.equal(amygdala.studies.length,1,'three answers through one study show the study once');
});

test('nothing linked gives an empty story: no answers, No / Not sure / skipped, prenatal, supports, unmapped history',()=>{
  const cases=[{},{verbal_harm:{value:'no'},physical_assault:{value:'unsure'},sexual_boundary:{value:'skip'}},yes(['prenatal_depression','prenatal_alcohol']),
    yes(ALL_QUESTIONS.filter(q=>q.kind==='support').map(q=>q.id)),yes(['household_incarceration','material_needs','discrimination','caregiver_death'])];
  for(const answers of cases){const s=story(answers);assert.deepEqual(s.steps,[]);assert.deepEqual(s.highlight,[]);assert.equal(s.key,'');}
});

test('sides merge to what the studies reported',()=>{
  assert.equal(mergeSides(['L']),'L');assert.equal(mergeSides(['R','R']),'R');assert.equal(mergeSides(['L','R']),'both');
  assert.equal(mergeSides(['L','both']),'both');assert.equal(mergeSides([]),'both');assert.equal(mergeSides(['x']),'both');
  assert.deepEqual(Object.keys(SIDE_TEXT).sort(),['L','R','both']);
});

test('map camera: see-through view for anything deep, surface for lateral cortex only',()=>{
  assert.deepEqual(mapView([]),{mode:'surface',view:'perspective'});
  assert.deepEqual({mode:story(yes(['verbal_harm'])).mode,view:story(yes(['verbal_harm'])).view},{mode:'surface',view:'left'});
  assert.deepEqual({mode:story(yes(['verbal_harm','sexual_boundary'])).mode,view:story(yes(['verbal_harm','sexual_boundary'])).view},{mode:'surface',view:'left'});
  assert.equal(story(yes(['witnessed_violence'])).mode,'deep','medial visual cortex and deep structures');
  assert.equal(story(yes(['physical_assault'])).mode,'deep');
  assert.equal(mapView([{lateralCortex:true,side:'R'}]).view,'right');
});

test('every structure a study can point to has a plain name and a separate scientific name',()=>{
  const studyRegions=new Set(Object.values(REGION_STUDIES).flatMap(s=>s.regions.map(r=>r.id)));
  for(const id of studyRegions){
    assert.ok(PLAIN_NAMES[id],id);assert.ok(REGION_BY_ID[id],id);
    assert.notEqual(PLAIN_NAMES[id].toLowerCase(),REGION_BY_ID[id].name.toLowerCase(),id);
  }
  const vs=story(SAMPLE_ANSWERS).steps[0];
  assert.equal(vs.plainName,'Reward-learning area');assert.equal(vs.scientificName,'Ventral striatum / nucleus accumbens');
});

test('the wording stays honest: research links in groups, never a measured, scanned, damaged or changed brain',()=>{
  const all=story(yes(history.map(q=>q.id)));
  const samples={meaning:[['Reward-learning area']],stop:[[0,3],[2,3]]};
  const copy=Object.entries(STORY_COPY).flatMap(([key,v])=>typeof v==='function'?(samples[key]||[[1],[3]]).map(args=>v(...args)):[v]).map(String);
  assert.ok(copy.length>=Object.keys(STORY_COPY).length);
  const generated=all.steps.flatMap(step=>[step.plainName,step.scientificName,step.sideText,step.lead,step.meaning]);
  const forbidden=[/damag/i,/injur/i,/\bscan/i,/diagnos/i,/\bactivation\b/i,/\bimpacted\b/i,/\baffected\b/i,/\bharm(ed)? your\b/i,
    /your (own )?brain (was|is|has|had|got|shows?)\b/i,/(changed|altered|shrank|shrunk) your\b/i,/\byour [a-z -]+ (is|was) (smaller|larger|thinner|different|changed|measured)/i];
  for(const text of [...copy,...generated])for(const pattern of forbidden)assert.doesNotMatch(text,pattern,text);
  assert.match(STORY_COPY.intro(3),/^Research shows experiences like the ones you reported can affect/);
  assert.match(STORY_COPY.lead,/^Research shows experiences like these can affect/);
  assert.match(STORY_COPY.basis,/groups of people/);assert.match(STORY_COPY.basis,/nothing here measured yours/);
  assert.match(STORY_COPY.findingsHeading,/groups of people/);assert.match(STORY_COPY.order,/teaching colors/);
});

test('each stop has one sentence on what it does and doesn’t mean',()=>{
  for(const step of story(yes(history.map(q=>q.id))).steps){
    const sentences=step.meaning.split(/(?<=[.!?])\s+/).filter(Boolean);
    assert.equal(sentences.length,1,step.meaning);
    assert.match(step.meaning,/^Use it as a topic to read about/);assert.match(step.meaning,/research on groups, not your own/);assert.match(step.meaning,/nothing here has measured/);
    assert.ok(step.meaning.includes(step.plainName.toLowerCase()),step.id);
  }
});

test('play timing follows the amount of text and stays between 10 and 24 seconds',()=>{
  for(const step of story(yes(history.map(q=>q.id))).steps){
    const ms=stepDwellMs(step);assert.ok(ms>=10000&&ms<=24000,`${step.id}: ${ms}`);
    assert.ok(stepText(step).includes(step.studies[0].finding));
  }
  assert.equal(stepDwellMs({plainName:'A',scientificName:'B',sideText:'',answers:[],lead:'',studies:[],meaning:''}),10000);
});

test('the same answers always give the same story',()=>{
  assert.deepEqual(story(SAMPLE_ANSWERS),story(Object.fromEntries(Object.entries(SAMPLE_ANSWERS).reverse())));
});
