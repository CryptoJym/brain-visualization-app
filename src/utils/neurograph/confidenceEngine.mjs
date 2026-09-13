import {EVIDENCE_QUALITY} from '../../data/neurograph/evidenceRegistry.mjs';
export const CALIBRATION_VERSION='cc-neurograph-calibration-1.0';
export const RESPONSE_WEIGHT={often:1,sometimes:.72,rarely:.15,unsure:0,skip:0};
export const COUNTER_WEIGHT={rarely:1,sometimes:.72,often:.28,unsure:.58,skip:.58,missing:.58};
const clamp=n=>Math.max(0,Math.min(1,n));
export function observationFit(answer={}){
 const response=RESPONSE_WEIGHT[answer.value]??0,counter=COUNTER_WEIGHT[answer.counter]??COUNTER_WEIGHT.missing;
 return {response,counter,fit:clamp(response*counter),counterReviewed:['often','sometimes','rarely'].includes(answer.counter)};
}
export function geometricMean(values,weights=values.map(()=>1)){
 if(!values.length||values.some(v=>v<=0))return 0;
 const total=weights.reduce((a,b)=>a+b,0);return Math.exp(values.reduce((sum,v,i)=>sum+weights[i]*Math.log(clamp(v)),0)/total);
}
export function evidenceStrength(ids=[]){
 const weights=[...new Set(ids)].map(id=>EVIDENCE_QUALITY[id]?.weight).filter(Number.isFinite).sort((a,b)=>b-a);
 if(!weights.length)return {score:.35,tier:'unlinked',sources:0};
 const score=clamp(weights[0]+Math.min(.10,Math.max(0,weights.length-1)*.025));
 return {score,tier:score>=.86?'strong':score>=.76?'moderate-strong':score>=.66?'moderate':'limited',sources:weights.length};
}

export const INTERACTION_WEIGHT={direct_joint:.9,named_convergent:.79,shared_source:.73,cross_system:.62,component_only:.55,editorial:.43};
export function compositionSupport(input={}){
 const fits=input.componentFits||[],interaction=INTERACTION_WEIGHT[input.interactionClass]??INTERACTION_WEIGHT.editorial;
 const evidence=evidenceStrength(input.evidenceIds||[]),coverage=Math.max(0,Math.min(1,input.counterCoverage||0));
 const fit=geometricMean(fits),complete=.82+.18*coverage;
 const value=Math.max(0,Math.min(1,geometricMean([Math.max(fit,.001),evidence.score,interaction],[.5,.3,.2])*complete));
 let label='exploratory-composition';if(value>=.82&&interaction>=.73)label='reported-functional-fit';else if(value>=.68)label='supported-candidate';else if(value>=.54)label='plausible-candidate';
 return {supportIndex:Number(value.toFixed(3)),supportLabel:label,observationFit:Number(fit.toFixed(3)),evidenceStrength:Number(evidence.score.toFixed(3)),evidenceTier:evidence.tier,evidenceSources:evidence.sources,interactionSupport:interaction,counterexampleCoverage:Number(coverage.toFixed(3)),neuralStatus:'not-measured',probability:false};
}
export const compareSupport=(a,b)=>b.supportIndex-a.supportIndex||b.observationFit-a.observationFit||b.evidenceStrength-a.evidenceStrength;
