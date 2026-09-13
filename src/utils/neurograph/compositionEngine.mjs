import {HERO_COMPOSITIONS} from '../../data/neurohero/compositions.mjs';
import {normalizeHeroAnswers,processStatus} from '../neurohero/engine.mjs';
import {OBSERVATION_NODES,NODE_BY_ID} from '../../data/neurograph/model.mjs';
import {observationFit,compositionSupport,compareSupport} from './confidenceEngine.mjs';
import {classifyPair,hypothesisSpace} from './graphEngine.mjs';
const usable=status=>status==='recognized'||status==='qualified';
export function observationState(raw={}){
 const answers=normalizeHeroAnswers(raw);
 return OBSERVATION_NODES.map(node=>{const answer=answers[node.id]||{},status=processStatus(answer),fit=observationFit(answer);return {...node,answer,status,...fit,active:usable(status)};});
}
export function namedCompositions(states){
 const byId=Object.fromEntries(states.map(s=>[s.id,s]));
 return HERO_COMPOSITIONS.map((rule,index)=>{
  const parts=rule.requires.map(id=>byId[id]).filter(Boolean),eligible=parts.length===rule.requires.length&&parts.every(p=>p.active);
  if(!eligible)return null;
  const evidenceIds=[...new Set([...rule.evidence,...parts.flatMap(p=>p.evidence||[])])];
  const counterCoverage=parts.filter(p=>p.counterReviewed).length/parts.length;
  const support=compositionSupport({componentFits:parts.map(p=>p.fit),evidenceIds,interactionClass:'named_convergent',counterCoverage});
  return {...rule,index,parts,evidenceIds,...support,claimClass:'editorial-composition-hypothesis'};
 }).filter(Boolean).sort(compareSupport);
}

export function pairCompositions(states,limit=24){
 const active=states.filter(s=>s.active),byId=Object.fromEntries(active.map(s=>[s.id,s])),pairs=[];
 for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){const pair=classifyPair(active[i].id,active[j].id);if(!pair)continue;const parts=pair.components.map(id=>byId[id]),coverage=parts.filter(p=>p.counterReviewed).length/2;const support=compositionSupport({componentFits:parts.map(p=>p.fit),evidenceIds:pair.evidenceIds,interactionClass:pair.interactionClass,counterCoverage:coverage});pairs.push({...pair,label:pair.operator?.label||parts.map(p=>p.label).join(' x '),parts,...support,claimClass:pair.operator?'system-interaction-hypothesis':'pairwise-potentiality'});}
 return pairs.sort(compareSupport).slice(0,limit);
}
export function systemProfile(states){
 const groups={};
 for(const item of states.filter(s=>s.active))(groups[item.systemId]??=[]).push(item);
 return Object.entries(groups).map(([systemId,items])=>({systemId,label:NODE_BY_ID[systemId]?.name||systemId,breadth:items.length,maxFit:Math.max(...items.map(x=>x.fit)),meanFit:items.reduce((a,b)=>a+b.fit,0)/items.length,observations:items.map(x=>x.id)})).sort((a,b)=>b.maxFit-a.maxFit||b.breadth-a.breadth);
}
export function buildNeurocompositionProfile(raw={},preferredId=''){
 const states=observationState(raw),active=states.filter(x=>x.active),named=namedCompositions(states),pairs=pairCompositions(states),selected=named.find(x=>x.id===preferredId)||named[0]||null;
 return {version:'cc-neurograph-profile-1.0',observations:states,active,systems:systemProfile(states),namedCompositions:named,pairPotentialities:pairs,selected,hypothesisSpace:hypothesisSpace(active.length),neuralStatus:'not-measured',limits:'Support indices rank transparent functional hypotheses from self-report and source relevance. They are not probabilities, diagnoses, biomarkers, structural findings, or estimates of future performance.'};
}
