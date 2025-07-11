import { useState } from 'react'
import BrainVisualization from './components/BrainVisualization'
import ACEsQuestionnaire from './components/ACEsQuestionnaire'
import ResponsivePersonalizedBrain from './components/ResponsivePersonalizedBrain'
import ResultsSummary from './components/ResultsSummary'
import ResponsiveBrainVis from './components/ResponsiveBrainVis'
import CleanBrainVis from './components/CleanBrainVis'
import { analyzeTraumaImpact } from './utils/traumaBrainMapping'

function App() {
  const [currentView, setCurrentView] = useState('intro') // 'intro', 'questionnaire', 'results', 'personalized', 'default'
  const [assessmentResults, setAssessmentResults] = useState(null)
  const [traumaAnalysis, setTraumaAnalysis] = useState(null)

  const handleQuestionnaireComplete = (results) => {
    setAssessmentResults(results)
    const analysis = analyzeTraumaImpact(results)
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
              <h3 className="text-white font-medium mb-2">Personalized Experience</h3>
              <p className="text-gray-300 text-sm">
                Take a confidential assessment to see how specific experiences may have influenced your unique neural development
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-medium mb-2">General Exploration</h3>
              <p className="text-gray-300 text-sm">
                Skip the assessment and explore how trauma generally affects brain regions and pathways
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
              Explore General Model
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
        <ResponsivePersonalizedBrain assessmentResults={assessmentResults} />
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
        <ResponsiveBrainVis />
        <button
          onClick={() => setCurrentView('questionnaire')}
          className="fixed bottom-6 right-6 z-30 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-300"
        >
          Take Assessment
        </button>
      </div>
    )
  }

  return null
}

export default App