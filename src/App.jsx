import { useState } from 'react'
import BrainVisualization from './components/BrainVisualization'
import ACEsQuestionnaire from './components/ACEsQuestionnaire'
import ResultsSummary from './components/ResultsSummary'
import RaveThreeBrain from './components/RaveThreeBrain'
import AdvancedRAVEBrain from './components/AdvancedRAVEBrain'
import TestBrain from './components/TestBrain'
import SimplifiedBrain from './components/SimplifiedBrain'
import AnatomicallyAccurateBrain from './components/AnatomicallyAccurateBrain'
import NiiVueBrain from './components/NiiVueBrain'
import RealBrainViewer from './components/RealBrainViewer'
import IntegratedBrainSurvey from './components/IntegratedBrainSurvey'
import CombinedBrainAnalysis from './components/CombinedBrainAnalysis'
import DemoBrainHighlighting from './components/DemoBrainHighlighting'
import { analyzeProfessionalTraumaImpact } from './utils/professionalTraumaBrainMapping'

function App() {
  // Check URL parameter for direct view access
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  // Default to intro view to explain the app
  const initialView = viewParam || 'intro';
  
  const [currentView, setCurrentView] = useState(initialView) // 'intro', 'questionnaire', 'results', 'personalized', 'default', 'combined'
  
  console.log('App mounting with view:', initialView, 'from URL param:', viewParam);
  const [assessmentResults, setAssessmentResults] = useState(null)
  const [traumaAnalysis, setTraumaAnalysis] = useState(null)

  const handleQuestionnaireComplete = (results) => {
    setAssessmentResults(results)
    const analysis = analyzeProfessionalTraumaImpact(results)
    setTraumaAnalysis(analysis)
    setCurrentView('results')
  }

  const handleSkipQuestionnaire = () => {
    setCurrentView('default')
  }

  const handleRestartAssessment = () => {
    setAssessmentResults(null)
    setTraumaAnalysis(null)
    setCurrentView('questionnaire')
  }

  const handleViewBrain = () => {
    setCurrentView('personalized')
  }

  if (currentView === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black flex items-center justify-center">
        <div className="max-w-3xl mx-auto p-8 text-center">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-wide">
            Understanding Your Neural Story
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Explore how life experiences shape brain development through an interactive 3D visualization 
            based on cutting-edge neuroscience research.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-medium mb-2">🧠 Automatic Brain Highlighting</h3>
              <p className="text-gray-300 text-sm">
                Complete our trauma assessment and watch as affected brain regions automatically light up based on your responses
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-medium mb-2">📊 EEG Integration Ready</h3>
              <p className="text-gray-300 text-sm">
                Connect your Neurable MW75 headphones to add real-time brain activity data to your personalized analysis
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-medium mb-2">🎯 See Demo First</h3>
              <p className="text-gray-300 text-sm">
                View an example of how trauma impacts are visualized with automatic region highlighting
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentView('questionnaire')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-300 transform hover:scale-105"
            >
              Start Personalized Assessment
            </button>
            <button
              onClick={handleSkipQuestionnaire}
              className="px-8 py-4 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 backdrop-blur"
            >
              View Demo
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-8">
            This tool is for educational purposes only and does not provide medical advice or diagnosis.
          </p>
        </div>
      </div>
    )
  }

  if (currentView === 'questionnaire') {
    return <ACEsQuestionnaire 
      onComplete={handleQuestionnaireComplete} 
      onBack={() => setCurrentView('intro')}
    />
  }

  if (currentView === 'results' && traumaAnalysis) {
    return (
      <ResultsSummary 
        traumaAnalysis={traumaAnalysis}
        onViewBrain={handleViewBrain}
        onRetakeAssessment={handleRestartAssessment}
      />
    )
  }

  if (currentView === 'personalized' && assessmentResults) {
    return (
      <div className="relative">
        <IntegratedBrainSurvey surveyResults={assessmentResults} />
        <button
          onClick={() => setCurrentView('combined')}
          className="fixed bottom-6 left-6 z-30 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all duration-300"
        >
          Add EEG Analysis
        </button>
        <button
          onClick={handleRestartAssessment}
          className="fixed bottom-6 right-6 z-30 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 backdrop-blur"
        >
          Retake Assessment
        </button>
      </div>
    )
  }
  
  if (currentView === 'combined' && assessmentResults) {
    return (
      <div className="relative h-screen">
        <CombinedBrainAnalysis surveyResults={assessmentResults} />
        <button
          onClick={() => setCurrentView('personalized')}
          className="fixed bottom-6 left-6 z-30 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 backdrop-blur"
        >
          Back to Survey View
        </button>
        <button
          onClick={handleRestartAssessment}
          className="fixed bottom-6 right-6 z-30 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300 backdrop-blur"
        >
          Retake Assessment
        </button>
      </div>
    )
  }

  if (currentView === 'default') {
    return (
      <div className="relative">
        <DemoBrainHighlighting />
        <button
          onClick={() => setCurrentView('questionnaire')}
          className="fixed top-6 right-6 z-30 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-300"
        >
          Take Real Assessment
        </button>
      </div>
    )
  }

  return null
}

export default App