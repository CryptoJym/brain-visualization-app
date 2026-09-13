const p=(id,name,system,{anchor=null,description='',asset='',overextension='',evidence=[]}={})=>({id,name,system,assessable:!!anchor,anchor,description,asset,overextension,evidence});
export const NEURO_PROCESSES=[
 p('signal_detection','Signal detection','salience_relevance',{anchor:'signal_detection',description:'Notice potentially relevant changes before their meaning is settled.',asset:'early noticing',overextension:'false positives or input overload',evidence:['pollak2002']}),
 p('threat_discrimination','Threat discrimination','threat_safety',{anchor:'threat_discrimination',description:'Differentiate a specific concern from undifferentiated danger.',asset:'specific risk identification',overextension:'persistent scanning',evidence:['pollak2002','puetz2020']}),
 p('safety_discrimination','Safety discrimination','threat_safety',{anchor:'safety_discrimination',description:'Register evidence that permits vigilance to decrease.',asset:'calibrated caution',overextension:'difficulty downshifting',evidence:['gee2013','gunnar2019']}),
 p('contextual_memory','Contextual memory','context_memory',{anchor:'contextual_memory',description:'Retain where, when and under what conditions events occurred.',asset:'context preservation',overextension:'detail-heavy rumination',evidence:['young2022']}),
 p('social_memory','Social memory','context_memory',{anchor:'social_memory',description:'Retain interpersonal details useful for later navigation.',asset:'relationship continuity',overextension:'social memory load',evidence:['paone2026']}),
 p('working_context','Context-rich working memory','working_memory',{anchor:'working_context',description:'Maintain several relevant elements while operating on a meaningful problem.',asset:'active integration',overextension:'context dependence under abstraction',evidence:['young2022','paone2026']}),
 p('sustained_attention','Sustained attention','selective_attention',{anchor:'sustained_attention',description:'Maintain useful focus on a bounded target.',asset:'deep concentration',overextension:'tunnel vision or costly transitions',evidence:['perevoznikova2025']}),
];
// continuation marker
NEURO_PROCESSES.push(
 p('attention_switching','Attention switching','selective_attention',{anchor:'attention_switching',description:'Deliberately reorient when another target becomes more important.',asset:'adaptive reorientation',overextension:'fragmentation',evidence:['rahapsari2025']}),
 p('inhibitory_pause','Inhibitory pause','cognitive_control',{anchor:'inhibitory_pause',description:'Create time between detecting a signal and acting.',asset:'deliberate response selection',overextension:'hesitation when overapplied',evidence:['rahapsari2025','hofels2026']})
);
NEURO_PROCESSES.push(
 p('cognitive_flexibility','Cognitive flexibility','cognitive_control',{anchor:'cognitive_flexibility',description:'Revise strategy when evidence or constraints change.',asset:'adaptive problem solving',overextension:'constant replanning',evidence:['rahapsari2025','perevoznikova2025']}),
 p('uncertainty_updating','Uncertainty updating','learning_prediction',{anchor:'uncertainty_updating',description:'Hold competing explanations while gathering evidence.',asset:'hypothesis testing',overextension:'decision delay',evidence:['puetz2020']}),
 p('reward_learning','Reward learning','reward_motivation',{anchor:'reward_learning',description:'Learn which actions and environments produce useful outcomes.',asset:'opportunity learning',overextension:'motivation variability',evidence:['vaidya2024']}),
 p('error_monitoring','Error monitoring','cognitive_control',{anchor:'error_monitoring',description:'Detect mismatch between expectation and outcome.',asset:'quality control',overextension:'repeated checking',evidence:['hofels2026']}),
 p('interoception','Interoceptive awareness','interoception_homeostasis',{anchor:'interoception',description:'Notice internal state signals relevant to energy and needs.',asset:'early internal-state detection',overextension:'signal ambiguity or overload',evidence:['ibanez2017']})
);
NEURO_PROCESSES.push(
 p('arousal_recovery','Arousal recovery','arousal_recovery',{anchor:'arousal_recovery',description:'Return toward a usable range after demand.',asset:'recovery knowledge',overextension:'long recovery tail',evidence:['gunnar2019']}),
 p('emotion_labeling','Emotion labeling','emotion_regulation',{anchor:'emotion_labeling',description:'Differentiate affective states enough to guide action.',asset:'affect differentiation',overextension:'mixed or intense feelings',evidence:['ibanez2017','church2025']})
);
