import { useState, useEffect, useRef } from 'react'

const InsulaSensing = ({ difficulty, onComplete, onExit }) => {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(150) // 2.5 minutes
  const [currentChallenge, setCurrentChallenge] = useState(null)
  const [userResponse, setUserResponse] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [accuracy, setAccuracy] = useState(100)
  const [streak, setStreak] = useState(0)
  const [bodyMap, setBodyMap] = useState({})
  const startTime = useRef(Date.now())
  
  // Body awareness challenges
  const challenges = {
    heartbeat: {
      name: 'Heartbeat Detection',
      instruction: 'Count your heartbeats for 15 seconds',
      duration: 15000,
      type: 'counting',
      getTarget: () => Math.floor(70 + Math.random() * 30), // 70-100 bpm
      tolerance: (diff) => Math.max(5 - diff, 2),
      icon: '❤️'
    },
    breathing: {
      name: 'Breath Awareness',
      instruction: 'Count your breaths for 30 seconds',
      duration: 30000,
      type: 'counting',
      getTarget: () => Math.floor(12 + Math.random() * 8), // 12-20 per minute
      tolerance: (diff) => Math.max(3 - Math.floor(diff / 2), 1),
      icon: '🫁'
    },
    tension: {
      name: 'Muscle Tension Scan',
      instruction: 'Rate tension in different body parts (0-10)',
      type: 'body_scan',
      parts: ['shoulders', 'neck', 'jaw', 'hands', 'back', 'legs'],
      getTarget: () => ({
        shoulders: Math.floor(Math.random() * 8),
        neck: Math.floor(Math.random() * 8),
        jaw: Math.floor(Math.random() * 8),
        hands: Math.floor(Math.random() * 8),
        back: Math.floor(Math.random() * 8),
        legs: Math.floor(Math.random() * 8)
      }),
      icon: '💪'
    },
    temperature: {
      name: 'Temperature Sensing',
      instruction: 'Identify which hand feels warmer',
      type: 'comparison',
      options: ['left', 'right', 'same'],
      getTarget: () => ['left', 'right', 'same'][Math.floor(Math.random() * 3)],
      icon: '🌡️'
    },
    hunger: {
      name: 'Hunger Level',
      instruction: 'Rate your hunger from 0 (full) to 10 (starving)',
      type: 'scale',
      min: 0,
      max: 10,
      getTarget: () => Math.floor(Math.random() * 11),
      tolerance: (diff) => Math.max(3 - Math.floor(diff / 2), 1),
      icon: '🍽️'
    },
    balance: {
      name: 'Balance Challenge',
      instruction: 'Stand on one foot and maintain balance',
      type: 'timed',
      duration: 30000,
      getTarget: () => Math.floor(15 + Math.random() * 15), // 15-30 seconds
      tolerance: (diff) => Math.max(5 - diff, 2),
      icon: '🧘'
    }
  }

  // Interoceptive accuracy games
  const miniGames = {
    pulse: {
      name: 'Pulse Match',
      instruction: 'Tap when you feel your heartbeat',
      evaluate: (taps, actualBPM) => {
        const avgInterval = taps.length > 1 
          ? taps.reduce((sum, tap, i) => i > 0 ? sum + (tap - taps[i-1]) : sum, 0) / (taps.length - 1)
          : 0
        const expectedInterval = 60000 / actualBPM
        const accuracy = 100 - Math.abs(avgInterval - expectedInterval) / expectedInterval * 100
        return Math.max(0, Math.min(100, accuracy))
      }
    },
    breathSync: {
      name: 'Breath Synchronization',
      instruction: 'Match your breathing to the visual guide',
      phases: ['inhale', 'hold', 'exhale', 'hold'],
      duration: [4000, 4000, 4000, 4000]
    }
  }

  // Initialize challenge
  useEffect(() => {
    nextChallenge()
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

  const nextChallenge = () => {
    const challengeKeys = Object.keys(challenges)
    const key = challengeKeys[Math.floor(Math.random() * challengeKeys.length)]
    const challenge = { 
      ...challenges[key], 
      key,
      target: challenges[key].getTarget ? challenges[key].getTarget() : null,
      startTime: Date.now()
    }
    
    setCurrentChallenge(challenge)
    setUserResponse(null)
    setBodyMap({})
  }

  const handleCountingSubmit = (count) => {
    if (!currentChallenge || currentChallenge.type !== 'counting') return
    
    const difference = Math.abs(count - currentChallenge.target)
    const tolerance = currentChallenge.tolerance(difficulty)
    
    if (difference <= tolerance) {
      const accuracyScore = 100 - (difference / currentChallenge.target * 100)
      const points = Math.floor(100 * (accuracyScore / 100) * (1 + streak * 0.1))
      
      setScore(prev => prev + points)
      setAccuracy(prev => (prev * 0.9 + accuracyScore * 0.1))
      setStreak(prev => prev + 1)
      setFeedback(`Excellent! Within ${tolerance} of actual. +${points} points!`)
    } else {
      setStreak(0)
      setFeedback(`Not quite. Actual was ${currentChallenge.target}. Keep practicing!`)
    }
    
    setTimeout(() => {
      setFeedback('')
      nextChallenge()
    }, 2000)
  }

  const handleBodyScanSubmit = () => {
    if (!currentChallenge || currentChallenge.type !== 'body_scan') return
    
    let totalDifference = 0
    let scannedParts = 0
    
    currentChallenge.parts.forEach(part => {
      if (bodyMap[part] !== undefined) {
        totalDifference += Math.abs(bodyMap[part] - currentChallenge.target[part])
        scannedParts++
      }
    })
    
    if (scannedParts === currentChallenge.parts.length) {
      const avgDifference = totalDifference / scannedParts
      const accuracyScore = Math.max(0, 100 - avgDifference * 10)
      const points = Math.floor(150 * (accuracyScore / 100) * (1 + streak * 0.1))
      
      setScore(prev => prev + points)
      setAccuracy(prev => (prev * 0.9 + accuracyScore * 0.1))
      
      if (avgDifference < 2) {
        setStreak(prev => prev + 1)
        setFeedback(`Great body awareness! Average difference: ${avgDifference.toFixed(1)}`)
      } else {
        setStreak(0)
        setFeedback(`Keep practicing. Try to tune in more closely.`)
      }
      
      setTimeout(() => {
        setFeedback('')
        nextChallenge()
      }, 2000)
    }
  }

  const handleComparisonSubmit = (choice) => {
    if (!currentChallenge || currentChallenge.type !== 'comparison') return
    
    if (choice === currentChallenge.target) {
      const points = Math.floor(80 * (1 + streak * 0.1))
      setScore(prev => prev + points)
      setStreak(prev => prev + 1)
      setFeedback(`Correct! Your interoception is sharp! +${points}`)
    } else {
      setStreak(0)
      setFeedback(`Not quite. The answer was: ${currentChallenge.target}`)
    }
    
    setTimeout(() => {
      setFeedback('')
      nextChallenge()
    }, 2000)
  }

  const renderChallenge = () => {
    if (!currentChallenge) return null
    
    switch (currentChallenge.type) {
      case 'counting':
        return (
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">{currentChallenge.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-4">{currentChallenge.name}</h3>
            <p className="text-lg text-gray-300 mb-6">{currentChallenge.instruction}</p>
            
            {/* Counting interface */}
            <div className="bg-white/10 rounded-lg p-6 mb-6">
              <div className="text-4xl font-bold text-cyan-400 mb-4">
                {userResponse || 0}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setUserResponse((prev || 0) - 1)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white text-2xl transition-all"
                >
                  -
                </button>
                <button
                  onClick={() => handleCountingSubmit(userResponse || 0)}
                  className="p-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-semibold transition-all"
                >
                  Submit
                </button>
                <button
                  onClick={() => setUserResponse((prev || 0) + 1)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white text-2xl transition-all"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Timer for counting challenges */}
            {currentChallenge.duration && (
              <div className="text-gray-400">
                Time remaining: {Math.max(0, Math.floor((currentChallenge.duration - (Date.now() - currentChallenge.startTime)) / 1000))}s
              </div>
            )}
          </div>
        )
        
      case 'body_scan':
        return (
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-4">{currentChallenge.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-4">{currentChallenge.name}</h3>
            <p className="text-lg text-gray-300 mb-6">{currentChallenge.instruction}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {currentChallenge.parts.map(part => (
                <div key={part} className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2 capitalize">{part}</h4>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={bodyMap[part] || 5}
                    onChange={(e) => setBodyMap({ ...bodyMap, [part]: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-cyan-400 font-bold mt-1">{bodyMap[part] || 5}</div>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleBodyScanSubmit}
              disabled={Object.keys(bodyMap).length < currentChallenge.parts.length}
              className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 rounded-lg text-white font-semibold transition-all"
            >
              Submit Scan
            </button>
          </div>
        )
        
      case 'comparison':
        return (
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">{currentChallenge.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-4">{currentChallenge.name}</h3>
            <p className="text-lg text-gray-300 mb-6">{currentChallenge.instruction}</p>
            
            <div className="grid grid-cols-3 gap-4">
              {currentChallenge.options.map(option => (
                <button
                  key={option}
                  onClick={() => handleComparisonSubmit(option)}
                  className="p-6 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold capitalize transition-all"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )
        
      case 'scale':
        return (
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">{currentChallenge.icon}</div>
            <h3 className="text-2xl font-bold text-white mb-4">{currentChallenge.name}</h3>
            <p className="text-lg text-gray-300 mb-6">{currentChallenge.instruction}</p>
            
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-4xl font-bold text-cyan-400 mb-4">
                {userResponse || Math.floor((currentChallenge.min + currentChallenge.max) / 2)}
              </div>
              <input
                type="range"
                min={currentChallenge.min}
                max={currentChallenge.max}
                value={userResponse || Math.floor((currentChallenge.min + currentChallenge.max) / 2)}
                onChange={(e) => setUserResponse(parseInt(e.target.value))}
                className="w-full mb-4"
              />
              <div className="flex justify-between text-sm text-gray-400 mb-4">
                <span>{currentChallenge.min}</span>
                <span>{currentChallenge.max}</span>
              </div>
              <button
                onClick={() => {
                  const difference = Math.abs(userResponse - currentChallenge.target)
                  const tolerance = currentChallenge.tolerance(difficulty)
                  
                  if (difference <= tolerance) {
                    const points = Math.floor(100 * (1 - difference / currentChallenge.max) * (1 + streak * 0.1))
                    setScore(prev => prev + points)
                    setStreak(prev => prev + 1)
                    setFeedback(`Good sensing! +${points}`)
                  } else {
                    setStreak(0)
                    setFeedback(`Keep practicing your interoception.`)
                  }
                  
                  setTimeout(() => {
                    setFeedback('')
                    nextChallenge()
                  }, 2000)
                }}
                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-semibold transition-all"
              >
                Submit
              </button>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-cyan-900/20 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold text-white">Insula Sensing</h2>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{score}</div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{Math.round(accuracy)}%</div>
                <div className="text-xs text-gray-400">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">🔥{streak}</div>
                <div className="text-xs text-gray-400">Streak</div>
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
        {renderChallenge()}
      </div>
      
      {/* Feedback */}
      {feedback && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur rounded-lg px-6 py-3">
          <p className="text-lg font-semibold text-white">{feedback}</p>
        </div>
      )}
      
      {/* Tips */}
      <div className="absolute bottom-4 left-4 right-4 bg-cyan-600/20 rounded-lg p-3 text-center">
        <p className="text-sm text-cyan-300">
          💡 The insula connects body sensations to emotions. Better interoception = better emotional awareness!
        </p>
      </div>
    </div>
  )
}

export default InsulaSensing