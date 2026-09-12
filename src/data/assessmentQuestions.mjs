import {guideRegions,researchForQuestion} from './questionRegionLinks.mjs';
export const QUESTIONNAIRE_VERSION='cc-reflection-5.0';
const maltreatment='Adapted maltreatment-domain prompt; not the validated MACE scale.';
const context='Context only: no region-specific inference is assigned.';
function q(id,title,text,sources,extra={}) {
  const research=researchForQuestion(id);
  return {id,title,text,sources,kind:'history',basis:context,...extra,topics:guideRegions(id),research};
}
export const SECTIONS=[
  {id:'care',title:'Safety & care',icon:'⌂',subtitle:'Separate experiences of harm, threat and unmet needs. Think about the period before your 18th birthday.',questions:[
    q('physical_assault','Physical harm','Did an adult deliberately physically hurt you?',['mace','brfss'],{basis:maltreatment,topics:['amygdala','hippocampus']}),
    q('threatened_harm','Threats of harm','Did an adult repeatedly threaten to physically hurt you?',['mace'],{basis:maltreatment,topics:['amygdala'],help:'This is separate from physical harm that actually occurred.'}),
    q('verbal_harm','Verbal mistreatment','Did an adult repeatedly insult or humiliate you?',['mace','brfss'],{basis:maltreatment,topics:['temporal','acc']}),
    q('emotional_neglect','Emotional support','Did you often feel unseen, unloved, unsupported, or emotionally alone?',['mace'],{basis:maltreatment,topics:['dlpfc','acc']}),
    q('material_needs','Basic material needs','Were basic needs such as enough food or suitable clothing often unmet?',['mace'],{basis:maltreatment,help:'This records unmet needs without assuming their cause or blaming your family.'}),
    q('medical_neglect','Access to needed care','Was medical care you needed repeatedly not obtained?',['mace'],{basis:'Separate care-access prompt within a broad neglect domain; no dedicated neural effect is assumed.'}),
    q('supervision_neglect','Safe supervision','Were you repeatedly left without safe, age-appropriate care or supervision?',['mace'],{basis:maltreatment}),
  ]},
  {id:'household',title:'Household experiences',icon:'◇',subtitle:'Alcohol, other drugs, incarceration and mental health are distinct questions. One answer does not imply another.',questions:[
    q('household_alcohol','Household alcohol problems','Did someone you lived with have persistent problems with alcohol?',['brfss','anda'],{help:'After birth only. This does not imply you were exposed to alcohol during pregnancy.'}),
    q('household_drugs','Household drug use','Did someone you lived with use illicit drugs or misuse prescription medication?',['brfss'],{help:'Alcohol is asked separately. Taking medication as prescribed is not misuse.'}),
    q('household_incarceration','Household incarceration','Did someone in your household spend time in jail, prison or another correctional facility?',['brfss','turney','wildeman'],{help:'This stays separate from alcohol, drugs and family conflict. Incarceration does not itself establish abuse or brain impairment.'}),
    q('household_mental_health','Household mental health','Did someone you lived with experience significant ongoing mental health difficulties?',['brfss'],{help:'This describes household context, not whether that person was unsafe.'}),
    q('household_suicide_attempt','Suicide attempt in the household','Did someone you lived with attempt suicide?',['brfss','mace'],{help:'This is asked separately from other mental health difficulties. You can skip it without explanation.'}),
    q('caregiver_separation','Caregiver separation','Did your parents or primary caregivers separate or divorce?',['brfss'],{help:'Separation is not automatically harmful. A caregiver’s death is asked separately.'}),
    q('witnessed_violence','Witnessed caregiver violence','Did you witness physical violence between adults who cared for you?',['mace','brfss'],{basis:maltreatment,topics:['amygdala','insula']}),
  ]},
  {id:'peers',title:'Peers & boundaries',icon:'◎',subtitle:'Keep peer emotional mistreatment, physical bullying and sexual experiences separate.',questions:[
    q('peer_emotional','Peer emotional mistreatment','Were peers repeatedly cruel to you through insults, humiliation or deliberate exclusion?',['mace'],{basis:maltreatment,help:'This is separate from physical bullying.'}),
    q('peer_physical','Peer physical bullying','Did peers repeatedly physically hurt or intimidate you?',['mace'],{basis:maltreatment}),
    q('sexual_boundary','Sexual boundaries','Were you subjected to unwanted sexual contact or sexual coercion?',['mace','brfss'],{basis:maltreatment,topics:['hippocampus','insula'],help:'No description or identifying details are needed.'}),
    q('discrimination','Identity-based mistreatment','Did you repeatedly experience discrimination because of an aspect of your identity?',[],{basis:'Personal context prompt, not a scored or validated item in this app.'}),
  ]},
  {id:'health',title:'Health & early context',icon:'✚',subtitle:'Other events and optional information about pregnancy. Pregnancy is a separate developmental context, not a post-birth age band.',questions:[
    q('medical_trauma','Medical experiences','Did a serious illness or medical treatment feel frightening or overwhelming?',[],{basis:'Personal context only; no specific brain change is inferred.'}),
    q('caregiver_death','Caregiver death','Did a parent or primary caregiver die before you turned 18?',[],{basis:'Personal context only; separate from separation or divorce.'}),
    q('disaster','Disaster exposure','Did you experience a natural disaster that seriously threatened your safety?',[],{basis:'Personal context only; not combined with assault or illness.'}),
    q('prenatal_depression','Before birth: reported depression','Have family accounts or records indicated that your birth parent experienced significant depression while pregnant with you?',['prenatalDepression'],{kind:'prenatal',help:'Do not guess or try to remember being in the womb. This is reported pregnancy context, not a diagnosis of you or your birth parent.'}),
    q('prenatal_alcohol','Before birth: reported alcohol exposure','Have family accounts or records indicated alcohol use by your birth parent during that pregnancy?',['prenatalAlcohol'],{kind:'prenatal',help:'Separate from living with someone who had alcohol problems after birth. Amounts may be unknown; this does not establish fetal alcohol spectrum disorder.'}),
  ]},
  {id:'protective',title:'Supports & strengths',icon:'✦',subtitle:'What helped you. Supports are recorded separately, not subtracted from earlier experiences.',questions:[
    q('safe_adult','Dependable adult','Was there at least one dependable adult who made you feel safe and valued?',['protective'],{kind:'support',basis:'Adapted support reflection, not an official positive-childhood-experiences score.'}),
    q('close_friend','Trusted friendship','Did you have at least one trusted friend or peer connection?',['protective'],{kind:'support',basis:'Adapted support reflection.'}),
    q('belonging','Belonging','Did school, community, culture, faith, sport, or another group give you belonging?',['protective'],{kind:'support',basis:'Adapted support reflection.'}),
    q('competence','Feeling capable','Did you have skills, interests, or achievements that made you feel capable?',[],{kind:'support',basis:'Personal strength reflection. No specific superpower is inferred.'}),
    q('routine','Grounding routines','Did predictable routines, traditions, or stable spaces help you feel grounded?',[],{kind:'support',basis:'Personal support reflection; no numerical protective effect is assumed.'}),
  ]},
];
export const ALL_QUESTIONS=SECTIONS.flatMap(s=>s.questions.map(item=>({...item,section:s.id})));
export const FREQUENCIES=[['once','Once'],['sometimes','A few times'],['often','Repeatedly'],['chronic','Ongoing over a period'],['unknown','Not sure']];
export const ANSWER_CHOICES=[['yes','Yes'],['no','No'],['unsure','Not sure'],['skip','Prefer not to answer']];
