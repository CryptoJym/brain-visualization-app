// Brain story: the teaching structures research links to a person's answers, the order the
// walkthrough visits them, and the v6 meshes that draw each one. Pure data, no rendering.
// Links come only from calculateProfile(answers).regions (active, reasons, studyFocus). Study text
// comes from regionStudies.mjs and names from the anatomy catalog; nothing is inferred here.
import {REGION_BY_ID} from '../data/anatomyCatalog.mjs';
import {REGION_STUDIES} from '../data/regionStudies.mjs';
import {ALL_QUESTIONS} from '../data/assessmentQuestions.mjs';
import {RESEARCH_LABELS} from '../data/questionRegionLinks.mjs';

const HISTORY_BY_TITLE=new Map(ALL_QUESTIONS.filter(q=>q.kind==='history').map(q=>[q.title,q]));

// Everyday names for every structure a study in regionStudies.mjs points to. Each one stays within
// the catalog's own "function" line; the scientific name always comes from the catalog.
export const PLAIN_NAMES={
  frontal:'Front of the brain',
  dlpfc:'Planning and focus area',
  ofc:'Value and expectation area',
  somatosensory:'Body-sensation strip',
  parietal:'Sensation and space lobe',
  temporal:'Hearing and memory lobe',
  occipital:'Vision lobe',
  auditory:'Sound-meaning area',
  visual:'Inner vision area',
  pcc:'Resting-network area',
  acc:'Monitoring and regulation area',
  amygdala:'Emotional-significance area',
  hippocampus:'Memory and context area',
  insula:'Body-awareness area',
  callosum:'Bridge between the two halves',
  ventral_striatum:'Reward-learning area',
  caudate:'Learning and action area',
  putamen:'Movement-learning area',
};

// Every sentence the brain map and walkthrough show, so the honesty rules can be tested in one place.
// The limits live in `basis`; each stop adds one sentence on what it does and doesn't mean.
export const STORY_COPY={
  eyebrow:'ILLUSTRATIVE ANATOMY',
  title:'Brain map of your answers',
  emptyTitle:'Explore the systems',
  chip:'Same generic brain for everyone',
  panelEyebrow:'LINKED TO YOUR ANSWERS',
  intro:n=>`Research shows experiences like the ones you reported can affect ${n===1?'the structure':`the ${n} structures`} highlighted here.`,
  basis:'These links come from studies of groups of people. The brain is a teaching model, the same for everyone, and nothing here measured yours.',
  order:'Listed in anatomy order, not by importance. Colors are teaching colors.',
  legendFrom:n=>n===1?'From your answer:':'From your answers:',
  walk:'Walk me through it',
  walkHint:'The camera visits each structure in turn and explains it. Pause or exit at any time.',
  walkHintStill:'Your device asks for less motion, so the walkthrough opens as a still list of steps.',
  textVersion:n=>`Read the walkthrough as text (${n} ${n===1?'stop':'stops'})`,
  exploring:'You are exploring freely, so the map highlights are paused.',
  backToMap:'Show the brain map',
  stop:(i,n)=>`Stop ${i+1} of ${n}`,
  answersHeading:'From your answers',
  answered:'You answered Yes.',
  lead:'Research shows experiences like these can affect this structure.',
  findingsHeading:'What studies found in groups of people',
  readStudy:'Read the study',
  meaningHeading:'What this means for you',
  meaning:plain=>`Use it as a topic to read about or talk over with someone you trust; it describes research on groups, not your own ${plain.toLowerCase()}, which nothing here has measured.`,
  previous:'Previous',
  play:'Play',
  pause:'Pause',
  next:'Next',
  exit:'Exit walkthrough',
  controls:'Walkthrough controls',
  stillHeading:n=>`All ${n} ${n===1?'stop':'stops'}, as still steps`,
  stillNote:'The brain stays still on your map. The numbers match its labels.',
  closeSteps:'Close the steps',
  emptyHeading:'No structures are linked to your answers',
  empty:'Many important experiences have no region-specific study in this site’s research guide, and that takes nothing away from them. You can still explore any structure on the teaching brain.',
};

