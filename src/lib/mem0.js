import { MemoryClient } from 'mem0ai'

// Initialize Mem0 client
const mem0ApiKey = import.meta.env.VITE_MEM0_API_KEY

export const memoryClient = mem0ApiKey 
  ? new MemoryClient({ apiKey: mem0ApiKey })
  : null

// Memory categories for brain assessments
export const MEMORY_CATEGORIES = {
  ASSESSMENT: 'trauma_assessment',
  BRAIN_IMPACT: 'brain_impact_analysis',
  EEG_DATA: 'eeg_recordings',
  THERAPY_PROGRESS: 'therapy_progress',
  USER_NOTES: 'user_notes'
}

// Store assessment results in memory
export const storeAssessmentMemory = async (userId, assessmentData, analysis) => {
  if (!memoryClient) {
    console.warn('Mem0 not configured, storing locally')
    localStorage.setItem(`assessment_${userId}`, JSON.stringify({ assessmentData, analysis }))
    return { success: true, local: true }
  }
  
  try {
    // Store the assessment questions and answers
    const assessmentMemory = {
      role: 'user',
      content: `Completed trauma assessment on ${new Date().toLocaleDateString()}. 
                Age: ${assessmentData.currentAge}, 
                Biological Sex: ${assessmentData.biologicalSex},
                Total ACEs: ${Object.values(assessmentData.answers).filter(a => a.experienced === 'yes').length}`
    }
    
    // Store detailed brain impact analysis
    const brainImpactMemory = {
      role: 'assistant',
      content: `Brain impact analysis shows ${analysis.summary.totalRegionsAffected} regions affected. 
                Primary impacts: ${analysis.summary.primaryImpacts.map(i => `${i.region} (${Math.round(i.impact * 100)}%)`).join(', ')}`
    }
    
    // Add memories with metadata
    await memoryClient.add([assessmentMemory, brainImpactMemory], {
      user_id: userId,
      metadata: {
        category: MEMORY_CATEGORIES.ASSESSMENT,
        timestamp: new Date().toISOString(),
        ace_count: analysis.summary.totalACEs,
        primary_regions: analysis.summary.primaryImpacts.map(i => i.region),
        has_protective_factors: analysis.summary.hasProtectiveFactors
      }
    })
    
    // Store raw data for future retrieval
    const rawDataMemory = {
      role: 'system',
      content: JSON.stringify({
        assessmentData,
        analysis,
        version: '1.0'
      })
    }
    
    await memoryClient.add([rawDataMemory], {
      user_id: userId,
      metadata: {
        category: MEMORY_CATEGORIES.BRAIN_IMPACT,
        timestamp: new Date().toISOString(),
        data_type: 'raw_assessment'
      }
    })
    
    return { success: true, message: 'Assessment stored in long-term memory' }
  } catch (error) {
    console.error('Error storing memory:', error)
    return { success: false, error: error.message }
  }
}

// Retrieve user's assessment history
export const getAssessmentHistory = async (userId) => {
  if (!memoryClient) {
    const localData = localStorage.getItem(`assessment_${userId}`)
    return localData ? [JSON.parse(localData)] : []
  }
  
  try {
    const memories = await memoryClient.search({
      query: 'trauma assessment brain impact',
      user_id: userId,
      metadata: {
        category: MEMORY_CATEGORIES.ASSESSMENT
      }
    })
    
    return memories
  } catch (error) {
    console.error('Error retrieving memories:', error)
    return []
  }
}

// Store EEG recording data
export const storeEEGRecording = async (userId, eegData, analysis) => {
  if (!memoryClient) {
    console.warn('Mem0 not configured for EEG storage')
    return { success: false, error: 'Memory system not configured' }
  }
  
  try {
    const eegMemory = {
      role: 'user',
      content: `EEG recording from ${new Date().toLocaleString()}. 
                Overall trauma score: ${(analysis.overallScore * 100).toFixed(0)}%. 
                Key findings: ${analysis.recommendations.join(', ')}`
    }
    
    await memoryClient.add([eegMemory], {
      user_id: userId,
      metadata: {
        category: MEMORY_CATEGORIES.EEG_DATA,
        timestamp: new Date().toISOString(),
        trauma_score: analysis.overallScore,
        regions_analyzed: Object.keys(analysis.regions)
      }
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error storing EEG data:', error)
    return { success: false, error: error.message }
  }
}

// Get personalized insights based on memory
export const getPersonalizedInsights = async (userId) => {
  if (!memoryClient) {
    return { insights: ['Complete an assessment to receive personalized insights'] }
  }
  
  try {
    const query = 'What are the key patterns and insights from my assessments and brain data?'
    const results = await memoryClient.search({
      query,
      user_id: userId,
      limit: 10
    })
    
    // Process memories to generate insights
    const insights = []
    
    if (results.length > 0) {
      // Look for patterns in affected regions
      const regionCounts = {}
      results.forEach(memory => {
        if (memory.metadata?.primary_regions) {
          memory.metadata.primary_regions.forEach(region => {
            regionCounts[region] = (regionCounts[region] || 0) + 1
          })
        }
      })
      
      const mostAffected = Object.entries(regionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([region]) => region)
      
      if (mostAffected.length > 0) {
        insights.push(`Your most consistently affected brain regions are: ${mostAffected.join(', ')}`)
      }
      
      // Check for protective factors
      const hasProtective = results.some(m => m.metadata?.has_protective_factors)
      if (hasProtective) {
        insights.push('You have protective factors that help build resilience')
      }
      
      // Add therapy recommendations based on patterns
      if (mostAffected.includes('Amygdala')) {
        insights.push('Consider EMDR or somatic therapies for fear processing')
      }
      if (mostAffected.includes('Hippocampus')) {
        insights.push('Memory reconsolidation therapy may be beneficial')
      }
      if (mostAffected.includes('Superior Frontal')) {
        insights.push('Cognitive behavioral therapy could help with executive function')
      }
    }
    
    return { insights: insights.length > 0 ? insights : ['Complete more assessments to see patterns'] }
  } catch (error) {
    console.error('Error generating insights:', error)
    return { insights: ['Unable to generate insights at this time'] }
  }
}

// Delete user memories (for privacy)
export const deleteUserMemories = async (userId) => {
  if (!memoryClient) {
    localStorage.removeItem(`assessment_${userId}`)
    return { success: true }
  }
  
  try {
    await memoryClient.delete({ user_id: userId })
    return { success: true, message: 'All memories deleted' }
  } catch (error) {
    console.error('Error deleting memories:', error)
    return { success: false, error: error.message }
  }
}