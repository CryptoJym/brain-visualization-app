// Developmental context is reported, not estimated from ages or identity.
export const DEVELOPMENT_VERSION='cc-development-1.0';
export const CONTEXT_VERSION='cc-context-1.0';
export const DEVELOPMENT_STAGES=[
 {id:'foundational',label:'Infancy / early caregiver-dependent development',detail:'Early development recalled through family accounts or records, rather than an assigned age band.'},
 {id:'prepubertal',label:'Childhood before pubertal changes',detail:'Before the physical changes of puberty had begun for you.'},
 {id:'pubertal_transition',label:'Early or middle pubertal transition',detail:'Pubertal changes were beginning or actively progressing; no Tanner score is inferred.'},
 {id:'later_puberty',label:'Later pubertal transition',detail:'Pubertal changes were further along, based on what you know from that time.'},
 {id:'after_puberty',label:'After pubertal changes',detail:'Pubertal changes were largely complete. This does not mean every brain system had finished maturing.'},
];
export const DEVELOPMENT_SOURCES=[['memory','My recollection'],['family','Family or caregiver account'],['record','A record from that time'],['mixed','More than one source'],['unknown','Source uncertain']];
export const RESPONSE_CONTEXT=[['alert','More alert / scanning for changes'],['overwhelmed','Overwhelmed / strong reactions'],['withdrawn','Withdrawing / feeling shut down'],['variable','Different responses in different situations'],['no_pattern','No consistent pattern noticed'],['other','Another response'],['unknown','Not sure'],['skip','Prefer not to answer']];
export const SUPPORT_CONTEXT=[['yes','Support was available'],['no','Support was not available'],['unknown','Not sure'],['skip','Prefer not to answer']];
export const MEASUREMENT_CONTEXT=[['none','No relevant assessment that I know of'],['pubertal_record','An existing pubertal-development assessment'],['hormone_record','An existing hormone measurement'],['brain_record','An existing brain-imaging/development record'],['unknown','Not sure'],['skip','Prefer not to answer']];
export const CONTEXT_QUESTIONS=[
 {id:'sexAssigned',label:'What sex was recorded or assigned at birth?',help:'Optional context for studies using this variable. It does not establish chromosomes, hormones, brain structure, or gender.',choices:[['female','Female'],['male','Male'],['another','Another designation / not listed'],['unknown','Not sure'],['skip','Prefer not to answer']]},
 {id:'genderIdentity',label:'How do you describe your gender now?',help:'Recorded separately from sex at birth. Never used to infer your hormones, anatomy, abilities, or historical gender.',choices:[['woman','Woman'],['man','Man'],['nonbinary','Nonbinary / gender diverse'],['another','Another identity / not listed'],['questioning','Questioning / unsure'],['skip','Prefer not to answer']]},
 {id:'sexTraits',label:'Do you report an intersex variation or another variation in sex characteristics?',help:'Optional; no medical details are requested. A Yes flags limits in the binary-group research coverage.',choices:[['yes','Yes'],['no','No'],['unknown','Not sure'],['skip','Prefer not to answer']]},
 {id:'hormonalContext',label:'Could a condition or treatment have affected puberty or hormones during the experiences you are describing?',help:'No diagnosis, medication name or dose is needed. This is historical context, not a question about current treatment.',choices:[['yes','Yes'],['no','No'],['unknown','Not sure'],['skip','Prefer not to answer']]},
 {id:'genderedExperience',label:'Did gender expectations, expression, or how others perceived your gender shape those experiences?',help:'This records your social experience directly; it is not inferred from your current identity.',choices:[['yes','Yes'],['no','No'],['unknown','Not sure'],['skip','Prefer not to answer']]},
 {id:'genderSupport',label:'Did acceptance of your gender or expression provide support during that period?',help:'A reported protective context, not a percentage reduction in adversity or a neural estimate.',choices:[['yes','Yes'],['no','No'],['unknown','Not sure'],['skip','Prefer not to answer']]},
];
