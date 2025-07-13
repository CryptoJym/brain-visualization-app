import { useState, useEffect, useRef } from 'react'

const CingulateControl = ({ difficulty, onComplete, onExit }) => {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes
  const [currentTask, setCurrentTask] = useState(null)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [accuracy, setAccuracy] = useState(100)
  const [reactionTimes, setReactionTimes] = useState([])
  const [focusLevel, setFocusLevel] = useState(100)
  const [distractions, setDistractions] = useState([])
  const startTime = useRef(Date.now())
  const taskStartTime = useRef(null)
  
  // Attention training tasks
  const tasks = {
    stroop: {
      name: 'Stroop Task',
      instruction: 'Name the COLOR of the text, not the word',
      generate: (diff) => {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
        const word = colors[Math.floor(Math.random() * colors.length)]
        const color = colors[Math.floor(Math.random() * colors.length)]
        const congruent = Math.random() > (0.3 + diff * 0.05) // More incongruent with difficulty
        
        return {
          type: 'stroop',
          word: congruent ? color : word,
          color: color,
          correctAnswer: color
        }
      }
    },
    flanker: {
      name: 'Flanker Task',
      instruction: 'Focus on the CENTER arrow direction',
      generate: (diff) => {
        const directions = ['←', '→']
        const center = directions[Math.floor(Math.random() * 2)]
        const congruent = Math.random() > (0.4 + diff * 0.05)
        const flankers = congruent ? center : directions[1 - directions.indexOf(center)]
        
        return {
          type: 'flanker',
          display: `${flankers}${flankers}${center}${flankers}${flankers}`,
          correctAnswer: center === '→' ? 'right' : 'left'
        }
      }
    },
    nback: {
      name: 'N-Back Task',
      instruction: 'Does this match what you saw N steps ago?',
      generate: (diff) => {
        const n = Math.min(1 + Math.floor(diff / 3), 3) // 1-back to 3-back
        const items = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        const sequence = []
        
        // Generate sequence
        for (let i = 0; i < n + 5; i++) {
          if (i >= n && Math.random() > 0.7) {
            // Create a match
            sequence.push(sequence[i - n])
          } else {
            sequence.push(items[Math.floor(Math.random() * items.length)])
          }
        }
        
        return {
          type: 'nback',
          n: n,
          sequence: sequence,
          currentIndex: n,
          correctAnswer: sequence[n] === sequence[0] ? 'match' : 'no match'
        }
      }
    },
    sustained: {
      name: 'Sustained Attention',
      instruction: 'Press SPACE when you see the target',
      generate: (diff) => {
        const shapes = ['circle', 'square', 'triangle', 'hexagon', 'star']
        const target = shapes[0]
        const isTarget = Math.random() > 0.7
        
        return {
          type: 'sustained',
          shape: isTarget ? target : shapes[Math.floor(Math.random() * (shapes.length - 1)) + 1],
          isTarget: isTarget,
          displayTime: Math.max(500 - diff * 50, 200)
        }
      }
    },
    divided: {
      name: 'Divided Attention',
      instruction: 'Monitor BOTH the number and the position',
      generate: (diff) => {
        const positions = ['top', 'bottom', 'left', 'right']
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        
        return {
          type: 'divided',
          number: numbers[Math.floor(Math.random() * numbers.length)],
          position: positions[Math.floor(Math.random() * positions.length)],
          question: Math.random() > 0.5 ? 'odd/even' : 'position',
          correctAnswer: null // Calculate based on question
        }
      }
    }
  }

  // Generate distractions
  useEffect(() => {
    if (difficulty > 3) {
      const interval = setInterval(() => {
        const newDistraction = {
          id: Date.now(),
          type: ['flash', 'sound', 'movement'][Math.floor(Math.random() * 3)],
          duration: 1000
        }
        setDistractions(prev => [...prev, newDistraction])
        
        // Remove distraction after duration
        setTimeout(() => {
          setDistractions(prev => prev.filter(d => d.id !== newDistraction.id))
        }, newDistraction.duration)
        
        // Reduce focus when distracted
        setFocusLevel(prev => Math.max(0, prev - 10))
      }, Math.max(5000 - difficulty * 500, 2000))
      
      return () => clearInterval(interval)
    }
  }, [difficulty])

  // Focus recovery
  useEffect(() => {
    const interval = setInterval(() => {
      setFocusLevel(prev => Math.min(100, prev + 2))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Initialize task
  useEffect(() => {
    nextTask()
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

  const nextTask = () => {
    const taskTypes = Object.keys(tasks)
    const type = taskTypes[Math.floor(Math.random() * taskTypes.length)]
    const task = tasks[type].generate(difficulty)
    
    // Calculate correct answer for divided attention
    if (task.type === 'divided') {
      if (task.question === 'odd/even') {
        task.correctAnswer = task.number % 2 === 0 ? 'even' : 'odd'
      } else {
        task.correctAnswer = task.position
      }
    }
    
    setCurrentTask({ ...task, name: tasks[type].name, instruction: tasks[type].instruction })
    taskStartTime.current = Date.now()
    setUserInput('')
  }

  const handleResponse = (response) => {
    if (!currentTask) return
    
    const reactionTime = Date.now() - taskStartTime.current
    const isCorrect = response === currentTask.correctAnswer
    
    if (isCorrect) {
      const speedBonus = Math.max(0, 100 - reactionTime / 20)
      const focusBonus = focusLevel / 100
      const points = Math.floor((100 + speedBonus) * focusBonus)
      
      setScore(prev => prev + points)
      setReactionTimes(prev => [...prev, reactionTime])
      setAccuracy(prev => (prev * 0.95 + 100 * 0.05))
      setFeedback(`Correct! RT: ${reactionTime}ms +${points}`)
    } else {
      setAccuracy(prev => prev * 0.95)
      setFeedback(`Incorrect. The answer was: ${currentTask.correctAnswer}`)
    }
    
    setTimeout(() => {
      setFeedback('')
      nextTask()
    }, 1000)
  }

  const getColorStyle = (color) => {
    const colorMap = {
      red: '#ff0000',
      blue: '#0000ff',
      green: '#00ff00',
      yellow: '#ffff00',
      purple: '#ff00ff',
      orange: '#ff8800'
    }
    return colorMap[color] || '#ffffff'
  }

  const renderTask = () => {
    if (!currentTask) return null
    
    switch (currentTask.type) {
      case 'stroop':
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">{currentTask.instruction}</h3>
            <div 
              className="text-8xl font-bold mb-8"
              style={{ color: getColorStyle(currentTask.color) }}
            >
              {currentTask.word.toUpperCase()}
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {['red', 'blue', 'green', 'yellow', 'purple', 'orange'].map(color => (
                <button
                  key={color}
                  onClick={() => handleResponse(color)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all"
                  style={{ borderColor: getColorStyle(color), borderWidth: '2px' }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )
        
      case 'flanker':
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">{currentTask.instruction}</h3>
            <div className="text-8xl font-bold text-white mb-8 tracking-wider">
              {currentTask.display}
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleResponse('left')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold text-2xl transition-all"
              >
                ← LEFT
              </button>
              <button
                onClick={() => handleResponse('right')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold text-2xl transition-all"
              >
                RIGHT →
              </button>
            </div>
          </div>
        )
        
      case 'nback':
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">{currentTask.name} ({currentTask.n}-back)</h3>
            <p className="text-gray-400 mb-6">{currentTask.instruction}</p>
            
            {/* Show sequence history */}
            <div className="flex justify-center gap-2 mb-8">
              {currentTask.sequence.slice(0, currentTask.currentIndex + 1).map((item, i) => (
                <div 
                  key={i} 
                  className={`w-16 h-16 flex items-center justify-center rounded-lg text-2xl font-bold ${
                    i === currentTask.currentIndex ? 'bg-yellow-600 text-black' :
                    i === currentTask.currentIndex - currentTask.n ? 'bg-purple-600 text-white' :
                    'bg-white/10 text-gray-400'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleResponse('match')}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-all"
              >
                MATCH
              </button>
              <button
                onClick={() => handleResponse('no match')}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-all"
              >
                NO MATCH
              </button>
            </div>
          </div>
        )
        
      case 'sustained':
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">{currentTask.instruction}</h3>
            <p className="text-gray-400 mb-8">Target: Circle</p>
            
            <div className="flex items-center justify-center h-64">
              {currentTask.shape === 'circle' && (
                <div className="w-32 h-32 bg-yellow-500 rounded-full" />
              )}
              {currentTask.shape === 'square' && (
                <div className="w-32 h-32 bg-blue-500" />
              )}
              {currentTask.shape === 'triangle' && (
                <div className="w-0 h-0 border-l-[64px] border-l-transparent border-r-[64px] border-r-transparent border-b-[112px] border-b-green-500" />
              )}
              {currentTask.shape === 'hexagon' && (
                <div className="w-32 h-32 bg-purple-500 clip-hexagon" />
              )}
              {currentTask.shape === 'star' && (
                <div className="text-8xl text-orange-500">⭐</div>
              )}
            </div>
            
            <button
              onClick={() => handleResponse(currentTask.isTarget ? 'correct' : 'incorrect')}
              className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white font-semibold transition-all"
            >
              SPACE (Target Detected)
            </button>
          </div>
        )
        
      case 'divided':
        return (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-4">{currentTask.instruction}</h3>
            
            {/* Display number at position */}
            <div className="relative w-64 h-64 mx-auto mb-8 bg-white/5 rounded-lg">
              <div 
                className={`absolute text-6xl font-bold text-white ${
                  currentTask.position === 'top' ? 'top-4 left-1/2 -translate-x-1/2' :
                  currentTask.position === 'bottom' ? 'bottom-4 left-1/2 -translate-x-1/2' :
                  currentTask.position === 'left' ? 'left-4 top-1/2 -translate-y-1/2' :
                  'right-4 top-1/2 -translate-y-1/2'
                }`}
              >
                {currentTask.number}
              </div>
            </div>
            
            <p className="text-xl text-yellow-400 mb-4">
              {currentTask.question === 'odd/even' ? 'Is the number odd or even?' : 'Where is the number?'}
            </p>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {currentTask.question === 'odd/even' ? (
                <>
                  <button
                    onClick={() => handleResponse('odd')}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all"
                  >
                    ODD
                  </button>
                  <button
                    onClick={() => handleResponse('even')}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all"
                  >
                    EVEN
                  </button>
                </>
              ) : (
                ['top', 'bottom', 'left', 'right'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => handleResponse(pos)}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold capitalize transition-all"
                  >
                    {pos}
                  </button>
                ))
              )}
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-yellow-900/20 to-black relative">
      {/* Distractions */}
      {distractions.map(distraction => (
        <div key={distraction.id} className="absolute inset-0 pointer-events-none">
          {distraction.type === 'flash' && (
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
          )}
          {distraction.type === 'movement' && (
            <div className="absolute top-1/2 left-0 w-16 h-16 bg-red-500 rounded-full animate-bounce" />
          )}
        </div>
      ))}
      
      {/* Header */}
      <div className="bg-black/50 backdrop-blur border-b border-white/10 p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold text-white">Cingulate Control</h2>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{score}</div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{Math.round(accuracy)}%</div>
                <div className="text-xs text-gray-400">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{focusLevel}%</div>
                <div className="text-xs text-gray-400">Focus</div>
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
      
      {/* Focus meter */}
      <div className="mx-8 mt-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Focus Level</span>
          <span>{focusLevel}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all duration-500"
            style={{ width: `${focusLevel}%` }}
          />
        </div>
      </div>
      
      {/* Game area */}
      <div className="flex-1 flex items-center justify-center p-8">
        {renderTask()}
      </div>
      
      {/* Feedback */}
      {feedback && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur rounded-lg px-6 py-3 z-20">
          <p className="text-lg font-semibold text-white">{feedback}</p>
        </div>
      )}
      
      {/* Average reaction time */}
      {reactionTimes.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-yellow-600/20 rounded-lg p-3">
          <p className="text-sm text-yellow-300">
            Avg RT: {Math.round(reactionTimes.reduce((a, b) => a + b) / reactionTimes.length)}ms
          </p>
        </div>
      )}
    </div>
  )
}

export default CingulateControl