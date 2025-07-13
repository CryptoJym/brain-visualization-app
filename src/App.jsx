import { useState, useEffect } from 'react'
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
import PersonalizedBrainMap from './components/PersonalizedBrainMap'
import CombinedBrainAnalysis from './components/CombinedBrainAnalysis'
import DemoBrainHighlighting from './components/DemoBrainHighlighting'
import ConversationalAssessment from './components/ConversationalAssessment'
import Mem0AuthForm from './components/Mem0AuthForm'
import Mem0SavedAssessments from './components/Mem0SavedAssessments'
import { analyzeProfessionalTraumaImpact } from './utils/professionalTraumaBrainMapping'
import { mem0Auth, storeUserAssessment } from './lib/mem0-auth'

function App() {
  // Check URL parameter for direct view access
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  // Default to intro view to explain the app
  const initialView = viewParam || 'intro';
  
  const [currentView, setCurrentView] = useState(initialView) // 'intro', 'assessment-choice', 'questionnaire', 'conversational', 'results', 'personalized', 'default', 'combined', 'auth', 'saved'
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  
  console.log('App mounting with view:', initialView, 'from URL param:', viewParam);
  const [assessmentResults, setAssessmentResults] = useState(null)
  const [traumaAnalysis, setTraumaAnalysis] = useState(null)

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    try {
      const currentUser = mem0Auth.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setAuthChecked(true)
    }
  }

  const handleQuestionnaireComplete = async (results) => {
    console.log('Survey completed, results:', results)
    setAssessmentResults(results)
    const analysis = analyzeProfessionalTraumaImpact(results)
    console.log('Analysis generated:', analysis)
    setTraumaAnalysis(analysis)
    
    // Store in Mem0 if user is authenticated
    if (user) {
      const saveResult = await storeUserAssessment(results, analysis)
      console.log('Assessment saved to memory:', saveResult)
    }
    
    // Skip results summary and go straight to brain visualization
    setCurrentView('personalized')
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
              onClick={() => {
                if (user) {
                  setCurrentView('assessment-choice')
                } else {
                  setCurrentView('auth')
                }
              }}
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
          
          {user && (
            <div className="mt-6">
              <button
                onClick={() => setCurrentView('saved')}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                View Your Saved Assessments →
              </button>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-8">
            This tool is for educational purposes only and does not provide medical advice or diagnosis.
          </p>
        </div>
      </div>
    )
  }

  if (currentView === 'assessment-choice') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black flex items-center justify-center">
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-4xl font-light text-white mb-6 text-center">
            Choose Your Assessment Experience
          </h1>
          <p className="text-xl text-gray-300 mb-12 text-center">
            We offer two ways to create your personalized brain map
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Conversation Option */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="mb-6">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium text-white mb-3">AI Conversation</h3>
                <span className="inline-block px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs font-medium mb-4">
                  RECOMMENDED
                </span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Have a natural conversation with our AI counselor. Share your story at your own pace while your brain map updates in real-time. No forms, just supportive dialogue.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Empathetic and supportive
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Live brain visualization
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Your pace, your control
                </li>
              </ul>
              <button
                onClick={() => setCurrentView('conversational')}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
              >
                Start AI Conversation
              </button>
            </div>

            {/* Traditional Questionnaire Option */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10 hover:border-blue-500/50 transition-all">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium text-white mb-3">Traditional Survey</h3>
                <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium mb-4">
                  STRUCTURED
                </span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Complete a comprehensive questionnaire with all standard ACE categories. Clear structure, progress tracking, and immediate results.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Complete in 10-15 minutes
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  All questions visible upfront
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Skip questions as needed
                </li>
              </ul>
              <button
                onClick={() => setCurrentView('questionnaire')}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                Take Traditional Survey
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentView('intro')}
            className="mt-8 mx-auto block text-gray-400 hover:text-white transition-colors"
          >
            ← Back to intro
          </button>
        </div>
      </div>
    )
  }

  if (currentView === 'questionnaire') {
    return <ACEsQuestionnaire 
      onComplete={handleQuestionnaireComplete} 
      onBack={() => setCurrentView('assessment-choice')}
    />
  }

  if (currentView === 'conversational') {
    return <ConversationalAssessment 
      user={user}
      onComplete={handleQuestionnaireComplete}
    />
  }

  if (currentView === 'results') {
    if (!traumaAnalysis || !assessmentResults) {
      console.error('No trauma analysis available in results view')
      // Skip directly to personalized view
      setCurrentView('personalized')
      return null
    }
    
    return (
      <ResultsSummary 
        traumaAnalysis={traumaAnalysis}
        onViewBrain={handleViewBrain}
        onRetakeAssessment={handleRestartAssessment}
      />
    )
  }

  if (currentView === 'personalized') {
    if (!assessmentResults) {
      console.error('No assessment results in personalized view')
      // Redirect to questionnaire
      setCurrentView('questionnaire')
      return null
    }
    
    return (
      <div className="relative">
        <PersonalizedBrainMap surveyResults={assessmentResults} />
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
  
  if (currentView === 'auth') {
    return (
      <Mem0AuthForm 
        onSuccess={(authUser) => {
          setUser(authUser)
          checkAuth() // Refresh user state
          setCurrentView('assessment-choice')
        }}
      />
    )
  }
  
  if (currentView === 'saved') {
    return (
      <Mem0SavedAssessments 
        onSelectAssessment={(savedAssessment) => {
          if (savedAssessment) {
            // Load saved assessment
            if (savedAssessment.assessmentData && savedAssessment.analysis) {
              setAssessmentResults(savedAssessment.assessmentData)
              setTraumaAnalysis(savedAssessment.analysis)
              setCurrentView('personalized')
            } else {
              // Handle legacy format
              setCurrentView('questionnaire')
            }
          } else {
            // Start new assessment
            setCurrentView('questionnaire')
          }
        }}
      />
    )
  }

  return null
}

export default App