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
              <div key={idx} className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/20 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl text-white font-medium mb-2">
                      {impact.region.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <p className="text-gray-300">{impact.mainEffect}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-light text-orange-400">
                      {impact.severity}/10
                    </div>
                    <p className="text-xs text-gray-500">Severity</p>
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

        {/* Understanding Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-12">
          <h2 className="text-2xl font-light text-white mb-4">Understanding Your Results</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              These results are based on extensive neuroscience research showing how adverse childhood 
              experiences can influence brain development. The affected regions and severity levels 
              indicate areas where your neural pathways may have adapted to cope with challenging experiences.
            </p>
            <p>
              <strong className="text-white">Important:</strong> The brain's neuroplasticity means these 
              patterns can change. Many people with similar experiences have developed remarkable resilience 
              and unique strengths as a result of their adaptations.
            </p>
            <p>
              This visualization is for educational purposes and should not replace professional mental 
              health assessment or treatment.
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