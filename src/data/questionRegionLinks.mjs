import {REGION_STUDIES} from './regionStudies.mjs';
// All 28 items are reviewed, including deliberate gaps. No fallback brain map.
const linked=(status,studies,note,guide=studies)=>({status,studies,note,guide});
const gap=note=>({status:'unmapped',studies:[],guide:[],note});
export const QUESTION_RESEARCH={
  physical_assault:linked('related',['familyThreat','puetz','enigma2026'],'Family-violence and broader abuse samples are relevant, but do not isolate this one question.',['familyThreat']),
  threatened_harm:linked('related',['familyThreat'],'Threat-only experience was not isolated in this family-violence study.'),
  verbal_harm:linked('domain',['verbalAuditory'],'This study examined parental verbal aggression; the question also permits other adults. The left auditory-association location is more specific than “temporal lobe.”'),
  emotional_neglect:linked('domain',['neglectReward','puetz','enigma2026'],'Emotional neglect has specific reward-response research. Broader neglect findings and mixed exposures are shown separately.',['neglectReward']),
  material_needs:linked('related',['materialContext'],'Income-based poverty research is not a direct measure of food, clothing or the cause of unmet needs.',[]),
  medical_neglect:gap('No reviewed study here isolates repeated failure to obtain care from illness, financial access and other circumstances. A specific region is not assigned.'),
  supervision_neglect:linked('related',['deprivationWhiteMatter'],'Institutional deprivation is much broader than this supervision item. Read it as related context, not a one-to-one mapping.',[]),
  household_alcohol:gap('The household-alcohol domain is not the same as prenatal alcohol exposure, the respondent’s own alcohol use or inherited familial risk. These cannot be substituted to assign a region.'),
  household_drugs:gap('Drug type, prenatal exposure, caregiving and the respondent’s own use are different exposures. This item alone does not specify a brain-study match.'),
  household_incarceration:gap('The reviewed incarceration sources describe health and behavioral outcomes, not an isolated regional brain effect. An important experience can remain unmapped.'),
  household_mental_health:gap('A household member’s mental health, the care environment and familial risk are distinct. A diagnosis in someone else does not assign a brain effect to the respondent.'),
  household_suicide_attempt:gap('A household suicide attempt has its own meaning and context. The selected sources do not justify an isolated region assignment from this Yes/No item.'),
  caregiver_separation:gap('Separation or divorce is not equivalent to severe institutional deprivation, bereavement or abuse; those imaging findings are not transferred to this item.'),
  witnessed_violence:linked('domain',['witnessedVisual','familyThreat'],'The visual study required visually witnessed interparental violence. The separate family-violence fMRI study measures threat response, not cortical thickness.'),
  peer_emotional:linked('domain',['peerStriatum'],'The source measured broader repeated peer victimization, not a uniquely emotional-bullying neural signature.'),
  peer_physical:linked('domain',['peerStriatum'],'The source measured broader peer victimization. It does not establish a separate physical-bullying effect or an additional effect to add to emotional bullying.'),
  sexual_boundary:linked('domain',['sexualSomatic','puetz'],'The specific sensory finding came from adult women and a much more detailed abuse measure; other samples may differ.',['sexualSomatic']),
  discrimination:linked('related',['discriminationNetwork'],'The study concerns racial discrimination. This broader identity-discrimination question must not be treated as proof of that narrower exposure.',[]),
  medical_trauma:gap('Serious illness, painful treatment and perceived medical threat differ biologically. No particular illness or neurological injury is assumed from this question.'),
  caregiver_death:gap('Bereavement, prolonged grief, caregiver disruption and depression are not interchangeable. No reviewed study here supports assigning a regional change to every bereaved child.'),
  disaster:gap('Disaster studies often involve particular events and selected symptomatic samples. A generic exposure answer is not enough to infer PTSD-related brain findings.'),
  prenatal_depression:linked('related',['prenatalDepression'],'Measured prenatal depression and neonatal diffusion findings are shown as separate research context. The reported history does not activate a personal brain prediction.',[]),
  prenatal_alcohol:linked('related',['prenatalAlcohol'],'The source studied heavy prenatal exposure. A Yes without dose or verified details cannot inherit that group’s brain-development findings; this is context only.',[]),
  safe_adult:linked('related',['supportHippocampus','development2025'],'Observed maternal support and parental acceptance are related to, but narrower than, any dependable adult. These support studies do not cancel adversity or estimate growth.',[]),
  close_friend:gap('Friendship is an endorsed support, not a biomarker of a particular brain region. The population support study does not provide an individual neural estimate.'),
  belonging:gap('Different sources of belonging should not be collapsed into a single regional neural effect. Keep this as a self-reported support.'),
  competence:gap('A skill or feeling of competence does not identify a neural superpower or larger brain structure. This remains an explicit personal-strength reflection.'),
  routine:gap('Predictable routines may feel helpful; this item is not a sleep, stress-hormone or hypothalamus assessment.'),
};
export function researchForQuestion(id){
  const item=QUESTION_RESEARCH[id];
  if(!item)throw new Error(`Question has no reviewed research disposition: ${id}`);
  return item;
}
export function guideRegions(id){
  return [...new Set(researchForQuestion(id).guide.flatMap(key=>REGION_STUDIES[key].regions.map(r=>r.id)))];
}
export function studyIdsForQuestions(questions){
  return [...new Set(questions.flatMap(q=>researchForQuestion(q.id).studies))];
}
export const RESEARCH_LABELS={domain:'Domain study',related:'Related evidence',unmapped:'No specific region assigned'};