// The side the studies reported, so a single side is never read as the person's own left or right.
export const SIDE_TEXT={L:'left side in the study',R:'right side in the study',both:'both sides'};

// One side for a structure: what every study that links it reported. Mixed or bilateral → both.
export function mergeSides(sides=[]){
  const set=new Set(sides.filter(s=>['L','R','both'].includes(s)));
  if(!set.size||set.has('both')||(set.has('L')&&set.has('R')))return 'both';
  return [...set][0];
}

// The viewer's mesh rule, shared so the tests cover the code the 3D brain runs. A record is a mesh's
// glTF extras ({regionId, hemisphere, helper}); midline meshes belong to every side.
export function meshMatches(record,id,side='both'){
  if(!id||!record||record.helper)return false;
  const members=REGION_BY_ID[id]?.members||[id];
  return members.includes(record.regionId)&&(side==='both'||record.hemisphere===side||!['L','R'].includes(record.hemisphere));
}
export function meshNamesFor(records,id,side='both'){
  return records.filter(record=>meshMatches(record,id,side)).map(record=>record.name);
}
export function plainName(id){return PLAIN_NAMES[id]||REGION_BY_ID[id]?.label||id;}
// The catalog's full name, without the "guide" teaching suffix.
export function scientificName(id){const r=REGION_BY_ID[id];return (r?.name||r?.label||id).replace(/ guide$/,'');}

export function buildBrainStory(profile){
  const steps=(profile?.regions||[]).filter(region=>region.active).map((region,index)=>{
    const catalog=REGION_BY_ID[region.id]||region,focus=region.studyFocus||[];
    const side=mergeSides(focus.map(item=>item.side));
    const answers=(region.reasons||[]).map(title=>{const q=HISTORY_BY_TITLE.get(title);return {id:q?.id||title,title,text:q?.text||''};});
    const studies=new Map();
    for(const item of focus){
      const s=REGION_STUDIES[item.studyId];if(!s)continue;
      const entry=studies.get(item.studyId)||{id:item.studyId,label:s.label,type:s.type,url:s.url,doi:s.doi,sample:s.sample,measure:s.measure,finding:s.finding,evidence:RESEARCH_LABELS[s.support]||'',sides:[]};
      if(!entry.sides.includes(item.side))entry.sides.push(item.side);
      studies.set(item.studyId,entry);
    }
    const plain=plainName(region.id);
    return {index,number:index+1,id:region.id,side,sideText:SIDE_TEXT[side],plainName:plain,scientificName:scientificName(region.id),
      label:catalog.label,color:catalog.color,kind:catalog.kind,lateralCortex:catalog.kind==='cortex'&&!catalog.medial,
      answers,studies:[...studies.values()],lead:STORY_COPY.lead,meaning:STORY_COPY.meaning(plain)};
  });
  const highlight=steps.map(step=>({id:step.id,side:step.side}));
  return {steps,highlight,key:highlight.map(h=>`${h.id}:${h.side}`).join(','),...mapView(steps)};
}

// The whole-map camera: lateral cortex alone reads best on the surface; anything deeper uses the
// see-through view. The default perspective camera faces the left hemisphere.
export function mapView(steps){
  if(!steps.length)return {mode:'surface',view:'perspective'};
  const mode=steps.every(step=>step.lateralCortex)?'surface':'deep';
  const sides=new Set(steps.map(step=>step.side));
  const only=sides.size===1?[...sides][0]:'';
  return {mode,view:only==='R'?'right':only==='L'&&mode==='surface'?'left':'perspective'};
}

// Everything a stop says, in reading order; the text version and the play timing use it.
export function stepText(step){
  return [step.plainName,step.scientificName,step.sideText,...step.answers.flatMap(a=>[a.title,a.text]),step.lead,
    ...step.studies.flatMap(s=>[s.finding,s.label,s.type,s.sample]),step.meaning].filter(Boolean).join(' ');
}
// Time on each stop while playing: about 4.5 words a second, between 10 and 24 seconds.
export function stepDwellMs(step){
  const words=stepText(step).split(/\s+/).filter(Boolean).length;
  return Math.round(Math.min(24000,Math.max(10000,words*220)));
}
