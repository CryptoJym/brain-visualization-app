import React from 'react';

const ResultsSummary = ({ traumaAnalysis, onViewBrain, onRetakeAssessment }) => {
  const { brainImpacts, summary, recommendations } = traumaAnalysis;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-4">
            Your Neural Development Analysis
          </h1>
          <p className="text-xl text-gray-300">
            Based on your responses, here's how your experiences may have shaped your brain
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="text-center">
              <div className="text-4xl font-light text-white mb-2">
                {summary.totalRegionsAffected}
              </div>
              <p className="text-gray-400">Brain Regions Affected</p>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="text-center">
              <div className={`text-4xl font-light mb-2 ${
                summary.severityLevel === 'severe' ? 'text-red-400' : 
                summary.severityLevel === 'moderate' ? 'text-orange-400' : 
                'text-yellow-400'
              }`}>
                {summary.severityLevel.toUpperCase()}
              </div>
              <p className="text-gray-400">Overall Impact Level</p>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="text-center">
              <div className="text-4xl font-light text-white mb-2">
                {recommendations.length}
              </div>
              <p className="text-gray-400">Personalized Recommendations</p>
            </div>
          </div>
        </div>

        {/* Primary Impacts */}
        <div className="mb-12">
          <h2 className="text-2xl font-light text-white mb-6">Primary Neural Impacts</h2>
          <div className="space-y-4">
            {summary.primaryImpacts.map((impact, idx) => (
              <div key={idx} className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl text-white font-medium mb-2">
                      {impact.region}
                    </h3>
                    <p className="text-gray-300 mb-3">{impact.mainEffect}</p>
                    <div className="flex flex-wrap gap-2">
                      {impact.ageRanges.map((age, ageIdx) => (
                        <span key={ageIdx} className="text-xs px-3 py-1 bg-white/10 rounded-full text-gray-400">
                          Ages {age}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <div className="text-2xl font-light text-purple-400">
                      {impact.traumaCount}
                    </div>
                    <p className="text-xs text-gray-500">Trauma{impact.traumaCount > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-12">
          <h2 className="text-2xl font-light text-white mb-6">Personalized Recommendations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className={`rounded-xl border p-6 ${
                rec.priority === 'high' 
                  ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20' 
                  : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20'
              }`}>
                <div className="flex items-start gap-4">
                  <div className="text-2xl">
                    {rec.type === 'therapy' ? '🧠' : 
                     rec.type === 'lifestyle' ? '🌱' : 
                     '🎯'}
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">
                      {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                    </h3>
                    <p className="text-gray-300 text-sm">{rec.suggestion}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Priority: {rec.priority}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Developmental Periods */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-12">
          <h2 className="text-2xl font-light text-white mb-6">Developmental Periods Affected</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(summary.criticalPeriods).map(([period, affected]) => (
              <div key={period} className={`rounded-lg p-4 border ${
                affected ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10'
              }`}>
                <h3 className="text-white font-medium mb-2">
                  {period === 'earlyChildhood' ? 'Early Childhood (0-6)' :
                   period === 'middleChildhood' ? 'Middle Childhood (7-12)' :
                   period === 'adolescence' ? 'Adolescence (13-18)' :
                   'Chronic/Throughout'}
                </h3>
                <p className="text-sm text-gray-400">
                  {affected ? 
                    `ACEs during this period: ${summary.acesByAge[
                      period === 'earlyChildhood' ? '0-3' : 
                      period === 'middleChildhood' ? '7-9' : 
                      period === 'adolescence' ? '13-15' : 
                      'throughout'
                    ]?.length || 0}` : 
                    'No reported ACEs'
                  }
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Understanding Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-12">
          <h2 className="text-2xl font-light text-white mb-4">Understanding Your Results</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              Your assessment shows <strong className="text-white">{summary.totalACEs} Adverse Childhood Experiences</strong> affecting
              <strong className="text-white"> {summary.totalRegionsAffected} brain regions</strong>. Each experience and its timing 
              influences brain development differently, as different regions mature at different ages.
            </p>
            <p>
              <strong className="text-white">Important:</strong> This is not a severity scale or diagnosis. The number of ACEs 
              and affected regions simply indicates areas where your brain adapted to your environment. These adaptations were 
              protective at the time and may have developed into unique strengths.
            </p>
            <p>
              The brain's neuroplasticity means these patterns can continue to change throughout life. Many people with 
              similar experiences develop remarkable resilience through supportive relationships, therapy, and self-care practices.
            </p>
            <p className="text-sm italic">
              This visualization is for educational purposes and should not replace professional mental health assessment or treatment.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onViewBrain}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-300 transform hover:scale-105"
          >
            View My 3D Brain Map
          </button>
          <button
            onClick={onRetakeAssessment}
            className="px-8 py-4 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 backdrop-blur"
          >
            Retake Assessment
          </button>
        </div>

        {/* Resources */}
        <div className="mt-16 p-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20">
          <h3 className="text-xl font-light text-white mb-4">Additional Resources</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="text-indigo-400 font-medium mb-2">Crisis Support</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• National Suicide Prevention Lifeline: 988</li>
                <li>• Crisis Text Line: Text HOME to 741741</li>
                <li>• SAMHSA National Helpline: 1-800-662-4357</li>
              </ul>
            </div>
            <div>
              <h4 className="text-purple-400 font-medium mb-2">Learn More</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• ACEs research: acestoohigh.com</li>
                <li>• Trauma-informed care: traumainformedcare.org</li>
                <li>• Neuroplasticity: brainhq.com</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSummary;