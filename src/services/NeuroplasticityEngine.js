// Neuroplasticity Engine - Manages adaptive difficulty, progress tracking, and personalized recommendations

export class NeuroplasticityEngine {
  constructor(userProfile = {}) {
    this.userProfile = userProfile
    this.sessionHistory = this.loadSessionHistory()
    this.progressData = this.loadProgressData()
    this.adaptiveSettings = {
      prefrontal: { difficulty: 1, momentum: 0 },
      hippocampus: { difficulty: 1, momentum: 0 },
      amygdala: { difficulty: 1, momentum: 0 },
      insula: { difficulty: 1, momentum: 0 },
      cingulate: { difficulty: 1, momentum: 0 }
    }
    this.achievements = []
    this.neuroplasticityScore = 0
  }

  // Load session history from localStorage
  loadSessionHistory() {
    try {
      const history = localStorage.getItem('neuroplasticity_sessions')
      return history ? JSON.parse(history) : []
    } catch (e) {
      return []
    }
  }

  // Load progress data from localStorage
  loadProgressData() {
    try {
      const progress = localStorage.getItem('neuroplasticity_progress')
      return progress ? JSON.parse(progress) : this.initializeProgress()
    } catch (e) {
      return this.initializeProgress()
    }
  }

  // Initialize progress tracking
  initializeProgress() {
    return {
      totalSessions: 0,
      totalTime: 0,
      regionProgress: {
        prefrontal: { sessions: 0, totalScore: 0, bestScore: 0, avgAccuracy: 0 },
        hippocampus: { sessions: 0, totalScore: 0, bestScore: 0, avgAccuracy: 0 },
        amygdala: { sessions: 0, totalScore: 0, bestScore: 0, avgAccuracy: 0 },
        insula: { sessions: 0, totalScore: 0, bestScore: 0, avgAccuracy: 0 },
        cingulate: { sessions: 0, totalScore: 0, bestScore: 0, avgAccuracy: 0 }
      },
      streaks: {
        current: 0,
        best: 0,
        lastSession: null
      }
    }
  }

  // Get recommended exercises based on user profile and progress
  getRecommendedExercises() {
    const recommendations = []
    const brainProfile = this.userProfile.brainProfile || {}
    
    // Analyze brain profile for areas needing attention
    if (brainProfile.prefrontalImpact > 0.6) {
      recommendations.push('prefrontal')
    }
    if (brainProfile.hippocampusImpact > 0.5) {
      recommendations.push('hippocampus')
    }
    if (brainProfile.amygdalaImpact > 0.7) {
      recommendations.push('amygdala')
    }
    if (brainProfile.insulaImpact > 0.4) {
      recommendations.push('insula')
    }
    if (brainProfile.cingulateImpact > 0.5) {
      recommendations.push('cingulate')
    }

    // If no specific recommendations, suggest based on least practiced
    if (recommendations.length === 0) {
      const leastPracticed = this.getLeastPracticedRegions()
      recommendations.push(...leastPracticed.slice(0, 3))
    }

    return recommendations
  }

  // Get least practiced brain regions
  getLeastPracticedRegions() {
    const regions = Object.entries(this.progressData.regionProgress)
      .map(([region, data]) => ({ region, sessions: data.sessions }))
      .sort((a, b) => a.sessions - b.sessions)
      .map(item => item.region)
    
    return regions
  }

  // Calculate adaptive difficulty for a region
  getAdaptiveDifficulty(region) {
    const settings = this.adaptiveSettings[region]
    if (!settings) return 1

    // Get recent performance
    const recentSessions = this.getRecentSessions(region, 5)
    if (recentSessions.length === 0) return settings.difficulty

    // Calculate average accuracy and completion rate
    const avgAccuracy = recentSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / recentSessions.length
    const avgCompletion = recentSessions.reduce((sum, s) => sum + (s.completionRate || 1), 0) / recentSessions.length

    // Adjust difficulty based on performance
    if (avgAccuracy > 0.8 && avgCompletion > 0.9) {
      // Increase difficulty
      settings.momentum = Math.min(settings.momentum + 0.2, 1)
      settings.difficulty = Math.min(settings.difficulty + settings.momentum * 0.5, 10)
    } else if (avgAccuracy < 0.5 || avgCompletion < 0.7) {
      // Decrease difficulty
      settings.momentum = Math.max(settings.momentum - 0.3, -1)
      settings.difficulty = Math.max(settings.difficulty + settings.momentum * 0.3, 1)
    } else {
      // Stabilize
      settings.momentum *= 0.8
    }

    return Math.round(settings.difficulty)
  }

  // Get recent sessions for a region
  getRecentSessions(region, count = 5) {
    return this.sessionHistory
      .filter(s => s.region === region)
      .slice(-count)
  }

  // Record a training session
  recordSession(sessionData) {
    const session = {
      ...sessionData,
      timestamp: Date.now(),
      userId: this.userProfile.id || 'anonymous'
    }

    // Update session history
    this.sessionHistory.push(session)
    this.saveSessionHistory()

    // Update progress data
    this.updateProgress(session)

    // Check for achievements
    this.checkAchievements(session)

    // Update neuroplasticity score
    this.updateNeuroplasticityScore()

    return session
  }

