import {buildNeurocompositionProfile} from './compositionEngine.mjs';
import {environmentContext} from './environmentEngine.mjs';
import {explainComposition} from './explanationEngine.mjs';
import {validateGraph} from './graphEngine.mjs';
export function buildDeepNeurograph(heroAnswers={},insightAnswers={},preferredId=''){
 const profile=buildNeurocompositionProfile(heroAnswers,preferredId),environment=environmentContext(insightAnswers);
 const selectedExplanation=explainComposition(profile.selected,environment);
 const pairExplanations=profile.pairPotentialities.slice(0,8).map(x=>explainComposition(x,environment));
 return {...profile,environment,selectedExplanation,pairExplanations,graph:validateGraph()};
}
