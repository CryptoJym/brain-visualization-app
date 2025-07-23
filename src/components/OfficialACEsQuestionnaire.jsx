import React, { useState } from 'react';

const OfficialACEsQuestionnaire = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [ageData, setAgeData] = useState({}); // Now stores arrays of ages
  const [durationData, setDurationData] = useState({});
  const [selectedAges, setSelectedAges] = useState([]); // Temporary storage for current question

  // Official ACE Study Questions (Kaiser Permanente/CDC)
  const questionCategories = [
    {
      category: "Emotional Abuse",
      questions: [
        {
          id: 'emotional_abuse',
          question: 'Did a parent or other adult in the household often or very often swear at you, insult you, put you down, or humiliate you? OR act in a way that made you afraid that you might be physically hurt?',
          officialACE: true,
          brainImpact: {
            regions: [
              { name: 'Medial Prefrontal Cortex', impact: -14, research: 'van Harmelen et al. (2010)' },
              { name: 'Anterior Cingulate', impact: -9.8, research: 'Dannlowski et al. (2012)' },
              { name: 'Insula', impact: -7.2, research: 'Edmiston et al. (2011)' },
              { name: 'Amygdala', impact: +19, research: 'Tottenham et al. (2011) - reactivity not volume' }
            ]
          }
        }
      ]
    },
    {
      category: "Physical Abuse",
      questions: [
        {
          id: 'physical_abuse',
          question: 'Did a parent or other adult in the household often or very often push, grab, slap, or throw something at you? OR ever hit you so hard that you had marks or were injured?',
          officialACE: true,
          brainImpact: {
            regions: [
              { name: 'Orbitofrontal Cortex', impact: -18.1, research: 'Hanson et al. (2010)' },
              { name: 'Dorsolateral Prefrontal Cortex', impact: -12.6, research: 'De Brito et al. (2013)' },
              { name: 'Hippocampus', impact: -6.5, research: 'Woon & Hedges (2008) meta-analysis' },
              { name: 'Amygdala', impact: +9.8, research: 'Whittle et al. (2013) - males only' },
              { name: 'Cerebellum', impact: -10, research: 'Anderson et al. (2002) - vermis region' }
            ]
          }
        }
      ]
    },
    {
      category: "Sexual Abuse",
      questions: [
        {
          id: 'sexual_abuse',
          question: 'Did an adult or person at least 5 years older than you ever touch or fondle you or have you touch their body in a sexual way? OR attempt or actually have oral, anal, or vaginal intercourse with you?',
          officialACE: true,
          brainImpact: {
            regions: [
              { name: 'Corpus Callosum', impact: -17, research: 'Andersen et al. (2008) - females' },
              { name: 'Visual Cortex', impact: -18.1, research: 'Tomoda et al. (2009)' },
              { name: 'Sensory Cortex', impact: -30, research: 'Heim et al. (2013) - genital sensory' },
              { name: 'Hippocampus', impact: -16.5, research: 'Teicher et al. (2012) - left hemisphere' }
            ]
          }
        }
      ]
    },
    {
      category: "Emotional Neglect",
      questions: [
        {
          id: 'emotional_neglect',
          question: "Did you often or very often feel that no one in your family loved you or thought you were important or special? OR your family didn't look out for each other, feel close to each other, or support each other?",
          officialACE: true,
          brainImpact: {
            regions: [
              { name: 'Anterior Cingulate', impact: -17, research: 'Cohen et al. (2006)' },
              { name: 'Superior Temporal Gyrus', impact: -14, research: 'De Bellis et al. (2002)' },
              { name: 'Overall Brain Volume', impact: -9, research: 'De Bellis et al. (2002)' },
              { name: 'Amygdala', impact: -6, research: 'Gee et al. (2013) - initially smaller' }
            ]
          }
        }
      ]
    },
    {
      category: "Physical Neglect",
      questions: [
        {
          id: 'physical_neglect',
          question: "Did you often or very often feel that you didn't have enough to eat, had to wear dirty clothes, and had no one to protect you? OR your parents were too drunk or high to take care of you or take you to the doctor if you needed it?",
          officialACE: true,
          brainImpact: {
            regions: [
              { name: 'Overall Brain Volume', impact: -11, research: 'De Bellis et al. (2002)' },
              { name: 'Anterior Cingulate', impact: -17, research: 'Cohen et al. (2006)' },
              { name: 'Superior Temporal Gyrus', impact: -14, research: 'De Bellis et al. (2002)' },
              { name: 'Amygdala', impact: +20, research: 'Gee et al. (2013) - reactive by adolescence' }
            ]
          }
        }
      ]
    },
    {
      category: "Mother Treated Violently",
      questions: [
        {
          id: 'domestic_violence',
          question: 'Was your mother or stepmother often or very often pushed, grabbed, slapped, or had something thrown at her? OR sometimes, often, or very often kicked, bitten, hit with a fist, or hit with something hard? OR ever repeatedly hit over at least a few minutes or threatened with a gun or knife?',
          officialACE: true,
          brainImpact: {
            regions: [
              { name: 'Visual Association Areas', impact: -15, research: 'Choi et al. (2012)' },
              { name: 'Amygdala', impact: +15, research: 'McCrory et al. (2011)' },
              { name: 'Insula', impact: +12, research: 'Teicher et al. (2014)' }
            ]
          }
        }
      ]
    },
    {
      category: "Household Substance Abuse",
      questions: [
        {
          id: 'substance_abuse',
          question: 'Did you live with anyone who was a problem drinker or alcoholic, or who used street drugs?',
          officialACE: true,
          brainImpact: {
            regions: [
              { name: 'White Matter Integrity', impact: -15, research: 'Tapert et al. (2012)' },
              { name: 'Dopamine Reward Circuits', impact: -25, research: 'Dillon et al. (2009)' },
              { name: 'Executive Networks', impact: -12, research: 'Clark et al. (2008)' }
            ]
          }
        }
      ]
    },
    {
      category: "Mental Illness in Household",
      questions: [
        {
          id: 'mental_illness',
          question: 'Was a household member depressed or mentally ill, or did a household member attempt suicide?',
          officialACE: true,
          brainImpact: {
            regions: [
              { name: 'Limbic System', impact: +20, research: 'Lebel et al. (2016)' },
              { name: 'HPA Axis', impact: +18, research: 'Essex et al. (2011) - cortisol elevation' },
              { name: 'Prefrontal-Limbic Connectivity', impact: -25, research: 'Herringa et al. (2013)' }
            ]
          }
        }
      ]
    },
    {
      category: "Parental Separation or Divorce",
      questions: [
        {
          id: 'parents_separated',
          question: 'Were your parents ever separated or divorced?',
          officialACE: true,
          brainImpact: {
            regions: [
              { name: 'Attachment Systems', impact: -15, research: 'Tottenham et al. (2012) - reorganization' },
              { name: 'Stress Response System', impact: +10, research: 'Luecken (2000)' }
            ]
          }
        }
      ]
    },
    {
      category: "Incarcerated Household Member",
      questions: [
        {
          id: 'household_prison',
          question: 'Did a household member go to prison?',
          officialACE: true,
          brainImpact: {
            regions: [
              { name: 'Social Brain Network', impact: -12, research: 'Dallaire (2007)' },
              { name: 'Prefrontal Development', impact: -8, research: 'Haskins (2014)' }
            ]
          }
        }
      ]
    },
    {
      category: "Extended ACEs - Community & Environmental",
      questions: [
        {
          id: 'witnessed_violence',
          question: 'Did you see or hear someone being beaten up, stabbed, or shot in real life (not on TV, in movies, or video games)?',
          expandedACE: true,
          brainImpact: {
            regions: [
              { name: 'Threat Detection System', impact: +25, research: 'McLaughlin et al. (2014)' },
              { name: 'Hippocampus', impact: -10, research: 'Saxbe et al. (2018)' }
            ]
          }
        },
        {
          id: 'felt_unsafe',
          question: 'Did you often feel unsafe in your neighborhood or worry that someone might hurt you?',
          expandedACE: true,
          brainImpact: {
            regions: [
              { name: 'Hypervigilance Network', impact: +20, research: 'McCrory et al. (2017)' },
              { name: 'Prefrontal Cortex', impact: -10, research: 'Hackman et al. (2010)' }
            ]
          }
        },
        {
          id: 'bullied',
          question: 'Were you often bullied, teased, or excluded by other children or teens?',
          expandedACE: true,
          brainImpact: {
            regions: [
              { name: 'Social Cognition Areas', impact: -12, research: 'Vaillancourt et al. (2013)' },
              { name: 'Amygdala', impact: +18, research: 'Rudolph et al. (2016)' }
            ]
          }
        },
        {
          id: 'discrimination',
          question: 'Were you often treated badly or unfairly because of your race, ethnicity, gender, sexual orientation, religion, or other identity?',
          expandedACE: true,
          brainImpact: {
            regions: [
              { name: 'Stress Response System', impact: +20, research: 'Clark et al. (1999)' },
              { name: 'Prefrontal Function', impact: -10, research: 'Gianaros et al. (2012)' }
            ]
          }
        },
        {
          id: 'homeless',
          question: 'Did you ever have to live on the street, in a shelter, or move frequently because of housing problems?',
          expandedACE: true,
          brainImpact: {
            regions: [
              { name: 'Stress Axis', impact: +25, research: 'Coley et al. (2013)' },
              { name: 'Executive Function', impact: -15, research: 'Masten et al. (2014)' }
            ]
          }
        },
        {
          id: 'foster_care',
          question: 'Were you ever in foster care or removed from your home by child protective services?',
          expandedACE: true,
          brainImpact: {
            regions: [
              { name: 'Attachment Systems', impact: -20, research: 'Bick et al. (2015) - disruption' },
              { name: 'Hippocampus', impact: -12, research: 'Mehta et al. (2009)' }
            ]
          }
        },
        {
          id: 'parent_deported',
          question: 'Was a parent or caregiver deported or detained by immigration?',
          expandedACE: true,
          brainImpact: {
            regions: [
              { name: 'Separation Anxiety Networks', impact: +20, research: 'Zayas et al. (2015)' },
              { name: 'Attachment Security', impact: -15, research: 'Brabeck et al. (2016)' }
            ]
          }
        }
      ]
    },
    {
      category: "Protective & Resilience Factors",
      questions: [
        {
          id: 'protective_adult',
          question: 'Growing up, was there at least one adult who made you feel safe, loved, and supported?',
          isProtective: true,
          brainImpact: {
            mitigation: -30,
            research: 'Werner & Smith (1992), Masten (2001)'
          }
        },
        {
          id: 'protective_friend',
          question: 'Did you have at least one close friend who you could trust and talk to about your problems?',
          isProtective: true,
          brainImpact: {
            mitigation: -15,
            research: 'Ozbay et al. (2007)'
          }
        },
        {
          id: 'protective_community',
          question: 'Did you feel like you belonged in your school, community, or a cultural/religious group?',
          isProtective: true,
          brainImpact: {
            mitigation: -10,
            research: 'Ungar (2013)'
          }
        },
        {
          id: 'protective_competence',
          question: 'Did you have activities or skills that made you feel proud and capable (sports, arts, academics, etc.)?',
          isProtective: true,
          brainImpact: {
            mitigation: -10,
            research: 'Masten et al. (1999)'
          }
        },
        {
          id: 'protective_routine',
          question: 'Did your family have predictable routines like regular meals, bedtimes, or family traditions?',
          isProtective: true,
          brainImpact: {
            mitigation: -8,
            research: 'Fiese et al. (2002)'
          }
        }
      ]
    }
  ];

  // Flatten all questions for navigation
  const allQuestions = questionCategories.flatMap(cat => cat.questions);
  const totalQuestions = allQuestions.length;
  const officialACEQuestions = allQuestions.filter(q => q.officialACE).length;

  const ageRanges = [
    { value: '0-2', label: 'Before age 3', multiplier: 2.2, description: 'Critical attachment period' },
    { value: '3-5', label: 'Ages 3-5', multiplier: 1.8, description: 'Early childhood' },
    { value: '6-8', label: 'Ages 6-8', multiplier: 1.5, description: 'Early school age' },
    { value: '9-11', label: 'Ages 9-11', multiplier: 1.3, description: 'Middle childhood' },
    { value: '12-14', label: 'Ages 12-14', multiplier: 1.1, description: 'Early adolescence' },
    { value: '15-17', label: 'Ages 15-17', multiplier: 1.0, description: 'Late adolescence' },
    { value: 'throughout', label: 'Throughout childhood', multiplier: 1.8, description: 'Chronic exposure' }
  ];

  const frequencies = [
    { value: 'once', label: 'Once', modifier: 0 },
    { value: 'few', label: 'A few times', modifier: 0.3 },
    { value: 'often', label: 'Often', modifier: 0.7 },
    { value: 'very_often', label: 'Very often', modifier: 1.2 }
  ];

  const currentQuestion = allQuestions[Math.floor(currentStep)];
  const isFollowUp = currentStep % 1 !== 0;

  const handleResponse = (questionId, response) => {
    setResponses({ ...responses, [questionId]: response });
    
    if (response === 'yes' && !currentQuestion.isProtective) {
      // Show age follow-up
      setCurrentStep(currentStep + 0.1);
    } else {
      // Move to next question
      if (Math.floor(currentStep) < totalQuestions - 1) {
        setCurrentStep(Math.floor(currentStep) + 1);
      } else {
        calculateResults();
      }
    }
  };

  const handleAgeData = (age) => {
    // Toggle age selection
    if (selectedAges.includes(age)) {
      setSelectedAges(selectedAges.filter(a => a !== age));
    } else {
      setSelectedAges([...selectedAges, age]);
    }
  };

  const confirmAgeSelection = (questionId) => {
    if (selectedAges.length > 0) {
      setAgeData({ ...ageData, [questionId]: selectedAges });
      setSelectedAges([]); // Reset for next question
      // Use more precise step increment to avoid floating point issues
      setCurrentStep(Math.floor(currentStep) + 0.5); // Move to frequency
    }
  };

  const handleFrequencyData = (questionId, frequency) => {
    setDurationData({ ...durationData, [questionId]: frequency });
    // Move to next main question
    if (Math.floor(currentStep) < totalQuestions - 1) {
      setCurrentStep(Math.floor(currentStep) + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const results = {
      responses,
      ageData,
      durationData,
      aceScore: 0,
      expandedACEScore: 0,
      brainImpacts: {},
      overallSeverity: 0,
      protectiveFactors: []
    };

    // Calculate scores and impacts
    allQuestions.forEach(q => {
      if (responses[q.id] === 'yes') {
        if (!q.isProtective) {
          // Count official ACEs
          if (q.officialACE) {
            results.aceScore++;
          }
          if (q.expandedACE || q.officialACE) {
            results.expandedACEScore++;
          }
          
          // Calculate brain impacts
          if (q.brainImpact.regions) {
            q.brainImpact.regions.forEach(region => {
              if (typeof region.impact === 'number') {
                // Handle multiple ages - use the highest multiplier
                let maxAgeMultiplier = 1;
                const ages = ageData[q.id];
                if (Array.isArray(ages)) {
                  ages.forEach(age => {
                    const multiplier = ageRanges.find(a => a.value === age)?.multiplier || 1;
                    maxAgeMultiplier = Math.max(maxAgeMultiplier, multiplier);
                  });
                } else {
                  // Fallback for old single age format
                  maxAgeMultiplier = ageRanges.find(a => a.value === ageData[q.id])?.multiplier || 1;
                }
                
                const frequencyModifier = frequencies.find(f => f.value === durationData[q.id])?.modifier || 0;
                
                const impact = region.impact * maxAgeMultiplier * (1 + frequencyModifier * 0.3);
                
                if (!results.brainImpacts[region.name]) {
                  results.brainImpacts[region.name] = {
                    totalImpact: 0,
                    sources: []
                  };
                }
                
                results.brainImpacts[region.name].totalImpact += impact;
                results.brainImpacts[region.name].sources.push({
                  trauma: q.question.substring(0, 50) + '...',
                  impact,
                  research: region.research
                });
              }
            });
          }
        } else {
          // Protective factor
          results.protectiveFactors.push({
            factor: q.id,
            mitigation: q.brainImpact.mitigation
          });
        }
      }
    });

    // Calculate overall severity
    const baseSeverity = Math.min(10, results.aceScore * 1.0 + (results.expandedACEScore - results.aceScore) * 0.5);
    
    // Calculate average age multiplier accounting for multiple ages per trauma
    let totalMultiplier = 0;
    let traumaCount = 0;
    
    Object.values(ageData).forEach(ages => {
      if (Array.isArray(ages)) {
        // For multiple ages, use the highest multiplier
        let maxMultiplier = 1;
        ages.forEach(age => {
          const range = ageRanges.find(r => r.value === age);
          if (range) {
            maxMultiplier = Math.max(maxMultiplier, range.multiplier);
          }
        });
        totalMultiplier += maxMultiplier;
      } else {
        // Fallback for single age
        const range = ageRanges.find(r => r.value === ages);
        totalMultiplier += (range?.multiplier || 1);
      }
      traumaCount++;
    });
    
    const avgAgeMultiplier = traumaCount > 0 ? totalMultiplier / traumaCount : 1;
    results.overallSeverity = Math.min(10, baseSeverity * avgAgeMultiplier * 0.7);
    
    // Apply protective factors
    const totalMitigation = results.protectiveFactors.reduce((sum, pf) => sum + pf.mitigation, 0);
    const mitigationFactor = 1 + (totalMitigation / 100);
    
    results.overallSeverity *= mitigationFactor;
    Object.keys(results.brainImpacts).forEach(region => {
      results.brainImpacts[region].totalImpact *= mitigationFactor;
    });

    console.log('Assessment Results:', results);
    onComplete(results);
  };

  const currentCategory = questionCategories.find(cat => 
    cat.questions.some(q => q.id === currentQuestion?.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-white mb-2">
            Adverse Childhood Experiences Assessment
          </h1>
          <p className="text-gray-400">
            {currentQuestion?.officialACE ? 'Original ACE Study Question' : 
             currentQuestion?.expandedACE ? 'Expanded ACE Question' :
             currentQuestion?.isProtective ? 'Protective Factor' : ''}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Answer honestly - your responses help create a personalized brain impact visualization
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {Math.floor(currentStep) + 1} of {totalQuestions}</span>
            <span>{currentCategory?.category}</span>
            <span>{Math.round((Math.floor(currentStep) / totalQuestions) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(Math.floor(currentStep) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-white/20">
          {!isFollowUp ? (
            <>
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 ${
                  currentQuestion?.isProtective ? 'bg-green-600/20 text-green-400' : 
                  currentQuestion?.officialACE ? 'bg-purple-600/20 text-purple-400' :
                  'bg-blue-600/20 text-blue-400'
                } rounded-full text-sm font-medium`}>
                  {currentCategory?.category}
                </span>
              </div>
              
              <h2 className="text-xl font-light text-white mb-6 leading-relaxed">
                {currentQuestion?.question}
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => handleResponse(currentQuestion.id, 'yes')}
                  className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all text-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleResponse(currentQuestion.id, 'no')}
                  className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all text-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  No
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Age follow-up */}
              {currentStep % 1 > 0 && currentStep % 1 < 0.5 && (
                <>
                  <h3 className="text-xl text-white mb-2">
                    At what age(s) did this occur?
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Select all age periods that apply - you can choose multiple.
                  </p>
                  <div className="space-y-3">
                    {ageRanges.map(range => (
                      <button
                        key={range.value}
                        onClick={() => handleAgeData(range.value)}
                        className={`w-full p-4 border rounded-lg text-left transition-all ${
                          selectedAges.includes(range.value)
                            ? 'bg-purple-600/20 border-purple-500/50 ring-2 ring-purple-500/30'
                            : 'bg-white/5 hover:bg-white/10 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{range.label}</div>
                            <div className="text-sm text-gray-400">{range.description}</div>
                          </div>
                          {selectedAges.includes(range.value) && (
                            <div className="text-purple-400">✓</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => confirmAgeSelection(currentQuestion.id)}
                    disabled={selectedAges.length === 0}
                    className={`mt-6 w-full p-4 rounded-lg font-medium transition-all ${
                      selectedAges.length > 0
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Continue ({selectedAges.length} age period{selectedAges.length !== 1 ? 's' : ''} selected)
                  </button>
                </>
              )}

              {/* Frequency follow-up */}
              {currentStep % 1 >= 0.5 && (
                <>
                  <h3 className="text-xl text-white mb-6">
                    How often did this happen?
                  </h3>
                  <div className="space-y-3">
                    {frequencies.map(freq => (
                      <button
                        key={freq.value}
                        onClick={() => handleFrequencyData(currentQuestion.id, freq.value)}
                        className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all text-lg"
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, Math.floor(currentStep) - 1))}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={currentStep === 0}
          >
            ← Previous
          </button>
          
          <button
            onClick={() => onComplete(null)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Exit assessment
          </button>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>The ACE Study was conducted by Kaiser Permanente and the CDC.</p>
          <p>Questions marked as "Original ACE Study" are from the validated assessment.</p>
        </div>
      </div>
    </div>
  );
};

export default OfficialACEsQuestionnaire;