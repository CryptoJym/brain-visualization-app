import {HERO_EVIDENCE} from '../neurohero/evidence.mjs';
import {DEVELOPMENT_STUDIES} from '../developmentEvidence.mjs';
const normalizeHero=s=>({id:s.id,label:s.label,doi:s.doi,url:s.url,kind:s.kind,finding:s.claim,limit:s.boundary,source:'hero-registry'});
const normalizeDevelopment=s=>({id:s.id,label:s.label,doi:s.doi,url:s.url,kind:s.kind,finding:s.finding,limit:s.limit,source:'development-registry'});
export const FRAMEWORK_EVIDENCE=[
 {id:'rdoc2026',label:'NIMH Research Domain Criteria matrix',url:'https://www.nimh.nih.gov/research/research-funded-by-nimh/rdoc/constructs/rdoc-matrix',kind:'measurement framework',finding:'Functional constructs can be studied across circuits, physiology, behavior and self-report, with developmental and environmental context.',limit:'RDoC is a research framework, not an individual diagnostic or hero-typing instrument.',source:'framework'},
 {id:'dmn2023',label:'Menon (2023), 20 years of the default mode network',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10524518/',kind:'network neuroscience review',finding:'Cognition reflects dynamic interactions among default-mode, salience and frontoparietal control networks rather than isolated regions.',limit:'Network-level models do not support reverse-inference of an individual trait from questionnaire answers.',source:'framework'},
 {id:'flournoy2024',label:'Flournoy et al. (2024)',doi:'10.1016/j.neuroimage.2023.120503',url:'https://pubmed.ncbi.nlm.nih.gov/38141745/',kind:'precision task-fMRI reliability',finding:'Individual neural response estimates depend on reliability and within-person variability.',limit:'A single task activation estimate can be unstable and should not be treated as a fixed personal neural trait.',source:'methods'},
 {id:'demidenko2024',label:'Demidenko, Mumford & Poldrack (2024)',doi:'10.1162/imag_a_00262',url:'https://pubmed.ncbi.nlm.nih.gov/40800476/',kind:'fMRI multiverse reliability',finding:'Analytic choices altered reliability; higher reliability could trade off against interpretability.',limit:'Imaging pipelines and contrasts matter; no questionnaire can substitute for direct reliable measurement.',source:'methods'},
 {id:'measurement2024',label:'Measurement noise limits brain-behavior prediction (2024)',url:'https://www.nature.com/articles/s41467-024-54022-6',kind:'prediction/reliability methods',finding:'Measurement reliability places an upper bound on out-of-sample brain-behavior prediction.',limit:'Cortex Compass support indices are ranking aids, not probabilities or biomarkers.',source:'methods'}
];
const all=[...HERO_EVIDENCE.map(normalizeHero),...DEVELOPMENT_STUDIES.map(normalizeDevelopment),...FRAMEWORK_EVIDENCE];
export const EVIDENCE_RECORDS=[...new Map(all.map(s=>[s.id,s])).values()];
export const EVIDENCE_BY_ID=Object.fromEntries(EVIDENCE_RECORDS.map(s=>[s.id,s]));
export function evidenceTier(record){
 const kind=(record?.kind||'').toLowerCase();
 if(/meta-analysis|umbrella|mega-analysis/.test(kind))return {tier:'A',weight:.88};
 if(/longitudinal|three-wave|three-session|prospective/.test(kind))return {tier:'A-',weight:.82};
 if(/review|framework/.test(kind))return {tier:'B+',weight:.74};
 if(/fMRI|structural MRI|connectivity|behavioral|task/.test(kind))return {tier:'B',weight:.70};
 if(/methods|reliability|prediction/.test(kind))return {tier:'B',weight:.68};
 return {tier:'B-',weight:.62};
}
export const EVIDENCE_QUALITY=Object.fromEntries(EVIDENCE_RECORDS.map(s=>[s.id,evidenceTier(s)]));
