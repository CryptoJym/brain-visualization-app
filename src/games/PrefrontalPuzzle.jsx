import { useState, useEffect, useRef } from 'react'

const PrefrontalPuzzle = ({ difficulty, onComplete, onExit }) => {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  const [currentPuzzle, setCurrentPuzzle] = useState(null)
  const [selectedTiles, setSelectedTiles] = useState([])
  const [feedback, setFeedback] = useState('')
  const [combo, setCombo] = useState(0)
  const startTime = useRef(Date.now())
  
  // Puzzle types for executive function training
  const puzzleTypes = {
    pattern: {
      name: 'Pattern Recognition',
      description: 'Complete the logical sequence',
      generate: (diff) => {
        const patterns = [
          { sequence: [2, 4, 6, 8], answer: 10, rule: '+2' },
          { sequence: [1, 3, 9, 27], answer: 81, rule: '×3' },
          { sequence: [100, 90, 81, 73], answer: 66, rule: '-n (n increases)' },
          { sequence: [1, 1, 2, 3, 5], answer: 8, rule: 'Fibonacci' }
        ]
        const pattern = patterns[Math.floor(Math.random() * patterns.length)]
        const options = generateOptions(pattern.answer, diff)
        return { ...pattern, options, type: 'pattern' }
      }
    },
    planning: {
      name: 'Tower Planning',
      description: 'Move disks to match the target in minimum moves',
      generate: (diff) => {
        const diskCount = Math.min(3 + Math.floor(diff / 2), 5)
        const start = Array.from({ length: diskCount }, (_, i) => diskCount - i)
        const target = [...start].reverse()
        return {
          type: 'planning',
          disks: diskCount,
          towers: [start, [], []],
          target: [[], [], target],
          moves: 0,
          minMoves: Math.pow(2, diskCount) - 1
        }
      }
    },
    sorting: {
      name: 'Category Sorting',
      description: 'Sort items by the hidden rule',
      generate: (diff) => {
        const rules = ['color', 'shape', 'number', 'size']
        const rule = rules[Math.floor(Math.random() * rules.length)]
        const items = generateSortingItems(rule, diff)
        return {
          type: 'sorting',
          rule,
          items,
          categories: 2 + Math.floor(diff / 3),
          sorted: []
        }
      }
    },
    working_memory: {
      name: 'Memory Matrix',
      description: 'Remember and reproduce the pattern',
      generate: (diff) => {
        const size = Math.min(3 + Math.floor(diff / 2), 6)
        const filled = Math.min(3 + diff, size * size - 1)
        const pattern = generateMemoryPattern(size, filled)
        return {
          type: 'working_memory',
          size,
          pattern,
          showTime: Math.max(3000 - diff * 200, 1000),
          userPattern: []
        }
      }
    }
  }

  // Generate options for multiple choice
  const generateOptions = (correct, difficulty) => {
    const options = [correct]
    const variance = Math.max(10 - difficulty, 2)
    
    while (options.length < 4) {
      const offset = Math.floor(Math.random() * variance * 2) - variance
      const option = correct + offset
      if (!options.includes(option) && option > 0) {
        options.push(option)
      }
    }
    
    return options.sort(() => Math.random() - 0.5)
  }

  // Generate sorting items
  const generateSortingItems = (rule, difficulty) => {
    const shapes = ['circle', 'square', 'triangle', 'hexagon']
    const colors = ['red', 'blue', 'green', 'yellow']
    const numbers = [1, 2, 3, 4]
    const sizes = ['small', 'medium', 'large', 'xlarge']
    
    const itemCount = 8 + difficulty * 2
    const items = []
    
    for (let i = 0; i < itemCount; i++) {
      items.push({
        id: i,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        number: numbers[Math.floor(Math.random() * numbers.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)]
      })
    }
    
    return items
  }

  // Generate memory pattern
  const generateMemoryPattern = (size, filled) => {
    const pattern = []
    const totalCells = size * size
    const indices = Array.from({ length: totalCells }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, filled)
    
    return indices
  }

  // Initialize puzzle
  useEffect(() => {
    nextPuzzle()
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

  const nextPuzzle = () => {
    const types = Object.keys(puzzleTypes)
    const type = types[Math.floor(Math.random() * types.length)]
    const puzzle = puzzleTypes[type].generate(difficulty)
    setCurrentPuzzle(puzzle)
    setSelectedTiles([])
  }

  const handleAnswer = (answer) => {
    if (currentPuzzle.type === 'pattern') {
      if (answer === currentPuzzle.answer) {
        const points = 100 * (1 + combo * 0.1)
        setScore(prev => prev + Math.floor(points))
        setCombo(prev => prev + 1)
        setFeedback('Correct! Pattern recognized! 🧩')
      } else {
        setCombo(0)
        setFeedback('Not quite. Try again! 🤔')
      }
      
      setTimeout(() => {
        setFeedback('')
        nextPuzzle()
      }, 1500)
    }
  }

  const handleTowerMove = (from, to) => {
    if (currentPuzzle.type !== 'planning') return
    
    const towers = [...currentPuzzle.towers]
    if (towers[from].length === 0) return
    
    const disk = towers[from][towers[from].length - 1]
    if (towers[to].length > 0 && towers[to][towers[to].length - 1] < disk) {
      setFeedback('Invalid move! Larger disk cannot go on smaller disk.')
      return
    }
    
    towers[from].pop()
    towers[to].push(disk)
    
    const newPuzzle = {
      ...currentPuzzle,
      towers,
      moves: currentPuzzle.moves + 1
    }
    
    setCurrentPuzzle(newPuzzle)
    
    // Check if solved
    if (JSON.stringify(towers) === JSON.stringify(currentPuzzle.target)) {
      const efficiency = currentPuzzle.minMoves / newPuzzle.moves
      const points = Math.floor(200 * efficiency * (1 + combo * 0.1))
      setScore(prev => prev + points)
      setCombo(prev => prev + 1)
      setFeedback(`Solved in ${newPuzzle.moves} moves! Optimal: ${currentPuzzle.minMoves} 🎯`)
      
      setTimeout(() => {
        setFeedback('')
        nextPuzzle()
      }, 2000)
    }
  }

  const handleMemoryClick = (index) => {
    if (currentPuzzle.type !== 'working_memory') return
    
    const newPattern = [...currentPuzzle.userPattern]
    if (newPattern.includes(index)) {
      newPattern.splice(newPattern.indexOf(index), 1)
    } else {
      newPattern.push(index)
    }
    
    setCurrentPuzzle({ ...currentPuzzle, userPattern: newPattern })
    
    // Check if complete
    if (newPattern.length === currentPuzzle.pattern.length) {
      const correct = currentPuzzle.pattern.every(i => newPattern.includes(i))
      if (correct && newPattern.length === currentPuzzle.pattern.length) {
        const points = 150 * (1 + combo * 0.1)
        setScore(prev => prev + Math.floor(points))
        setCombo(prev => prev + 1)
        setFeedback('Perfect memory! 🧠')
      } else {
        setCombo(0)
        setFeedback('Not quite right. Try again!')
      }
      
      setTimeout(() => {
        setFeedback('')
        nextPuzzle()
      }, 1500)
    }
  }

  const renderPuzzle = () => {
    if (!currentPuzzle) return null
    
    switch (currentPuzzle.type) {
      case 'pattern':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Complete the Pattern</h3>
              <div className="flex justify-center gap-4 mb-6">
                {currentPuzzle.sequence.map((num, i) => (
                  <div key={i} className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center text-2xl font-bold text-white">
                    {num}
                  </div>
                ))}
                <div className="w-16 h-16 bg-purple-600/30 border-2 border-purple-500 rounded-lg flex items-center justify-center text-2xl font-bold text-purple-400">
                  ?
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                {currentPuzzle.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option)}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-lg text-xl font-semibold text-white transition-all"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
        
      case 'planning':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Tower of Hanoi</h3>
              <p className="text-gray-400 mb-4">Move all disks to the right tower. Larger disks cannot go on smaller ones.</p>
              <div className="flex justify-between items-center max-w-md mx-auto mb-4">
                <span className="text-gray-400">Moves: {currentPuzzle.moves}</span>
                <span className="text-gray-400">Optimal: {currentPuzzle.minMoves}</span>
              </div>
              <div className="flex justify-center gap-8">
                {currentPuzzle.towers.map((tower, i) => (
                  <div key={i} className="relative">
                    <div className="w-32 h-40 bg-white/5 rounded-lg border-2 border-white/20 flex flex-col-reverse items-center p-2">
                      {tower.map((disk, j) => (
                        <div
                          key={j}
                          className="bg-gradient-to-r from-purple-500 to-blue-500 rounded cursor-pointer hover:brightness-110"
                          style={{
                            width: `${20 + disk * 20}px`,
                            height: '20px',
                            marginBottom: '2px'
                          }}
                          onClick={() => {
                            if (j === tower.length - 1) {
                              // Find next tower to move to
                              const nextTower = (i + 1) % 3
                              handleTowerMove(i, nextTower)
                            }
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-center mt-2 text-gray-400">Tower {i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
        
      case 'working_memory':
        const showPattern = currentPuzzle.userPattern.length === 0
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Memory Matrix</h3>
              <p className="text-gray-400 mb-4">
                {showPattern ? 'Memorize the pattern!' : 'Reproduce the pattern'}
              </p>
              <div 
                className="inline-grid gap-2 p-4 bg-white/5 rounded-lg"
                style={{ gridTemplateColumns: `repeat(${currentPuzzle.size}, 1fr)` }}
              >
                {Array.from({ length: currentPuzzle.size * currentPuzzle.size }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => !showPattern && handleMemoryClick(i)}
                    disabled={showPattern}
                    className={`w-12 h-12 rounded transition-all ${
                      showPattern && currentPuzzle.pattern.includes(i)
                        ? 'bg-purple-500'
                        : currentPuzzle.userPattern.includes(i)
                        ? 'bg-blue-500'
                        : 'bg-white/10 hover:bg-white/20'
                    } ${showPattern ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )
        
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
            <h2 className="text-2xl font-bold text-white">Prefrontal Puzzle</h2>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{score}</div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">x{combo}</div>
                <div className="text-xs text-gray-400">Combo</div>
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
        {renderPuzzle()}
      </div>
      
      {/* Feedback */}
      {feedback && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur rounded-lg px-6 py-3">
          <p className="text-lg font-semibold text-white">{feedback}</p>
        </div>
      )}
    </div>
  )
}

export default PrefrontalPuzzle