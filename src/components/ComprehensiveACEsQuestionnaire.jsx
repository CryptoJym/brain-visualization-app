import React, { useState } from 'react';

const ComprehensiveACEsQuestionnaire = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [ageData, setAgeData] = useState({});
  const [durationData, setDurationData] = useState({});

  // Comprehensive ACEs questions based on research
  const questionCategories = [
    {
      category: "Physical Abuse",
      questions: [
        {
          id: 'physical_hit',
          question: 'Did a parent or adult in the household often push, grab, slap, or throw something at you?',
          brainImpact: {
            regions: [
              { name: 'Prefrontal Cortex', impact: -12, research: 'Teicher et al. (2016)' },
              { name: 'Amygdala', impact: +18, research: 'Hanson et al. (2010)' }
            ]
          }
        },
        {
          id: 'physical_hurt',
          question: 'Did a parent or adult often hit you so hard that you had marks or were injured?',
          brainImpact: {
            regions: [
              { name: 'Hippocampus', impact: -8.5, research: 'Carrion et al. (2001)' },
              { name: 'Corpus Callosum', impact: -7, research: 'Teicher et al. (2004)' }
            ]
          }
        }
      ]
    },
    {
      category: "Sexual Abuse",
      questions: [
        {
          id: 'sexual_touch',
          question: 'Did an adult or person at least 5 years older than you ever touch or fondle you in a sexual way?',
          brainImpact: {
            regions: [
              { name: 'Corpus Callosum', impact: -17, research: 'Andersen et al. (2008)' },
              { name: 'Hippocampus', impact: -19, research: 'Stein et al. (1997)' }
            ]
          }
        },
        {
          id: 'sexual_attempt',
          question: 'Did an adult or person at least 5 years older ever try to have oral, anal, or vaginal sex with you?',
          brainImpact: {
            regions: [
              { name: 'Sensory Cortex', impact: -30, research: 'Heim et al. (2013)' },
              { name: 'Visual Cortex', impact: -18, research: 'Tomoda et al. (2009)' },
              { name: 'Cerebellar Vermis', impact: -15, research: 'Anderson et al. (2002)' }
            ]
          }
        }
      ]
    },
    {
      category: "Emotional Abuse",
      questions: [
        {
          id: 'emotional_insult',
          question: 'Did a parent or adult in the household often swear at you, insult you, or put you down?',
          brainImpact: {
            regions: [
              { name: 'Medial Prefrontal Cortex', impact: -14, research: 'van Harmelen et al. (2010)' },
              { name: 'Anterior Cingulate', impact: -9, research: 'Edmiston et al. (2011)' }
            ]
          }
        },
        {
          id: 'emotional_fear',
          question: 'Did a parent or adult often act in a way that made you afraid you would be physically hurt?',
          brainImpact: {
            regions: [
              { name: 'Amygdala', impact: +22, research: 'Dannlowski et al. (2012)' },
              { name: 'Insula', impact: +12, research: 'Teicher et al. (2014)' }
            ]
          }
        }
      ]
    },
    {
      category: "Physical Neglect",
      questions: [
        {
          id: 'neglect_food',
          question: 'Did you often feel that you didn\'t have enough to eat, clean clothes, or protection?',
          brainImpact: {
            regions: [
              { name: 'Orbitofrontal Cortex', impact: -16, research: 'Hanson et al. (2013)' },
              { name: 'Cerebellum', impact: -8, research: 'De Bellis et al. (2005)' }
            ]
          }
        },
        {
          id: 'neglect_care',
          question: 'Were your parents too drunk or high to take care of you or take you to the doctor?',
          brainImpact: {
            regions: [
              { name: 'Overall Brain Volume', impact: -7, research: 'De Bellis et al. (2002)' },
              { name: 'White Matter Integrity', impact: -15, research: 'Huang et al. (2012)' }
            ]
          }
        }
      ]
    },
    {
      category: "Emotional Neglect",
      questions: [
        {
          id: 'neglect_unloved',
          question: 'Did you often feel that no one in your family loved you or thought you were special?',
          brainImpact: {
            regions: [
              { name: 'Default Mode Network', impact: 'disrupted', research: 'Bluhm et al. (2009)' },
              { name: 'Temporal Lobe', impact: -11, research: 'De Bellis et al. (2002)' }
            ]
          }
        },
        {
          id: 'neglect_unsupported',
          question: 'Did you often feel that your family didn\'t look out for each other or feel close?',
          brainImpact: {
            regions: [
              { name: 'Attachment Circuits', impact: 'altered', research: 'Schore (2001)' },
              { name: 'Orbitofrontal Cortex', impact: -12, research: 'Chugani et al. (2001)' }
            ]
          }
        }
      ]
    },
    {
      category: "Household Substance Abuse",
      questions: [
        {
          id: 'household_alcohol',
          question: 'Did you live with anyone who was a problem drinker or alcoholic?',
          brainImpact: {
            regions: [
              { name: 'Reward Circuits', impact: 'disrupted', research: 'Dube et al. (2006)' },
              { name: 'Executive Networks', impact: -12, research: 'Clark et al. (2008)' }
            ]
          }
        },
        {
          id: 'household_drugs',
          question: 'Did you live with anyone who used street drugs or abused prescription medications?',
          brainImpact: {
            regions: [
              { name: 'White Matter Integrity', impact: -15, research: 'Tapert et al. (2012)' },
              { name: 'Dopamine System', impact: 'altered', research: 'Volkow et al. (2016)' }
            ]
          }
        }
      ]
    },
    {
      category: "Household Mental Illness",
      questions: [
        {
          id: 'mental_depression',
          question: 'Was a household member depressed or mentally ill?',
          brainImpact: {
            regions: [
              { name: 'Limbic System', impact: +20, research: 'Lebel et al. (2016)' },
              { name: 'HPA Axis', impact: 'dysregulated', research: 'Essex et al. (2011)' }
            ]
          }
        },
        {
          id: 'mental_suicide',
          question: 'Did a household member attempt suicide?',
          brainImpact: {
            regions: [
              { name: 'Prefrontal-Limbic Connectivity', impact: -25, research: 'Herringa et al. (2013)' },
              { name: 'Serotonin System', impact: 'altered', research: 'Mann et al. (2001)' }
            ]
          }
        }
      ]
    },
    {
      category: "Domestic Violence",
      questions: [
        {
          id: 'violence_mother',
          question: 'Was your mother or stepmother often pushed, grabbed, slapped, or had something thrown at her?',
          brainImpact: {
            regions: [
              { name: 'Visual Association Areas', impact: 'altered', research: 'Choi et al. (2012)' },
              { name: 'Amygdala', impact: +15, research: 'McCrory et al. (2011)' }
            ]
          }
        },
        {
          id: 'violence_severe',
          question: 'Was your mother or stepmother sometimes or often kicked, bitten, hit with a fist, or hit with something hard?',
          brainImpact: {
            regions: [
              { name: 'Insula', impact: +12, research: 'Teicher et al. (2014)' },
              { name: 'Anterior Cingulate', impact: -8, research: 'Mueller et al. (2010)' }
            ]
          }
        }
      ]
    },
    {
      category: "Parental Separation/Divorce",
      questions: [
        {
          id: 'parents_separated',
          question: 'Were your parents ever separated or divorced?',
          brainImpact: {
            regions: [
              { name: 'Attachment Systems', impact: 'reorganized', research: 'Tottenham et al. (2012)' },
              { name: 'Stress Response System', impact: +10, research: 'Luecken (2000)' }
            ]
          }
        }
      ]
    },
    {
      category: "Incarcerated Family Member",
      questions: [
        {
          id: 'household_prison',
          question: 'Did a household member go to prison?',
          brainImpact: {
            regions: [
              { name: 'Social Brain Network', impact: 'altered', research: 'Dallaire (2007)' },
              { name: 'Prefrontal Development', impact: -8, research: 'Haskins (2014)' }
            ]
          }
        }
      ]
    },
    {
      category: "Additional Trauma Factors",
      questions: [
        {
          id: 'bullying_peer',
          question: 'Were you regularly bullied or harassed by peers at school?',
          brainImpact: {
            regions: [
              { name: 'Social Cognition Areas', impact: -12, research: 'Vaillancourt et al. (2013)' },
              { name: 'Amygdala', impact: +18, research: 'Rudolph et al. (2016)' }
            ]
          }
        },
        {
          id: 'community_violence',
          question: 'Did you witness or experience violence in your neighborhood or community?',
          brainImpact: {
            regions: [
              { name: 'Threat Detection System', impact: +25, research: 'McLaughlin et al. (2014)' },
              { name: 'Hippocampus', impact: -10, research: 'Saxbe et al. (2018)' }
            ]
          }
        },
        {
          id: 'poverty_chronic',
          question: 'Did your family struggle with poverty or not having enough money for basic needs?',
          brainImpact: {
            regions: [
              { name: 'Prefrontal Cortex', impact: -15, research: 'Noble et al. (2015)' },
              { name: 'Language Areas', impact: -12, research: 'Farah et al. (2006)' }
            ]
          }
        },
        {
          id: 'discrimination',
          question: 'Did you experience ongoing discrimination based on race, ethnicity, or other factors?',
          brainImpact: {
            regions: [
              { name: 'Stress Response System', impact: +20, research: 'Clark et al. (1999)' },
              { name: 'Prefrontal Function', impact: -10, research: 'Gianaros et al. (2012)' }
            ]
          }
        },
        {
          id: 'medical_trauma',
          question: 'Did you experience serious illness, painful medical procedures, or lengthy hospitalization?',
          brainImpact: {
            regions: [
              { name: 'Pain Processing Centers', impact: +15, research: 'Fitzgerald et al. (2015)' },
              { name: 'Hippocampus', impact: -8, research: 'Malter Cohen et al. (2013)' }
            ]
          }
        },
        {
          id: 'natural_disaster',
          question: 'Did you experience a natural disaster (fire, flood, earthquake, hurricane)?',
          brainImpact: {
            regions: [
              { name: 'Amygdala', impact: +12, research: 'La Greca et al. (2013)' },
              { name: 'Hippocampus', impact: -7, research: 'Carrion & Wong (2012)' }
            ]
          }
        },
        {
          id: 'caregiver_death',
          question: 'Did a parent or primary caregiver die during your childhood?',
          brainImpact: {
            regions: [
              { name: 'Attachment Circuits', impact: 'reorganized', research: 'O\'Connor et al. (2012)' },
              { name: 'Reward System', impact: -15, research: 'Luecken & Roubinov (2012)' }
            ]
          }
        },
        {
          id: 'foster_care',
          question: 'Were you placed in foster care or removed from your home?',
          brainImpact: {
            regions: [
              { name: 'Attachment Systems', impact: 'disrupted', research: 'Bick et al. (2015)' },
              { name: 'Hippocampus', impact: -12, research: 'Mehta et al. (2009)' }
            ]
          }
        }
      ]
    },
    {
      category: "Protective Factors",
      questions: [
        {
          id: 'protective_adult',
          question: 'Was there at least one adult who made you feel safe, protected, and cared for?',
          isProtective: true,
          brainImpact: {
            mitigation: -30,
            research: 'Werner & Smith (1992), Masten (2001)'
          }
        },
        {
          id: 'protective_friend',
          question: 'Did you have close friendships that provided emotional support?',
          isProtective: true,
          brainImpact: {
            mitigation: -15,
            research: 'Ozbay et al. (2007)'
          }
        },
        {
          id: 'protective_activity',
          question: 'Were you involved in organized activities (sports, music, clubs) that gave you a sense of belonging?',
          isProtective: true,
          brainImpact: {
            mitigation: -10,
            research: 'Fredricks & Eccles (2006)'
          }
        },
        {
          id: 'protective_achievement',
          question: 'Did you experience academic or other achievements that boosted your self-esteem?',
          isProtective: true,
          brainImpact: {
            mitigation: -10,
            research: 'Masten et al. (1999)'
          }
        }
      ]
    }
  ];

  // Flatten all questions for navigation
  const allQuestions = questionCategories.flatMap(cat => cat.questions);
  const totalQuestions = allQuestions.length;

  const ageRanges = [
    { value: '0-2', label: '0-2 years', multiplier: 3.5, description: 'Critical attachment period' },
    { value: '3-5', label: '3-5 years', multiplier: 2.5, description: 'Early childhood development' },
    { value: '6-8', label: '6-8 years', multiplier: 2.0, description: 'School age vulnerability' },
    { value: '9-11', label: '9-11 years', multiplier: 1.7, description: 'Pre-adolescent changes' },
    { value: '12-14', label: '12-14 years', multiplier: 1.4, description: 'Early adolescence' },
    { value: '15-17', label: '15-17 years', multiplier: 1.2, description: 'Late adolescence' },
    { value: 'throughout', label: 'Throughout childhood', multiplier: 2.8, description: 'Chronic exposure' }
  ];

  const durations = [
    { value: 'once', label: 'Once or twice', modifier: 0 },
    { value: 'sometimes', label: 'Sometimes (3-10 times)', modifier: 0.3 },
    { value: 'often', label: 'Often (11-50 times)', modifier: 0.7 },
    { value: 'very_often', label: 'Very often (50+ times)', modifier: 1.2 },
    { value: 'chronic', label: 'Chronically/Daily', modifier: 2.0 }
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

  const handleAgeData = (questionId, age) => {
    setAgeData({ ...ageData, [questionId]: age });
    setCurrentStep(currentStep + 0.1); // Move to duration
  };

  const handleDurationData = (questionId, duration) => {
    setDurationData({ ...durationData, [questionId]: duration });
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
          // Count traditional ACEs (first 10 categories)
          const categoryIndex = questionCategories.findIndex(cat => 
            cat.questions.some(question => question.id === q.id)
          );
          if (categoryIndex < 10) {
            results.aceScore++;
          }
          results.expandedACEScore++;
          
          // Calculate brain impacts
          if (q.brainImpact.regions) {
            q.brainImpact.regions.forEach(region => {
              if (typeof region.impact === 'number') {
                const ageMultiplier = ageRanges.find(a => a.value === ageData[q.id])?.multiplier || 1;
                const durationModifier = durations.find(d => d.value === durationData[q.id])?.modifier || 0;
                
                const impact = region.impact * ageMultiplier * (1 + durationModifier * 0.3);
                
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
    const baseSeverity = Math.min(10, results.expandedACEScore * 0.5);
    const avgAgeMultiplier = Object.values(ageData).reduce((sum, age) => {
      const range = ageRanges.find(r => r.value === age);
      return sum + (range?.multiplier || 1);
    }, 0) / (Object.values(ageData).length || 1);
    
    results.overallSeverity = Math.min(10, baseSeverity * avgAgeMultiplier * 0.7);
    
    // Apply protective factors
    const totalMitigation = results.protectiveFactors.reduce((sum, pf) => sum + pf.mitigation, 0);
    const mitigationFactor = 1 + (totalMitigation / 100);
    
    results.overallSeverity *= mitigationFactor;
    Object.keys(results.brainImpacts).forEach(region => {
      results.brainImpacts[region].totalImpact *= mitigationFactor;
    });

    onComplete(results);
  };

  const currentCategory = questionCategories.find(cat => 
    cat.questions.some(q => q.id === currentQuestion?.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Question {Math.floor(currentStep) + 1} of {totalQuestions}</span>
            <span>{currentCategory?.category}</span>
            <span>{Math.round((Math.floor(currentStep) / totalQuestions) * 100)}% Complete</span>
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
                  currentQuestion?.isProtective ? 'bg-green-600/20 text-green-400' : 'bg-purple-600/20 text-purple-400'
                } rounded-full text-sm font-medium`}>
                  {currentCategory?.category}
                </span>
              </div>
              
              <h2 className="text-2xl font-light text-white mb-6 leading-relaxed">
                {currentQuestion?.question}
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => handleResponse(currentQuestion.id, 'yes')}
                  className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all text-lg"
                >
                  Yes
                </button>
                <button
                  onClick={() => handleResponse(currentQuestion.id, 'no')}
                  className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all text-lg"
                >
                  No
                </button>
                <button
                  onClick={() => handleResponse(currentQuestion.id, 'unsure')}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 transition-all"
                >
                  Not sure / Prefer not to answer
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Age follow-up */}
              {currentStep % 1 < 0.2 && (
                <>
                  <h3 className="text-xl text-white mb-6">
                    At what age did this occur?
                  </h3>
                  <div className="space-y-3">
                    {ageRanges.map(range => (
                      <button
                        key={range.value}
                        onClick={() => handleAgeData(currentQuestion.id, range.value)}
                        className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-all"
                      >
                        <div className="text-white font-medium">{range.label}</div>
                        <div className="text-sm text-gray-400">{range.description}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Duration follow-up */}
              {currentStep % 1 >= 0.2 && (
                <>
                  <h3 className="text-xl text-white mb-6">
                    How often did this happen?
                  </h3>
                  <div className="space-y-3">
                    {durations.map(duration => (
                      <button
                        key={duration.value}
                        onClick={() => handleDurationData(currentQuestion.id, duration.value)}
                        className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all text-lg"
                      >
                        {duration.label}
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
            ← Previous question
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
          <p>Your responses are used to generate a personalized brain impact visualization.</p>
          <p>All data is processed locally and not stored.</p>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveACEsQuestionnaire;