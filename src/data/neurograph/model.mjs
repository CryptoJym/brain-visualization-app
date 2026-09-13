import {HERO_PROCESSES} from '../neurohero/processes.mjs';
import {HERO_COMPOSITIONS} from '../neurohero/compositions.mjs';
import {NEURO_SYSTEMS,SYSTEM_BY_ID,NEUROGRAPH_VERSION} from './systems.mjs';
export {NEUROGRAPH_VERSION};
export const DOMAIN_TO_SYSTEM={
 salience:'salience_relevance',regulation:'arousal_regulation',memory:'context_memory',executive:'cognitive_control',
 attention:'selective_attention',learning:'learning_prediction',interoception:'interoception_homeostasis',social:'social_modeling',
 creativity:'creative_integration',integration:'creative_integration',agency:'agency_action',support:'support_coregulation'
};
export const OBSERVATION_NODES=HERO_PROCESSES.map(p=>({
 id:p.id,label:p.title,nodeType:'observation',systemId:DOMAIN_TO_SYSTEM[p.domain]||'cognitive_control',
 description:p.question,assets:p.assets,frictions:p.frictions,evidence:p.evidence,measurement:'present-day self-report'
}));
export const CONSTRUCT_NODES=NEURO_SYSTEMS.flatMap(s=>s.constructs.map((name,index)=>({id:`${s.id}__${index+1}`,label:name,nodeType:'construct',systemId:s.id,measurement:'research construct only'})));
export const COMPOSITION_NODES=HERO_COMPOSITIONS.map(c=>({id:c.id,label:c.name,nodeType:'named-composition',requires:c.requires,status:c.status,evidence:c.evidence}));
export const GRAPH_NODES=[...NEURO_SYSTEMS.map(s=>({...s,nodeType:'system'})),...CONSTRUCT_NODES,...OBSERVATION_NODES,...COMPOSITION_NODES];
export const NODE_BY_ID=Object.fromEntries(GRAPH_NODES.map(n=>[n.id,n]));
