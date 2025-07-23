import React, { useState } from 'react';

const NeurologicalNarrativeResults = ({ assessmentResults }) => {
  const [activeView, setActiveView] = useState('narrative');
  
  // Research paper links database
  const researchLinks = {
    'van Harmelen et al. (2010)': 'https://doi.org/10.1016/j.biopsych.2010.06.011',
    'Dannlowski et al. (2012)': 'https://doi.org/10.1016/j.biopsych.2012.06.002',
    'Edmiston et al. (2011)': 'https://doi.org/10.1016/j.jpsychires.2011.07.008',
    'Tottenham et al. (2011)': 'https://doi.org/10.1016/j.dcn.2011.06.008',
    'Hanson et al. (2010)': 'https://doi.org/10.1016/j.biopsych.2010.05.036',
    'De Brito et al. (2013)': 'https://doi.org/10.1017/S0033291712001584',
    'Woon & Hedges (2008)': 'https://doi.org/10.1097/chi.0b013e318185e703',
    'Whittle et al. (2013)': 'https://doi.org/10.1016/j.dcn.2013.10.001',
    'Anderson et al. (2002)': 'https://doi.org/10.1176/appi.ajp.159.12.2072',
    'Teicher et al. (2012)': 'https://doi.org/10.1016/j.pscychresns.2012.03.009',
    'Andersen et al. (2008)': 'https://doi.org/10.1523/JNEUROSCI.5106-07.2008',
    'Tomoda et al. (2009)': 'https://doi.org/10.1176/appi.ajp.2009.09010038',
    'Heim et al. (2013)': 'https://doi.org/10.1016/j.biopsych.2012.10.026',
    'Cohen et al. (2006)': 'https://doi.org/10.1016/j.biopsych.2005.12.020',
    'De Bellis et al. (2002)': 'https://doi.org/10.1016/S0006-3223(01)01328-0',
    'Gee et al. (2013)': 'https://doi.org/10.1073/pnas.1310163110',
    'Herringa et al. (2013)': 'https://doi.org/10.1073/pnas.1310766110',
    'McEwen et al. (2016)': 'https://doi.org/10.1038/nn.4386',
    'Teicher & Samson (2016)': 'https://doi.org/10.1176/appi.ajp.2015.15121559'
  };
  
  // Format citations with links
  const formatCitation = (citation) => {
    const link = researchLinks[citation];
    if (link) {
      return (
        <a href={link} target="_blank" rel="noopener noreferrer" 
           className="text-blue-400 hover:text-blue-300 underline">
          {citation}
        </a>
      );
    }
    return <span className="text-gray-400">{citation}</span>;
  };
  
  // Generate narrative description of regional alterations
  const generateRegionalNarrative = () => {
    const impacts = assessmentResults.brainImpacts;
    const narratives = [];
    
    // Group regions by functional systems
    const systems = {
      executive: ['Prefrontal Cortex', 'Medial Prefrontal Cortex', 'Dorsolateral Prefrontal Cortex', 'Orbitofrontal Cortex'],
      emotional: ['Amygdala', 'Limbic System', 'Insula', 'Anterior Cingulate'],
      memory: ['Hippocampus', 'Temporal Lobe', 'Superior Temporal Gyrus'],
      connectivity: ['Corpus Callosum', 'White Matter Integrity'],
      sensory: ['Visual Cortex', 'Sensory Cortex', 'Visual Association Areas'],
      regulatory: ['HPA Axis', 'Cerebellum', 'Thalamus']
    };
    
    // Executive system narrative
    const executiveImpacts = systems.executive.filter(r => impacts[r]);
    if (executiveImpacts.length > 0) {
      const avgReduction = executiveImpacts.reduce((sum, r) => 
        sum + (impacts[r].totalImpact < 0 ? Math.abs(impacts[r].totalImpact) : 0), 0) / executiveImpacts.length;
      
      if (avgReduction > 10) {
        const citations = executiveImpacts.map(r => impacts[r].sources)
          .flat()
          .map(s => s.research)
          .filter((v, i, a) => a.indexOf(v) === i); // unique citations
        
        narratives.push({
          system: 'Executive Control Architecture',
          description: `The executive control regions show substantial volumetric reductions averaging ${avgReduction.toFixed(1)}%. This architectural compromise manifests as diminished prefrontal gray matter density, particularly affecting the dorsolateral and medial sectors. The orbitofrontal cortex, crucial for value-based decision making and emotional regulation, demonstrates marked thinning. These structural alterations fundamentally impair the brain's capacity for top-down control, strategic planning, and impulse inhibition.`,
          severity: avgReduction > 15 ? 'severe' : 'moderate',
          citations: citations
        });
      }
    }
    
    // Emotional system narrative
    const emotionalImpacts = systems.emotional.filter(r => impacts[r]);
    if (emotionalImpacts.length > 0) {
      const amygdalaIncrease = impacts['Amygdala']?.totalImpact > 0 ? impacts['Amygdala'].totalImpact : 0;
      const insulaChange = impacts['Insula']?.totalImpact || 0;
      
      if (amygdalaIncrease > 0 || emotionalImpacts.length > 2) {
        const citations = emotionalImpacts.map(r => impacts[r].sources)
          .flat()
          .map(s => s.research)
          .filter((v, i, a) => a.indexOf(v) === i);
        
        narratives.push({
          system: 'Limbic-Emotional Processing Network',
          description: `The emotional processing architecture reveals a pattern of hyperactivation and structural reorganization. ${amygdalaIncrease > 0 ? `The amygdala shows ${amygdalaIncrease}% increased reactivity, creating a hypersensitive threat detection system that operates with a lowered activation threshold.` : ''} ${insulaChange !== 0 ? `The insular cortex, bridging somatic sensation with emotional awareness, exhibits ${Math.abs(insulaChange)}% ${insulaChange > 0 ? 'hyperactivation' : 'volume reduction'}, disrupting interoceptive accuracy.` : ''} This limbic hypervigilance creates a neurological state of persistent arousal, where neutral stimuli are more readily interpreted as threatening.`,
          severity: amygdalaIncrease > 15 ? 'severe' : 'moderate',
          citations: citations
        });
      }
    }
    
    // Memory system narrative
    const memoryImpacts = systems.memory.filter(r => impacts[r]);
    if (memoryImpacts.length > 0) {
      const hippocampalReduction = impacts['Hippocampus']?.totalImpact < 0 ? 
        Math.abs(impacts['Hippocampus'].totalImpact) : 0;
      
      if (hippocampalReduction > 0) {
        const citations = memoryImpacts.map(r => impacts[r].sources)
          .flat()
          .map(s => s.research)
          .filter((v, i, a) => a.indexOf(v) === i);
        
        narratives.push({
          system: 'Memory Consolidation and Contextual Processing',
          description: `The hippocampal complex demonstrates ${hippocampalReduction}% volumetric reduction, compromising the brain's capacity for contextual memory encoding and pattern separation. This structural deficit impairs the ability to distinguish between past traumatic contexts and present-moment safety, leading to overgeneralization of fear responses. The temporal lobe structures show parallel disruptions, fragmenting the integration of memory with current experience.`,
          severity: hippocampalReduction > 10 ? 'severe' : 'moderate',
          citations: citations
        });
      }
    }
    
    // Connectivity narrative
    const connectivityImpacts = systems.connectivity.filter(r => impacts[r]);
    if (connectivityImpacts.length > 0) {
      const ccReduction = impacts['Corpus Callosum']?.totalImpact < 0 ? 
        Math.abs(impacts['Corpus Callosum'].totalImpact) : 0;
      
      if (ccReduction > 0) {
        const citations = connectivityImpacts.map(r => impacts[r].sources)
          .flat()
          .map(s => s.research)
          .filter((v, i, a) => a.indexOf(v) === i);
        
        narratives.push({
          system: 'Interhemispheric Communication Pathways',
          description: `The corpus callosum shows ${ccReduction}% reduction in structural integrity, creating a fundamental disruption in interhemispheric information transfer. This white matter compromise impairs the brain's ability to integrate processing between hemispheres, leading to fragmented cognitive and emotional responses. The breakdown in cross-hemispheric coordination particularly affects emotional regulation and complex problem-solving requiring bilateral integration.`,
          severity: ccReduction > 15 ? 'severe' : 'moderate',
          citations: citations
        });
      }
    }
    
    return narratives;
  };
  
  // Generate cascade effects narrative
  const generateCascadeNarrative = () => {
    const impacts = assessmentResults.brainImpacts;
    const cascades = [];
    
    // Executive-Limbic cascade
    const pfcReduction = impacts['Prefrontal Cortex']?.totalImpact < 0 ? 
      Math.abs(impacts['Prefrontal Cortex'].totalImpact) : 0;
    const amygdalaIncrease = impacts['Amygdala']?.totalImpact > 0 ? 
      impacts['Amygdala'].totalImpact : 0;
    
    if (pfcReduction > 0 && amygdalaIncrease > 0) {
      cascades.push({
        cascade: 'Executive-Limbic Decoupling',
        mechanism: `The ${pfcReduction}% reduction in prefrontal volume coupled with ${amygdalaIncrease}% amygdala hyperactivity creates a fundamental imbalance in neural governance. The weakened prefrontal regions lose their inhibitory influence over limbic structures, resulting in emotional responses that are both more intense and less subject to cognitive modulation. This decoupling manifests as difficulty in emotion regulation, increased reactivity to stressors, and impaired ability to contextualize emotional experiences.`,
        downstream: 'This primary disruption cascades into secondary effects: compromised working memory under stress, difficulty with cognitive flexibility, and impaired social cognition due to emotion-cognition interference.'
      });
    }
    
    // Memory-Stress cascade
    const hippReduction = impacts['Hippocampus']?.totalImpact < 0 ? 
      Math.abs(impacts['Hippocampus'].totalImpact) : 0;
    const hpaIncrease = impacts['HPA Axis']?.totalImpact > 0 ? 
      impacts['HPA Axis'].totalImpact : 0;
    
    if (hippReduction > 0 && hpaIncrease > 0) {
      cascades.push({
        cascade: 'Hippocampal-HPA Axis Dysfunction',
        mechanism: `The ${hippReduction}% hippocampal volume loss impairs glucocorticoid receptor-mediated negative feedback on the HPA axis, leading to ${hpaIncrease}% elevation in stress hormone production. This creates a self-perpetuating cycle where elevated cortisol further damages hippocampal neurons, progressively worsening both memory function and stress regulation.`,
        downstream: 'Secondary effects include disrupted circadian rhythms, metabolic dysregulation, immune system suppression, and accelerated cellular aging throughout the brain.'
      });
    }
    
    // Sensory-Threat cascade
    const sensoryChanges = (impacts['Visual Cortex']?.totalImpact || 0) + 
                          (impacts['Sensory Cortex']?.totalImpact || 0);
    
    if (Math.abs(sensoryChanges) > 10 && amygdalaIncrease > 0) {
      cascades.push({
        cascade: 'Sensory-Threat Processing Bias',
        mechanism: `Alterations in sensory processing regions (${Math.abs(sensoryChanges)}% change) coupled with amygdala hypervigilance create a perceptual bias toward threat detection. The sensory cortices develop specialized neural pathways that preferentially process threat-related stimuli, while the hyperactive amygdala amplifies these signals.`,
        downstream: 'This results in heightened startle responses, hypervigilance to environmental cues, difficulty filtering irrelevant sensory information, and chronic sensory overload in everyday environments.'
      });
    }
    
    return cascades;
  };
  
  // Generate integrated prognosis
  const generatePrognosis = () => {
    const regionalNarratives = generateRegionalNarrative();
    const cascadeEffects = generateCascadeNarrative();
    
    // Count severe vs moderate impacts
    const severeCount = regionalNarratives.filter(n => n.severity === 'severe').length;
    const totalSystems = regionalNarratives.length;
    
    // Calculate overall neurological burden
    const allImpacts = Object.values(assessmentResults.brainImpacts);
    const avgMagnitude = allImpacts.reduce((sum, impact) => 
      sum + Math.abs(impact.totalImpact), 0) / allImpacts.length;
    
    let prognosisText = '';
    
    if (avgMagnitude > 15 || severeCount > 2) {
      prognosisText = `The neurological profile reveals extensive multi-system compromise affecting ${totalSystems} major brain networks. Without compensatory neuroplasticity, this constellation of alterations would manifest as a complex symptom profile characterized by: profound executive dysfunction with marked difficulties in planning, organization, and impulse control; persistent emotional dysregulation with heightened reactivity and diminished capacity for self-soothing; significant memory impairments particularly affecting autobiographical and contextual memory; and pervasive alterations in stress responsivity creating vulnerability to further psychological and physical health challenges.`;
    } else if (avgMagnitude > 10 || severeCount > 0) {
      prognosisText = `The neurological alterations present a moderate but significant disruption across ${totalSystems} brain systems. In the absence of neuroplastic compensation, the expected symptom profile would include: executive function challenges manifesting as difficulties with sustained attention and cognitive flexibility; emotional regulation deficits particularly under stress; selective memory impairments affecting stress-related contexts; and heightened physiological stress responses. These alterations create vulnerability to mood dysregulation and stress-related disorders.`;
    } else {
      prognosisText = `The neurological changes, while measurable, represent a mild disruption pattern across ${totalSystems} systems. Without neuroplastic adaptation, symptoms would likely include: subtle executive function challenges emerging primarily under high cognitive load; mild emotional reactivity with preserved but effortful regulation; minor memory biases toward negative content; and modestly elevated stress sensitivity. These alterations may manifest as subclinical difficulties that emerge primarily during periods of high demand.`;
    }
    
    // Add developmental considerations
    const earlyTrauma = Object.values(assessmentResults.ageData).some(ages => 
      Array.isArray(ages) ? ages.some(a => a === '0-2' || a === '3-5') : 
      ages === '0-2' || ages === '3-5'
    );
    
    if (earlyTrauma) {
      prognosisText += ` The early developmental timing of these insults (occurring during critical neurodevelopmental windows) fundamentally altered the brain's architectural blueprint, creating cascading effects throughout subsequent development. This early disruption established altered neural templates that shaped all subsequent brain maturation.`;
    }
    
    return prognosisText;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-3xl font-light">Neurological Impact Analysis</h1>
        <p className="text-gray-400 mt-2">
          Qualitative assessment of structural and functional brain alterations
        </p>
      </div>
      
      {/* Navigation */}
      <div className="flex border-b border-gray-800">
        {['narrative', 'cascades', 'prognosis'].map(view => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-6 py-3 capitalize ${
              activeView === view 
                ? 'text-white border-b-2 border-purple-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {view === 'narrative' ? 'Regional Alterations' : view}
          </button>
        ))}
      </div>
      
      <div className="p-6 max-w-5xl mx-auto">
        {/* Regional Alterations */}
        {activeView === 'narrative' && (
          <div className="space-y-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-300 mb-6">
                The following analysis describes the qualitative alterations observed across neural systems, 
                focusing on the architectural and functional changes within each affected region.
              </p>
            </div>
            
            {generateRegionalNarrative().map((narrative, i) => (
              <div key={i} className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-medium text-purple-400">
                    {narrative.system}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    narrative.severity === 'severe' 
                      ? 'bg-red-900/50 text-red-300' 
                      : 'bg-yellow-900/50 text-yellow-300'
                  }`}>
                    {narrative.severity}
                  </span>
                </div>
                
                <p className="text-gray-300 leading-relaxed text-lg">
                  {narrative.description}
                </p>
                
                {narrative.citations && narrative.citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Supporting Research</p>
                    <div className="flex flex-wrap gap-2">
                      {narrative.citations.map((citation, j) => (
                        <span key={j} className="text-sm">
                          {formatCitation(citation)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Cascade Effects */}
        {activeView === 'cascades' && (
          <div className="space-y-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-300 mb-6">
                Neural alterations do not exist in isolation. The following describes how primary disruptions 
                cascade through interconnected systems, creating compound effects that amplify the initial damage.
              </p>
            </div>
            
            {generateCascadeNarrative().map((cascade, i) => (
              <div key={i} className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-800/50">
                <h3 className="text-xl font-medium mb-4 text-blue-300">
                  {cascade.cascade}
                </h3>
                <div className="space-y-6">
                  <div className="bg-black/30 rounded-lg p-4">
                    <h4 className="text-sm uppercase tracking-wide text-blue-400 mb-3 font-semibold">
                      Primary Mechanism
                    </h4>
                    <p className="text-gray-200 leading-relaxed text-lg">
                      {cascade.mechanism}
                    </p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <h4 className="text-sm uppercase tracking-wide text-purple-400 mb-3 font-semibold">
                      Downstream Effects
                    </h4>
                    <p className="text-gray-200 leading-relaxed">
                      {cascade.downstream}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {generateCascadeNarrative().length === 0 && (
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                <p className="text-gray-400 text-center">
                  No significant cascade effects detected based on the current impact profile.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Integrated Prognosis */}
        {activeView === 'prognosis' && (
          <div className="space-y-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-300 mb-6">
                The following prognosis integrates all observed alterations to project the expected 
                symptomatology profile, assuming no compensatory neuroplastic adaptations.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-8 border border-purple-800/50">
              <h3 className="text-2xl font-medium mb-4 text-purple-300">
                Integrated Neurological Prognosis
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {generatePrognosis()}
              </p>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <h4 className="text-lg font-medium mb-3 text-gray-300">
                Clinical Considerations
              </h4>
              <p className="text-gray-400 leading-relaxed">
                This analysis represents the theoretical symptom profile based purely on observed structural 
                and functional alterations. In reality, the human brain possesses remarkable capacity for 
                neuroplastic adaptation, compensatory mechanisms, and resilience factors that can significantly 
                modify these projected outcomes. Individual differences in genetic predisposition, environmental 
                supports, and therapeutic interventions further modulate the ultimate expression of these 
                neurological changes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeurologicalNarrativeResults;