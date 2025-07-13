import { useState, useEffect, useRef } from 'react'

const AmygdalaBalance = ({ difficulty, onComplete, onExit }) => {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  const [currentScenario, setCurrentScenario] = useState(null)
  const [emotionalState, setEmotionalState] = useState(50) // 0-100 scale
  const [heartRate, setHeartRate] = useState(70)
  const [breathingPhase, setBreathingPhase] = useState('inhale')
  const [feedback, setFeedback] = useState('')
  const [combo, setCombo] = useState(0)
  const startTime = useRef(Date.now())
  const breathingInterval = useRef(null)
  
  // Emotional regulation scenarios
  const scenarios = {
    stress: {
      name: 'Stress Response',
      description: 'A deadline is approaching fast',
      triggers: [
        'Your project is due in 2 hours',
        'Multiple urgent emails arrive',
        'Technical difficulties arise',
        'Team member calls in sick'
      ],
      targetZone: [40, 60],
      icon: '😰'
    },
    anger: {
      name: 'Anger Management',
      description: 'Someone cuts you off in traffic',
      triggers: [
        'Driver honks aggressively',
        'Nearly causes an accident',
        'Makes rude gesture',
        'Speeds away recklessly'
      ],
      targetZone: [30, 50],
      icon: '😤'
    },
    anxiety: {
      name: 'Anxiety Control',
      description: 'Public speaking event',
      triggers: [
        'Large audience waiting',
        'Microphone feedback screech',
        'Forgot your notes',
        'Important people watching'
      ],
      targetZone: [35, 55],
      icon: '😟'
    },
    fear: {
      name: 'Fear Response',
      description: 'Walking alone at night',
      triggers: [
        'Footsteps behind you',
        'Dark alley ahead',
        'Strange noise nearby',
        'Shadow moves suddenly'
      ],
      targetZone: [45, 65],
      icon: '😨'
    }
  }

  // Coping techniques
  const techniques = {
    breathing: {
      name: 'Deep Breathing',
      instruction: 'Follow the breathing guide',
      effectiveness: 0.8,
      icon: '🫁'
    },
    grounding: {
      name: '5-4-3-2-1 Grounding',
      instruction: 'Name 5 things you see, 4 you hear...',
      effectiveness: 0.7,
      icon: '🌍'
    },
    reframe: {
      name: 'Cognitive Reframing',
      instruction: 'Think of a positive interpretation',
      effectiveness: 0.9,
      icon: '🔄'
    },
    muscle: {
      name: 'Progressive Relaxation',
      instruction: 'Tense and release muscle groups',
      effectiveness: 0.75,
      icon: '💪'
    }
  }

  // Initialize scenario
  useEffect(() => {
    nextScenario()
  }, [difficulty])

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const duration = Math.floor((Date.now() - startTime.current) / 1000)
          onComplete(score, duration)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [score, onComplete])

  // Emotional state fluctuation
  useEffect(() => {
    if (!currentScenario) return
    
    const interval = setInterval(() => {
      // Simulate emotional arousal based on scenario
      setEmotionalState(prev => {
        const drift = (Math.random() - 0.5) * (difficulty + 2)
        const newState = prev + drift
        
        // Update heart rate based on emotional state
        setHeartRate(70 + Math.floor(newState * 0.5))
        
        // Check if in target zone
        const [min, max] = currentScenario.targetZone
        if (newState >= min && newState <= max) {
          setScore(prev => prev + 10)
        }
        
        return Math.max(0, Math.min(100, newState))
      })
    }, 500)
    
    return () => clearInterval(interval)
  }, [currentScenario, difficulty])

  // Breathing animation
  useEffect(() => {
    breathingInterval.current = setInterval(() => {
      setBreathingPhase(prev => {
        switch (prev) {
          case 'inhale': return 'hold1'
          case 'hold1': return 'exhale'
          case 'exhale': return 'hold2'
          case 'hold2': return 'inhale'
          default: return 'inhale'
        }
      })
    }, 1000)
    
    return () => clearInterval(breathingInterval.current)
  }, [])

  const nextScenario = () => {
    const scenarioKeys = Object.keys(scenarios)
    const key = scenarioKeys[Math.floor(Math.random() * scenarioKeys.length)]
    const scenario = { ...scenarios[key], key }
    
    // Add random trigger
    const trigger = scenario.triggers[Math.floor(Math.random() * scenario.triggers.length)]
    scenario.currentTrigger = trigger
    
    setCurrentScenario(scenario)
    setEmotionalState(70 + Math.random() * 20) // Start elevated
    setFeedback(`New scenario: ${scenario.name}`)
    
    setTimeout(() => setFeedback(''), 2000)
  }

  const applyTechnique = (technique) => {
    const effect = techniques[technique].effectiveness * (20 + Math.random() * 10)
    
    setEmotionalState(prev => {
      const newState = prev - effect
      const [min, max] = currentScenario.targetZone
      
      if (newState >= min && newState <= max) {
        const points = Math.floor(100 * techniques[technique].effectiveness * (1 + combo * 0.1))
        setScore(prev => prev + points)
        setCombo(prev => prev + 1)
        setFeedback(`Excellent! ${techniques[technique].name} is working! +${points}`)
        
        // Move to next scenario after success
        setTimeout(() => {
          nextScenario()
        }, 2000)
      } else if (newState < min) {
        setFeedback('Good, but you\'re too calm now. Find balance.')
        setCombo(0)
      } else {
        setFeedback('Keep going, you\'re making progress!')
      }
      
      return Math.max(0, Math.min(100, newState))
    })
    
    setTimeout(() => setFeedback(''), 2000)
  }

  const getStateColor = () => {
    if (!currentScenario) return '#ffffff'
    
    const [min, max] = currentScenario.targetZone
    if (emotionalState >= min && emotionalState <= max) {
      return '#00ff00' // Green - in target zone
    } else if (emotionalState > max) {
      return '#ff0000' // Red - too high
    } else {
      return '#0088ff' // Blue - too low
    }
  }

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe In... 4'
      case 'hold1': return 'Hold... 4'
      case 'exhale': return 'Breathe Out... 4'
      case 'hold2': return 'Hold... 4'
      default: return ''
    }
  }

  if (!currentScenario) return null

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-orange-900/20 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold text-white">Amygdala Balance</h2>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{score}</div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">❤️ {heartRate}</div>
                <div className="text-xs text-gray-400">BPM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-400">Time</div>
              </div>
            </div>
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
          >
            Exit Game
          </button>
        </div>
      </div>
      
      {/* Game area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full space-y-6">
          {/* Scenario display */}
          <div className="text-center">
            <div className="text-6xl mb-4">{currentScenario.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-2">{currentScenario.name}</h3>
            <p className="text-lg text-gray-300 mb-2">{currentScenario.description}</p>
            <p className="text-xl text-orange-400 font-semibold">{currentScenario.currentTrigger}</p>
          </div>
          
          {/* Emotional state meter */}
          <div className="bg-white/10 rounded-lg p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Emotional Arousal</span>
              <span className="text-white font-bold">{Math.round(emotionalState)}%</span>
            </div>
            <div className="relative h-8 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 transition-all duration-500"
                style={{ 
                  width: `${emotionalState}%`,
                  backgroundColor: getStateColor()
                }}
              />
              {/* Target zone indicator */}
              <div 
                className="absolute inset-y-0 bg-green-500/30 border-l-2 border-r-2 border-green-500"
                style={{ 
                  left: `${currentScenario.targetZone[0]}%`,
                  width: `${currentScenario.targetZone[1] - currentScenario.targetZone[0]}%`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Calm</span>
              <span className="text-green-400">Target Zone</span>
              <span>Overwhelmed</span>
            </div>
          </div>
          
          {/* Breathing guide */}
          <div className="bg-purple-600/20 rounded-lg p-4 text-center">
            <div className="text-lg text-purple-400 mb-2">Breathing Guide</div>
            <div className="relative h-24 flex items-center justify-center">
              <div 
                className={`w-16 h-16 bg-purple-500 rounded-full transition-all duration-1000 ${
                  breathingPhase === 'inhale' ? 'scale-125' : 
                  breathingPhase === 'exhale' ? 'scale-75' : 'scale-100'
                }`}
              />
              <div className="absolute text-white font-bold">
                {getBreathingInstruction()}
              </div>
            </div>
          </div>
          
          {/* Coping techniques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(techniques).map(([key, technique]) => (
              <button
                key={key}
                onClick={() => applyTechnique(key)}
                className="bg-white/10 hover:bg-white/20 rounded-lg p-4 transition-all"
              >
                <div className="text-3xl mb-2">{technique.icon}</div>
                <div className="text-sm font-semibold text-white">{technique.name}</div>
                <div className="text-xs text-gray-400 mt-1">{technique.instruction}</div>
              </button>
            ))}
          </div>
          
          {/* Combo indicator */}
          {combo > 0 && (
            <div className="text-center">
              <span className="text-lg font-bold text-orange-400">
                Combo x{combo} 🔥
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Feedback */}
      {feedback && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur rounded-lg px-6 py-3">
          <p className="text-lg font-semibold text-white">{feedback}</p>
        </div>
      )}
      
      {/* Tips */}
      <div className="absolute bottom-4 left-4 right-4 bg-orange-600/20 rounded-lg p-3 text-center">
        <p className="text-sm text-orange-300">
          💡 Keep your emotional arousal in the green target zone for maximum points!
        </p>
      </div>
    </div>
  )
}

export default AmygdalaBalance