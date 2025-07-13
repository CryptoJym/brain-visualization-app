import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import PrefrontalPuzzle from '../games/PrefrontalPuzzle'
import HippocampusHero from '../games/HippocampusHero'
import AmygdalaBalance from '../games/AmygdalaBalance'
import InsulaSensing from '../games/InsulaSensing'
import CingulateControl from '../games/CingulateControl'
import { NeuroplasticityEngine } from '../services/NeuroplasticityEngine'
import { getBrainTrainingProtocols } from '../utils/BrainTrainingProtocols'

// Simplified brain visualization for training feedback
const TrainingBrain = ({ activeRegions, intensity }) => {
  const brainRegions = {
    prefrontal: { position: [0, 1.5, 1.5], color: '#00ff88' },
    hippocampus: { position: [-1, 0, 0], color: '#ff00ff' },
    amygdala: { position: [1, -0.5, 0], color: '#ff8800' },
    insula: { position: [0, 0, -1], color: '#00ffff' },
    cingulate: { position: [0, 0.5, 0], color: '#ffff00' }
  }

  return (
    <group>
      {/* Brain outline */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial 
          color="#333333" 
          transparent 
          opacity={0.2} 
          wireframe 
        />
      </mesh>
      
      {/* Active regions */}
      {Object.entries(brainRegions).map(([region, data]) => (
        <mesh key={region} position={data.position}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial 
            color={data.color}
            emissive={data.color}
            emissiveIntensity={activeRegions.includes(region) ? intensity : 0.1}
            transparent
            opacity={activeRegions.includes(region) ? 0.8 : 0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

const NeuroplasticityTraining = ({ userProfile, onClose }) => {
  const [engine] = useState(() => new NeuroplasticityEngine(userProfile))
  const [currentGame, setCurrentGame] = useState(null)
  const [gameMode, setGameMode] = useState('menu') // menu, playing, results
  const [playerStats, setPlayerStats] = useState({
    level: 1,
    xp: 0,
    streakDays: 0,
    totalSessions: 0,
    achievements: [],
    regionScores: {
      prefrontal: 0,
      hippocampus: 0,
      amygdala: 0,
      insula: 0,
      cingulate: 0
    }
  })
  const [activeRegions, setActiveRegions] = useState([])
  const [brainIntensity, setBrainIntensity] = useState(0.2)
  const [recommendations, setRecommendations] = useState([])

  useEffect(() => {
    // Get personalized recommendations
    const recs = engine.getRecommendedExercises()
    setRecommendations(recs)
  }, [engine])

  const games = {
    prefrontal: {
      title: 'Prefrontal Puzzle',
      description: 'Enhance executive function and decision-making',
      icon: '🧩',
      color: '#00ff88',
      component: PrefrontalPuzzle
    },
    hippocampus: {
      title: 'Hippocampus Hero',
      description: 'Boost memory formation and recall',
      icon: '🗺️',
      color: '#ff00ff',
      component: HippocampusHero
    },
    amygdala: {
      title: 'Amygdala Balance',
      description: 'Master emotional regulation',
      icon: '⚖️',
      color: '#ff8800',
      component: AmygdalaBalance
    },
    insula: {
      title: 'Insula Sensing',
      description: 'Strengthen body awareness',
      icon: '🎯',
      color: '#00ffff',
      component: InsulaSensing
    },
    cingulate: {
      title: 'Cingulate Control',
      description: 'Improve attention and focus',
      icon: '🎪',
      color: '#ffff00',
      component: CingulateControl
    }
  }

  const handleGameComplete = (gameData) => {
    const { region, score, duration, difficulty } = gameData
    
    // Update brain visualization
    setActiveRegions([region])
    setBrainIntensity(0.8)
    setTimeout(() => setBrainIntensity(0.2), 2000)
    
    // Calculate rewards
    const xpGained = engine.calculateXP(score, difficulty, duration)
    const newStats = {
      ...playerStats,
      xp: playerStats.xp + xpGained,
      totalSessions: playerStats.totalSessions + 1,
      regionScores: {
        ...playerStats.regionScores,
        [region]: playerStats.regionScores[region] + score
      }
    }
    
    // Check for level up
    const newLevel = Math.floor(newStats.xp / 1000) + 1
    if (newLevel > playerStats.level) {
      newStats.level = newLevel
      newStats.achievements = [...newStats.achievements, `Level ${newLevel} Achieved!`]
    }
    
    setPlayerStats(newStats)
    setGameMode('results')
    
    // Store progress
    engine.recordSession({
      region,
      score,
      duration,
      difficulty,
      timestamp: Date.now()
    })
  }

  const renderGameMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <div className="col-span-full mb-6">
        <h2 className="text-3xl font-bold text-white mb-4">Neuroplasticity Training Center</h2>
        
        {/* Player stats */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{playerStats.level}</div>
              <div className="text-sm text-gray-400">Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{playerStats.xp}</div>
              <div className="text-sm text-gray-400">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{playerStats.streakDays}</div>
              <div className="text-sm text-gray-400">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">{playerStats.totalSessions}</div>
              <div className="text-sm text-gray-400">Sessions</div>
            </div>
          </div>
          
          {/* XP Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Level {playerStats.level}</span>
              <span>Level {playerStats.level + 1}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(playerStats.xp % 1000) / 10}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-4 mb-6 border border-purple-500/30">
            <h3 className="text-lg font-semibold text-white mb-2">Recommended for You</h3>
            <p className="text-sm text-gray-300">Based on your brain profile, these exercises will be most beneficial:</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {recommendations.map(rec => (
                <span key={rec} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                  {games[rec]?.icon} {games[rec]?.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Game cards */}
      {Object.entries(games).map(([key, game]) => {
        const isRecommended = recommendations.includes(key)
        const regionScore = playerStats.regionScores[key]
        const progress = Math.min((regionScore / 1000) * 100, 100)
        
        return (
          <div 
            key={key}
            className={`relative bg-white/5 backdrop-blur rounded-xl p-6 border transition-all hover:scale-105 cursor-pointer ${
              isRecommended ? 'border-purple-500/50 ring-2 ring-purple-500/30' : 'border-white/10'
            }`}
            onClick={() => {
              setCurrentGame(key)
              setGameMode('playing')
              setActiveRegions([key])
            }}
          >
            {isRecommended && (
              <div className="absolute -top-3 -right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                Recommended
              </div>
            )}
            
            <div className="text-5xl mb-4">{game.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{game.title}</h3>
            <p className="text-sm text-gray-400 mb-4">{game.description}</p>
            
            {/* Region progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: game.color 
                  }}
                />
              </div>
            </div>
            
            {/* Best score */}
            {regionScore > 0 && (
              <div className="mt-3 text-xs text-gray-400">
                Best Score: {regionScore}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  const renderGame = () => {
    if (!currentGame || !games[currentGame]) return null
    
    const GameComponent = games[currentGame].component
    const difficulty = engine.getAdaptiveDifficulty(currentGame)
    
    return (
      <div className="relative h-full">
        <GameComponent
          difficulty={difficulty}
          onComplete={(score, duration) => {
            handleGameComplete({
              region: currentGame,
              score,
              duration,
              difficulty
            })
          }}
          onExit={() => {
            setGameMode('menu')
            setCurrentGame(null)
            setActiveRegions([])
          }}
        />
      </div>
    )
  }

  const renderResults = () => {
    const lastSession = engine.getLastSession()
    if (!lastSession) return null
    
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="bg-white/10 backdrop-blur rounded-xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Great Job! 🎉</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Score</span>
              <span className="text-2xl font-bold text-white">{lastSession.score}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">XP Earned</span>
              <span className="text-xl font-semibold text-green-400">+{engine.calculateXP(lastSession.score, lastSession.difficulty, lastSession.duration)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Duration</span>
              <span className="text-white">{Math.floor(lastSession.duration / 60)}:{(lastSession.duration % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
          
          {/* Neuroplasticity tip */}
          <div className="bg-purple-600/20 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-purple-400 mb-2">Neuroplasticity Tip</h3>
            <p className="text-sm text-gray-300">
              Regular practice strengthens neural pathways. Try to maintain a daily streak for maximum benefit!
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setGameMode('playing')}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
            >
              Play Again
            </button>
            <button
              onClick={() => {
                setGameMode('menu')
                setCurrentGame(null)
                setActiveRegions([])
              }}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-purple-900/10 to-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-black/50 backdrop-blur border-b border-white/10 z-10">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-white">Neuroplasticity Training</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="pt-16 h-full flex">
        {/* Brain visualization sidebar */}
        <div className="w-1/4 min-w-[300px] bg-black/30 border-r border-white/10 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Brain Activity Monitor</h3>
          <div className="h-64 bg-black/50 rounded-lg overflow-hidden">
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} />
              <OrbitControls enableZoom={false} />
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <TrainingBrain activeRegions={activeRegions} intensity={brainIntensity} />
            </Canvas>
          </div>
          
          {/* Active regions legend */}
          <div className="mt-4 space-y-2">
            {Object.entries(games).map(([key, game]) => (
              <div 
                key={key} 
                className={`flex items-center gap-2 p-2 rounded transition-all ${
                  activeRegions.includes(key) ? 'bg-white/10' : ''
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: game.color,
                    opacity: activeRegions.includes(key) ? 1 : 0.3
                  }}
                />
                <span className={`text-sm ${activeRegions.includes(key) ? 'text-white' : 'text-gray-500'}`}>
                  {game.title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
          
          {/* Achievements */}
          {playerStats.achievements.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Recent Achievements</h4>
              <div className="space-y-1">
                {playerStats.achievements.slice(-3).map((achievement, i) => (
                  <div key={i} className="text-xs text-purple-400 bg-purple-600/20 rounded px-2 py-1">
                    🏆 {achievement}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Game area */}
        <div className="flex-1 overflow-auto">
          {gameMode === 'menu' && renderGameMenu()}
          {gameMode === 'playing' && renderGame()}
          {gameMode === 'results' && renderResults()}
        </div>
      </div>
    </div>
  )
}

export default NeuroplasticityTraining