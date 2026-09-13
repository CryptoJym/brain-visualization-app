// Developmental context is reported, not estimated from ages or identity.
export const DEVELOPMENT_VERSION='cc-development-1.0';
export const CONTEXT_VERSION='cc-context-2.1';
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
 {id:'sexAssigned',label:'What is your biological sex, as recorded at birth?',help:'Select Male or Female to continue. This answer does not measure hormones or brain structure.',required:true,choices:[['male','Male'],['female','Female']]},
 {id:'sexTraits',label:'Has a variation in sex development been noted in your medical history?',help:'Optional medical context. No diagnosis or details are requested. This can limit how well a study population represents your circumstances.',choices:[['yes','Yes'],['no','No'],['unknown','Not sure'],['skip','Prefer not to answer']]},
 {id:'hormonalContext',label:'Could a condition or treatment have affected puberty or hormones during the experiences you are describing?',help:'Historical biological context only. No medication names, doses or test results are requested.',choices:[['yes','Yes'],['no','No'],['unknown','Not sure'],['skip','Prefer not to answer']]},
];
// Retired questions are retained only to preserve earlier saves and backups. No new UI collects them.
export const RETIRED_CONTEXT_CHOICES={
 genderIdentity:['woman','man','nonbinary','another','questioning','skip'],
 genderedExperience:['yes','no','unknown','skip'],genderSupport:['yes','no','unknown','skip'],
 legacySexAssigned:['another','unknown','skip'],
};
export const SUPPORTED_CONTEXT_VERSIONS=['cc-context-1.0','cc-context-2.0',CONTEXT_VERSION];