  // Update progress data
  updateProgress(session) {
    const { region, score, duration } = session
    const regionData = this.progressData.regionProgress[region]

    if (regionData) {
      regionData.sessions += 1
      regionData.totalScore += score
      regionData.bestScore = Math.max(regionData.bestScore, score)
      
      // Update accuracy if available
      if (session.accuracy !== undefined) {
        const prevAccuracy = regionData.avgAccuracy || 0
        regionData.avgAccuracy = (prevAccuracy * (regionData.sessions - 1) + session.accuracy) / regionData.sessions
      }
    }

    this.progressData.totalSessions += 1
    this.progressData.totalTime += duration

    // Update streaks
    this.updateStreaks()

    this.saveProgressData()
  }

  // Update daily streaks
  updateStreaks() {
    const now = new Date()
    const today = now.toDateString()
    const lastSession = this.progressData.streaks.lastSession

    if (lastSession) {
      const lastDate = new Date(lastSession)
      const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24))

      if (daysDiff === 0) {
        // Same day, no change
      } else if (daysDiff === 1) {
        // Next day, increment streak
        this.progressData.streaks.current += 1
        this.progressData.streaks.best = Math.max(
          this.progressData.streaks.best,
          this.progressData.streaks.current
        )
      } else {
        // Streak broken
        this.progressData.streaks.current = 1
      }
    } else {
      // First session
      this.progressData.streaks.current = 1
      this.progressData.streaks.best = 1
    }

    this.progressData.streaks.lastSession = now.toISOString()
  }

  // Check for new achievements
  checkAchievements(session) {
    const achievements = []

    // Score-based achievements
    if (session.score >= 1000) {
      achievements.push({ 
        id: 'score_1000', 
        name: 'Score Master', 
        description: 'Score 1000+ in a single session',
        icon: '🏆'
      })
    }

    // Streak achievements
    if (this.progressData.streaks.current >= 7) {
      achievements.push({ 
        id: 'streak_7', 
        name: 'Week Warrior', 
        description: '7-day training streak',
        icon: '🔥'
      })
    }

    // Region mastery
    const regionData = this.progressData.regionProgress[session.region]
    if (regionData && regionData.sessions >= 10 && regionData.avgAccuracy > 0.8) {
      achievements.push({ 
        id: `master_${session.region}`, 
        name: `${session.region} Master`, 
        description: `Mastered ${session.region} training`,
        icon: '🧠'
      })
    }

    // Add new achievements
    achievements.forEach(achievement => {
      if (!this.achievements.find(a => a.id === achievement.id)) {
        this.achievements.push({
          ...achievement,
          unlockedAt: Date.now()
        })
      }
    })

    return achievements
  }

  // Calculate XP based on performance
  calculateXP(score, difficulty, duration) {
    const baseXP = score * 0.1
    const difficultyBonus = baseXP * (difficulty * 0.1)
    const efficiencyBonus = duration < 120 ? baseXP * 0.2 : 0
    
    return Math.floor(baseXP + difficultyBonus + efficiencyBonus)
  }

  // Update neuroplasticity score
  updateNeuroplasticityScore() {
    let totalScore = 0
    let regionCount = 0

    Object.values(this.progressData.regionProgress).forEach(region => {
      if (region.sessions > 0) {
        // Factor in sessions, accuracy, and best score
        const regionScore = (
          (region.sessions * 10) +
          (region.avgAccuracy * 100) +
          (region.bestScore * 0.1)
        ) / 3
        
        totalScore += regionScore
        regionCount += 1
      }
    })

    // Add streak bonus
    const streakBonus = this.progressData.streaks.current * 50

    this.neuroplasticityScore = Math.floor(
      (totalScore / Math.max(regionCount, 1)) + streakBonus
    )
  }

  // Get recovery time recommendation
  getRecoveryTime(region) {
    const recentSessions = this.getRecentSessions(region, 1)
    if (recentSessions.length === 0) return 0

    const lastSession = recentSessions[0]
    const timeSinceLastSession = Date.now() - lastSession.timestamp
    const hoursElapsed = timeSinceLastSession / (1000 * 60 * 60)

    // Recommend at least 4 hours between intense sessions
    const recommendedHours = 4
    const remainingHours = Math.max(0, recommendedHours - hoursElapsed)

    return remainingHours
  }

  // Get last session data
  getLastSession() {
    return this.sessionHistory[this.sessionHistory.length - 1] || null
  }

  // Save data to localStorage
  saveSessionHistory() {
    try {
      localStorage.setItem('neuroplasticity_sessions', JSON.stringify(this.sessionHistory))
    } catch (e) {
      console.error('Failed to save session history:', e)
    }
  }

  saveProgressData() {
    try {
      localStorage.setItem('neuroplasticity_progress', JSON.stringify(this.progressData))
    } catch (e) {
      console.error('Failed to save progress data:', e)
    }
  }

  // Get detailed analytics
  getAnalytics() {
    return {
      totalSessions: this.progressData.totalSessions,
      totalTime: this.progressData.totalTime,
      averageSessionTime: this.progressData.totalTime / Math.max(this.progressData.totalSessions, 1),
      neuroplasticityScore: this.neuroplasticityScore,
      currentStreak: this.progressData.streaks.current,
      bestStreak: this.progressData.streaks.best,
      regionBreakdown: Object.entries(this.progressData.regionProgress).map(([region, data]) => ({
        region,
        ...data,
        averageScore: data.totalScore / Math.max(data.sessions, 1)
      })),
      achievements: this.achievements,
      recentActivity: this.sessionHistory.slice(-10).reverse()
    }
  }
}