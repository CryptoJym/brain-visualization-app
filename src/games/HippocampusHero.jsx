import { useState, useEffect, useRef } from 'react'

const HippocampusHero = ({ difficulty, onComplete, onExit }) => {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes
  const [gamePhase, setGamePhase] = useState('memorize') // memorize, recall, spatial
  const [currentChallenge, setCurrentChallenge] = useState(null)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [streak, setStreak] = useState(0)
  const startTime = useRef(Date.now())
  
  // Memory challenges for hippocampus training
  const challengeTypes = {
    wordList: {
      name: 'Word Association',
      description: 'Remember the word list',
      generate: (diff) => {
        const categories = {
          animals: ['lion', 'elephant', 'giraffe', 'penguin', 'kangaroo', 'dolphin', 'eagle', 'octopus'],
          colors: ['crimson', 'turquoise', 'magenta', 'amber', 'violet', 'emerald', 'sapphire', 'coral'],
          objects: ['telescope', 'compass', 'hourglass', 'lantern', 'quill', 'sextant', 'astrolabe', 'sundial'],
          emotions: ['joy', 'serenity', 'wonder', 'gratitude', 'empathy', 'courage', 'hope', 'wisdom']
        }
        
        const categoryNames = Object.keys(categories)
        const category = categoryNames[Math.floor(Math.random() * categoryNames.length)]
        const wordCount = Math.min(4 + diff, 8)
        const words = categories[category].sort(() => Math.random() - 0.5).slice(0, wordCount)
        
        return {
          type: 'wordList',
          category,
          words,
          memorizeTime: Math.max(15000 - diff * 1000, 5000),
          decoys: generateDecoys(words, categories[category], diff)
        }
      }
    },
    storySequence: {
      name: 'Story Chain',
      description: 'Remember the sequence of events',
      generate: (diff) => {
        const events = [
          'The astronaut discovered a hidden planet',
          'Ancient ruins were found beneath the ice',
          'A mysterious signal came from deep space',
          'The time capsule contained a warning',
          'Scientists decoded the alien language',
          'The portal opened to another dimension',
          'Energy crystals powered the ancient city',
          'The guardian awoke from centuries of sleep'
        ]
        
        const sequenceLength = Math.min(3 + diff, 6)
        const sequence = events.sort(() => Math.random() - 0.5).slice(0, sequenceLength)
        
        return {
          type: 'storySequence',
          sequence,
          memorizeTime: Math.max(20000 - diff * 1000, 10000),
          scrambled: [...sequence].sort(() => Math.random() - 0.5)
        }
      }
    },
    spatialMemory: {
      name: 'Spatial Navigator',
      description: 'Remember the path through the maze',
      generate: (diff) => {
        const gridSize = Math.min(4 + Math.floor(diff / 2), 8)
        const pathLength = Math.min(5 + diff, gridSize * 2)
        const path = generatePath(gridSize, pathLength)
        
        return {
          type: 'spatialMemory',
          gridSize,
          path,
          showTime: Math.max(10000 - diff * 500, 3000),
          userPath: []
        }
      }
    },
    faceMemory: {
      name: 'Face Recognition',
      description: 'Remember the faces and their details',
      generate: (diff) => {
        const faces = generateFaces(Math.min(3 + diff, 8))
        
        return {
          type: 'faceMemory',
          faces,
          memorizeTime: Math.max(20000 - diff * 1000, 8000),
          testFaces: shuffleWithDecoys(faces, diff)
        }
      }
    }
  }

  // Generate decoy words
  const generateDecoys = (correct, pool, difficulty) => {
    const decoyCount = Math.min(correct.length + difficulty, 12)
    const decoys = pool.filter(word => !correct.includes(word))
    const allWords = [...correct, ...decoys.slice(0, decoyCount - correct.length)]
    return allWords.sort(() => Math.random() - 0.5)
  }

  // Generate path for spatial memory
  const generatePath = (gridSize, length) => {
    const path = [[Math.floor(gridSize / 2), Math.floor(gridSize / 2)]]
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]
    
    while (path.length < length) {
      const last = path[path.length - 1]
      const validMoves = directions
        .map(([dx, dy]) => [last[0] + dx, last[1] + dy])
        .filter(([x, y]) => 
          x >= 0 && x < gridSize && 
          y >= 0 && y < gridSize &&
          !path.some(([px, py]) => px === x && py === y)
        )
      
      if (validMoves.length === 0) break
      path.push(validMoves[Math.floor(Math.random() * validMoves.length)])
    }
    
    return path
  }

  // Generate face data
  const generateFaces = (count) => {
    const names = ['Alex', 'Sam', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Drew', 'Blake']
    const professions = ['Doctor', 'Artist', 'Teacher', 'Engineer', 'Chef', 'Pilot', 'Writer', 'Scientist']
    const features = ['glasses', 'hat', 'beard', 'earrings', 'scarf', 'watch', 'necklace', 'bracelet']
    
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      name: names[i],
      profession: professions[i],
      feature: features[i],
      emoji: ['👨', '👩', '🧑'][Math.floor(Math.random() * 3)]
    }))
  }

  // Shuffle with decoys
  const shuffleWithDecoys = (correct, difficulty) => {
    const decoyCount = Math.floor(difficulty / 2)
    const decoys = Array.from({ length: decoyCount }, (_, i) => ({
      id: correct.length + i,
      name: 'Unknown',
      profession: 'Unknown',
      feature: 'none',
      emoji: '👤',
      isDecoy: true
    }))
    
    return [...correct, ...decoys].sort(() => Math.random() - 0.5)
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

  // Memorize phase timer
  useEffect(() => {
    if (gamePhase === 'memorize' && currentChallenge) {
      const timer = setTimeout(() => {
        setGamePhase('recall')
      }, currentChallenge.memorizeTime || currentChallenge.showTime || 10000)
      
      return () => clearTimeout(timer)
    }
  }, [gamePhase, currentChallenge])

  const nextChallenge = () => {
    const types = Object.keys(challengeTypes)
    const type = types[Math.floor(Math.random() * types.length)]
    const challenge = challengeTypes[type].generate(difficulty)
    setCurrentChallenge(challenge)
    setGamePhase('memorize')
    setUserInput('')
  }

  const handleWordSelect = (word) => {
    if (currentChallenge.type !== 'wordList') return
    
    const isCorrect = currentChallenge.words.includes(word)
    if (isCorrect) {
      const points = 50 * (1 + streak * 0.1)
      setScore(prev => prev + Math.floor(points))
      setStreak(prev => prev + 1)
      setFeedback('Correct! Great memory! 🧠')
      
      // Remove word from options
      const newDecoys = currentChallenge.decoys.filter(w => w !== word)
      setCurrentChallenge({ ...currentChallenge, decoys: newDecoys })
      
      // Check if all words found
      if (newDecoys.length === currentChallenge.decoys.length - currentChallenge.words.length) {
        setTimeout(() => {
          setFeedback('Perfect recall! All words found! 🌟')
          setTimeout(nextChallenge, 1500)
        }, 500)
      }
    } else {
      setStreak(0)
      setFeedback('Not in the original list. Try again!')
    }
    
    setTimeout(() => setFeedback(''), 1500)
  }

  const handleSequenceOrder = (event, index) => {
    if (currentChallenge.type !== 'storySequence') return
    
    const correctIndex = currentChallenge.sequence.indexOf(event)
    if (correctIndex === index) {
      const points = 75 * (1 + streak * 0.1)
      setScore(prev => prev + Math.floor(points))
      setStreak(prev => prev + 1)
      setFeedback(`Correct! Event #${index + 1} ✓`)
      
      // Check if all ordered
      if (index === currentChallenge.sequence.length - 1) {
        setTimeout(() => {
          setFeedback('Perfect sequence! Amazing recall! 🎯')
          setTimeout(nextChallenge, 1500)
        }, 500)
      }
    } else {
      setStreak(0)
      setFeedback(`This should be event #${correctIndex + 1}`)
    }
    
    setTimeout(() => setFeedback(''), 1500)
  }

  const handleSpatialClick = (x, y) => {
    if (currentChallenge.type !== 'spatialMemory') return
    
    const userPath = [...currentChallenge.userPath, [x, y]]
    const stepIndex = userPath.length - 1
    
    if (stepIndex < currentChallenge.path.length) {
      const correct = currentChallenge.path[stepIndex]
      if (correct[0] === x && correct[1] === y) {
        setCurrentChallenge({ ...currentChallenge, userPath })
        
        if (userPath.length === currentChallenge.path.length) {
          const points = 100 * (1 + streak * 0.1)
          setScore(prev => prev + Math.floor(points))
          setStreak(prev => prev + 1)
          setFeedback('Perfect navigation! Spatial memory intact! 🗺️')
          setTimeout(nextChallenge, 2000)
        }
      } else {
        setStreak(0)
        setFeedback('Wrong path! Try again from the beginning.')
        setCurrentChallenge({ ...currentChallenge, userPath: [] })
      }
    }
  }

  const renderChallenge = () => {
    if (!currentChallenge) return null
    
    switch (currentChallenge.type) {
      case 'wordList':
        if (gamePhase === 'memorize') {
          return (
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Memorize these {currentChallenge.category}:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {currentChallenge.words.map((word, i) => (
                  <div key={i} className="bg-purple-600/30 rounded-lg p-4 text-xl font-semibold text-white">
                    {word}
                  </div>
                ))}
              </div>
              <div className="mt-6 text-gray-400">
                Time remaining: {Math.ceil(currentChallenge.memorizeTime / 1000)}s
              </div>
            </div>
          )
        } else {
          return (
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Select all the {currentChallenge.category} you saw:</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                {currentChallenge.decoys.map((word, i) => (
                  <button
                    key={i}
                    onClick={() => handleWordSelect(word)}
                    className="bg-white/10 hover:bg-white/20 rounded-lg p-3 text-lg font-medium text-white transition-all"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )
        }
        
      case 'storySequence':
        if (gamePhase === 'memorize') {
          return (
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Remember this sequence of events:</h3>
              <div className="space-y-3">
                {currentChallenge.sequence.map((event, i) => (
                  <div key={i} className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-lg p-4">
                    <span className="text-purple-400 font-bold mr-3">{i + 1}.</span>
                    <span className="text-white">{event}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        } else {
          return (
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Put the events in order:</h3>
              <div className="space-y-3">
                {currentChallenge.scrambled.map((event, i) => (
                  <button
                    key={i}
                    onClick={() => handleSequenceOrder(event, 0)} // You'd need to track which position
                    className="w-full bg-white/10 hover:bg-white/20 rounded-lg p-4 text-left text-white transition-all"
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>
          )
        }
        
      case 'spatialMemory':
        const showingPath = gamePhase === 'memorize'
        return (
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              {showingPath ? 'Memorize the path!' : 'Recreate the path'}
            </h3>
            <div 
              className="inline-grid gap-1 p-4 bg-white/5 rounded-lg"
              style={{ gridTemplateColumns: `repeat(${currentChallenge.gridSize}, 1fr)` }}
            >
              {Array.from({ length: currentChallenge.gridSize * currentChallenge.gridSize }).map((_, i) => {
                const x = i % currentChallenge.gridSize
                const y = Math.floor(i / currentChallenge.gridSize)
                const isInPath = currentChallenge.path.some(([px, py]) => px === x && py === y)
                const isInUserPath = currentChallenge.userPath.some(([px, py]) => px === x && py === y)
                const pathIndex = currentChallenge.path.findIndex(([px, py]) => px === x && py === y)
                
                return (
                  <button
                    key={i}
                    onClick={() => !showingPath && handleSpatialClick(x, y)}
                    disabled={showingPath}
                    className={`w-12 h-12 rounded transition-all relative ${
                      showingPath && isInPath
                        ? 'bg-purple-500'
                        : isInUserPath
                        ? 'bg-blue-500'
                        : 'bg-white/10 hover:bg-white/20'
                    } ${showingPath ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {showingPath && isInPath && (
                      <span className="text-white font-bold">{pathIndex + 1}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
        
      case 'faceMemory':
        if (gamePhase === 'memorize') {
          return (
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Remember these people:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {currentChallenge.faces.map((face, i) => (
                  <div key={i} className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">{face.emoji}</div>
                    <div className="font-semibold text-white">{face.name}</div>
                    <div className="text-sm text-gray-400">{face.profession}</div>
                    <div className="text-xs text-purple-400 mt-1">Has: {face.feature}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        } else {
          return (
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Who did you see before?</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
                {currentChallenge.testFaces.map((face, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!face.isDecoy) {
                        setScore(prev => prev + 60)
                        setStreak(prev => prev + 1)
                        setFeedback(`Yes! ${face.name} the ${face.profession}!`)
                      } else {
                        setStreak(0)
                        setFeedback('This person wasn\'t shown before!')
                      }
                      setTimeout(() => setFeedback(''), 1500)
                    }}
                    className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-all"
                  >
                    <div className="text-3xl mb-1">{face.emoji}</div>
                    <div className="text-sm text-gray-400">
                      {face.isDecoy ? '???' : face.feature}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        }
        
      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-900/20 to-black">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold text-white">Hippocampus Hero</h2>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{score}</div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">🔥{streak}</div>
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
      
      {/* Memory tips */}
      {gamePhase === 'memorize' && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-purple-600/20 backdrop-blur rounded-lg px-4 py-2">
          <p className="text-sm text-purple-300">💡 Tip: Create mental associations or stories to remember better!</p>
        </div>
      )}
    </div>
  )
}

export default HippocampusHero