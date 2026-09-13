import {EVIDENCE_BY_ID,EVIDENCE_QUALITY} from '../../data/neurograph/evidenceRegistry.mjs';
import {SYSTEM_BY_ID} from '../../data/neurograph/systems.mjs';
export function explainComposition(composition,environment=null){
 if(!composition)return null;
 const observations=(composition.parts||[]).map(p=>({id:p.id,label:p.label,response:p.answer?.value||'unanswered',counterexample:p.answer?.counter||'unreviewed',fit:Number((p.fit||0).toFixed(3)),system:SYSTEM_BY_ID[p.systemId]?.name||p.systemId}));
 const research=(composition.evidenceIds||[]).map(id=>EVIDENCE_BY_ID[id]).filter(Boolean).map(source=>({id:source.id,label:source.label,kind:source.kind,finding:source.finding,limit:source.limit,quality:EVIDENCE_QUALITY[source.id]||null,url:source.url}));
 const relevantResources=(environment?.resources||[]).filter(r=>observations.some(o=>r.systems.includes((composition.parts||[]).find(p=>p.id===o.id)?.systemId)));
 const relevantFrictions=(environment?.frictions||[]).filter(r=>observations.some(o=>r.systems.includes((composition.parts||[]).find(p=>p.id===o.id)?.systemId)));
 return {observation:observations,research,hypothesis:{label:composition.label||composition.name,claimClass:composition.claimClass||composition.status,capability:composition.power||composition.operator?.capability||null,tradeoff:composition.cost||composition.operator?.tradeoff||null,conditions:composition.conditions||composition.operator?.conditions||null,supportIndex:composition.supportIndex,supportLabel:composition.supportLabel||null},context:{resources:relevantResources,frictions:relevantFrictions},unknown:['No direct neural measurement was collected.','No performance test establishes the proposed capability.','The support index is a transparent ranking aid, not a probability or effect size.']};
}
