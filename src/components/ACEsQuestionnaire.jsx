import React, { useState } from 'react';

const ACEsQuestionnaire = ({ onComplete, onBack }) => {
  const [currentAge, setCurrentAge] = useState('');
  const [biologicalSex, setBiologicalSex] = useState('');
  const [answers, setAnswers] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  const handleAnswerChange = (questionId, field, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  const questions = [
    // Abuse
    { id: 'physical_abuse', text: 'Were you ever physically hurt by a parent or adult in your home?', category: 'abuse' },
    { id: 'sexual_abuse', text: 'Did anyone ever touch you sexually or try to make you touch them sexually?', category: 'abuse' },
    { id: 'emotional_abuse', text: 'Did a parent or adult in your home ever insult you, put you down, or act in a way that made you afraid?', category: 'abuse' },
    
    // Neglect
    { id: 'physical_neglect', text: "Did you often feel that you didn't have enough to eat, had to wear dirty clothes, or had no one to protect you?", category: 'neglect' },
    { id: 'emotional_neglect', text: 'Did you often feel that no one in your family loved you or thought you were important?', category: 'neglect' },
    
    // Household Dysfunction
    { id: 'substance_abuse', text: 'Did you live with anyone who had a problem with drinking or using drugs?', category: 'household' },
    { id: 'mental_illness', text: 'Was anyone in your household depressed, mentally ill, or did anyone attempt suicide?', category: 'household' },
    { id: 'domestic_violence', text: 'Did you see or hear a parent or adult in your home being hit, kicked, or hurt?', category: 'household' },
    { id: 'parental_separation', text: 'Were your parents ever separated or divorced?', category: 'household' },
    { id: 'incarceration', text: 'Did anyone in your household go to prison?', category: 'household' },
    
    // Expanded ACEs - Community
    { id: 'peer_bullying', text: 'Were you bullied by peers?', category: 'community' },
    { id: 'community_violence', text: 'Did you witness or experience violence in your neighborhood?', category: 'community' },
    { id: 'economic_hardship', text: 'Did your family struggle with not having enough money for basic needs?', category: 'community' },
    { id: 'discrimination', text: 'Did you experience ongoing discrimination or unfair treatment?', category: 'community' },
    { id: 'social_isolation', text: 'Were you socially isolated or excluded from peer groups?', category: 'community' },
    
    // Life-Threatening Events
    { id: 'near_death_experience', text: 'Did you have an experience where you thought you might die (trapped, drowning, accident)?', category: 'life_threat' },
    { id: 'severe_accident', text: 'Were you in a severe accident or injured badly (even if not hospitalized)?', category: 'life_threat' },
    { id: 'natural_disaster', text: 'Did you experience a natural disaster (fire, flood, earthquake)?', category: 'life_threat' },
    { id: 'witnessed_death', text: 'Did you witness someone dying or being severely injured?', category: 'life_threat' },
    
    // Medical & Health
    { id: 'medical_trauma', text: 'Did you experience serious illness or medical procedures?', category: 'health' },
    { id: 'chronic_pain', text: 'Did you experience chronic pain or illness as a child?', category: 'health' },
    { id: 'surgery_hospitalization', text: 'Were you hospitalized or had major surgery?', category: 'health' },
    
    // Attachment & Loss
    { id: 'caregiver_changes', text: 'Did you experience multiple changes in who took care of you?', category: 'attachment' },
    { id: 'caregiver_death', text: 'Did a parent or primary caregiver die?', category: 'attachment' },
    { id: 'sibling_death', text: 'Did a sibling or close family member die?', category: 'attachment' },
    { id: 'pet_loss', text: 'Did you lose a beloved pet in a traumatic way?', category: 'attachment' },
    { id: 'abandonment', text: 'Were you abandoned or left alone for extended periods?', category: 'attachment' },
    
    // Educational & Developmental
    { id: 'educational_disruption', text: 'Did you experience significant disruptions to your education?', category: 'developmental' },
    { id: 'learning_difficulties', text: 'Did you struggle with unaddressed learning difficulties?', category: 'developmental' },
    { id: 'academic_pressure', text: 'Did you experience extreme academic pressure or failure?', category: 'developmental' },
    
    // Additional Traumas
    { id: 'forced_separation', text: 'Were you forcibly separated from family (custody, immigration)?', category: 'separation' },
    { id: 'homelessness', text: 'Did you experience homelessness or housing instability?', category: 'stability' },
    { id: 'food_insecurity', text: 'Did you regularly worry about having enough food?', category: 'stability' },
    { id: 'parentification', text: 'Did you have to act as a parent to siblings or parents?', category: 'role_reversal' },
    { id: 'cult_extremism', text: 'Were you raised in a cult or extremist environment?', category: 'environment' }
  ];

  const sections = [
    { title: 'Basic Information', questions: [] },
    { title: 'Abuse', questions: questions.filter(q => q.category === 'abuse') },
    { title: 'Neglect', questions: questions.filter(q => q.category === 'neglect') },
    { title: 'Household Dysfunction', questions: questions.filter(q => q.category === 'household') },
    { title: 'Community & Social', questions: questions.filter(q => q.category === 'community') },
    { title: 'Life-Threatening Events', questions: questions.filter(q => q.category === 'life_threat') },
    { title: 'Medical & Health', questions: questions.filter(q => q.category === 'health') },
    { title: 'Attachment & Loss', questions: questions.filter(q => q.category === 'attachment') },
    { title: 'Educational & Developmental', questions: questions.filter(q => q.category === 'developmental' || q.category === 'separation') },
    { title: 'Stability & Environment', questions: questions.filter(q => q.category === 'stability' || q.category === 'role_reversal' || q.category === 'environment') },
    { title: 'Protective Factors', questions: [] }
  ];

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const results = {
      currentAge,
      biologicalSex,
      answers,
      completedAt: new Date().toISOString()
    };
    onComplete(results);
  };

  const isBasicInfoValid = () => currentAge && biologicalSex;
  const currentSectionData = sections[currentSection];
  const progress = ((currentSection + 1) / sections.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-light text-white mb-4">
            Adverse Childhood Experiences Assessment
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            This confidential assessment helps create a personalized visualization of how experiences may have shaped your neural development.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Section {currentSection + 1} of {sections.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-white/10">
            <h2 className="text-2xl font-light text-white">
              {currentSectionData.title}
            </h2>
          </div>

          <div className="p-6">
            {/* Basic Information Section */}
            {currentSection === 0 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-white mb-2">Current Age</label>
                  <input
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter your current age"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Biological Sex</label>
                  <select
                    value={biologicalSex}
                    onChange={(e) => setBiologicalSex(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="" className="bg-gray-900">Select biological sex</option>
                    <option value="male" className="bg-gray-900">Male</option>
                    <option value="female" className="bg-gray-900">Female</option>
                  </select>
                </div>
                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    <strong>Privacy Notice:</strong> Your responses are not stored anywhere and are only used to generate your personalized brain visualization.
                  </p>
                </div>
              </div>
            )}

            {/* Questions Sections */}
            {currentSection > 0 && currentSection < sections.length - 1 && (
              <div className="space-y-6">
                {currentSectionData.questions.map((question) => {
                  const answer = answers[question.id] || {};
                  
                  return (
                    <div key={question.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <h3 className="text-white mb-4">{question.text}</h3>
                      
                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={question.id}
                            checked={answer.experienced === 'yes'}
                            onChange={() => handleAnswerChange(question.id, 'experienced', 'yes')}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-white">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={question.id}
                            checked={answer.experienced === 'no'}
                            onChange={() => handleAnswerChange(question.id, 'experienced', 'no')}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-white">No</span>
                        </label>
                      </div>

                      {answer.experienced === 'yes' && (
                        <div className="mt-4 space-y-3 pl-4 border-l-2 border-purple-500/50">
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              At what age(s) did this occur? (Select all that apply)
                            </label>
                            <div className="space-y-2">
                              {[
                                { value: '0-3', label: '0-3 years (Infancy/Toddler)' },
                                { value: '4-6', label: '4-6 years (Preschool)' },
                                { value: '7-9', label: '7-9 years (Early Elementary)' },
                                { value: '10-12', label: '10-12 years (Late Elementary)' },
                                { value: '13-15', label: '13-15 years (Early Adolescence)' },
                                { value: '16-18', label: '16-18 years (Late Adolescence)' }
                              ].map(ageOption => {
                                const selectedAges = answer.ageRanges || [];
                                const isChecked = selectedAges.includes(ageOption.value);
                                
                                return (
                                  <label key={ageOption.value} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        const newAges = e.target.checked 
                                          ? [...selectedAges, ageOption.value]
                                          : selectedAges.filter(age => age !== ageOption.value);
                                        handleAnswerChange(question.id, 'ageRanges', newAges);
                                      }}
                                      className="w-4 h-4 text-purple-600 bg-white/10 border-white/30 rounded focus:ring-purple-500 focus:ring-2"
                                    />
                                    <span className="text-white text-sm">{ageOption.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              How long did this last?
                            </label>
                            <select
                              value={answer.duration || ''}
                              onChange={(e) => handleAnswerChange(question.id, 'duration', e.target.value)}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors text-sm"
                            >
                              <option value="" className="bg-gray-900">Select duration</option>
                              <option value="single" className="bg-gray-900">Single incident</option>
                              <option value="days" className="bg-gray-900">Several days</option>
                              <option value="weeks" className="bg-gray-900">Several weeks</option>
                              <option value="months" className="bg-gray-900">Several months</option>
                              <option value="<1year" className="bg-gray-900">Less than 1 year</option>
                              <option value="1-2years" className="bg-gray-900">1-2 years</option>
                              <option value="3-5years" className="bg-gray-900">3-5 years</option>
                              <option value="5+years" className="bg-gray-900">More than 5 years</option>
                              <option value="throughout" className="bg-gray-900">Throughout childhood</option>
                              <option value="ongoing" className="bg-gray-900">Still ongoing</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Protective Factors Section */}
            {currentSection === sections.length - 1 && (
              <div className="space-y-6">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <h3 className="text-white mb-4">
                    Did you have at least one adult who made you feel safe and supported?
                  </h3>
                  
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="protective"
                        checked={answers.protective?.experienced === 'yes'}
                        onChange={() => handleAnswerChange('protective', 'experienced', 'yes')}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-white">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="protective"
                        checked={answers.protective?.experienced === 'no'}
                        onChange={() => handleAnswerChange('protective', 'experienced', 'no')}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-white">No</span>
                    </label>
                  </div>

                  {answers.protective?.experienced === 'yes' && (
                    <div className="mt-4">
                      <label className="block text-sm text-gray-300 mb-2">
                        Who was this person and at what ages were they present?
                      </label>
                      <textarea
                        value={answers.protective?.details || ''}
                        onChange={(e) => handleAnswerChange('protective', 'details', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 transition-colors resize-none"
                        placeholder="e.g., Grandmother, ages 5-12"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-purple-300 text-sm">
                    <strong>Note:</strong> Protective factors can significantly influence neural development and resilience.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="p-6 border-t border-white/10 flex justify-between">
            <button
              onClick={() => {
                if (currentSection === 0 && onBack) {
                  onBack();
                } else {
                  handlePrevious();
                }
              }}
              className="px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300"
            >
              Previous
            </button>

            {currentSection < sections.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={currentSection === 0 && !isBasicInfoValid()}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  currentSection === 0 && !isBasicInfoValid()
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-600/25'
                }`}
              >
                Next Section
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-600/25 transition-all duration-300"
              >
                Generate My Brain Map
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ACEsQuestionnaire;