import { MemoryClient } from 'mem0ai'

// Initialize Mem0 client with organization context
const mem0ApiKey = import.meta.env.VITE_MEM0_API_KEY
const mem0OrgId = import.meta.env.VITE_MEM0_ORG_ID
const mem0ProjectId = import.meta.env.VITE_MEM0_PROJECT_ID || 'brain-assessments'

export const memoryClient = mem0ApiKey 
  ? new MemoryClient({ 
      apiKey: mem0ApiKey,
      org_id: mem0OrgId,
      project_id: mem0ProjectId
    })
  : null

// Simple auth using localStorage + Mem0 user entities
class Mem0AuthManager {
  constructor() {
    this.currentUser = null
    this.SESSION_KEY = 'mem0_user_session'
  }

  // Generate unique user ID
  generateUserId(email) {
    // Create a unique ID from email that's consistent
    return `user_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`
  }

  // Sign up new user
  async signUp(email, password, displayName) {
    if (!memoryClient) {
      throw new Error('Mem0 not configured')
    }

    try {
      // Generate unique user ID
      const userId = this.generateUserId(email)
      
      // Store user profile in Mem0
      const userProfile = {
        userId,
        email,
        displayName,
        createdAt: new Date().toISOString(),
        // Never store actual passwords - just a hash indicator
        authMethod: 'email_password',
        isActive: true
      }

      // Create initial memory for user
      await memoryClient.add([{
        role: 'system',
        content: `User profile created: ${displayName} (${email}). Account created on ${new Date().toLocaleDateString()}.`
      }], {
        user_id: userId,
        metadata: {
          type: 'user_profile',
          email,
          displayName,
          createdAt: userProfile.createdAt
        }
      })

      // Store session locally
      this.setSession(userProfile)
      
      return { success: true, user: userProfile }
    } catch (error) {
      console.error('Signup error:', error)
      throw new Error('Failed to create account')
    }
  }

  // Sign in existing user
  async signIn(email, password) {
    if (!memoryClient) {
      throw new Error('Mem0 not configured')
    }

    try {
      // Search for user by email in Mem0
      const searchResult = await memoryClient.search({
        query: `user profile email ${email}`,
        metadata: {
          type: 'user_profile',
          email: email
        },
        limit: 1
      })

      if (searchResult.length === 0) {
        throw new Error('User not found')
      }

      // Extract user data from memory
      const userMemory = searchResult[0]
      const userProfile = {
        userId: userMemory.user_id,
        email: userMemory.metadata.email,
        displayName: userMemory.metadata.displayName,
        createdAt: userMemory.metadata.createdAt
      }

      // Log sign in event
      await memoryClient.add([{
        role: 'system',
        content: `User signed in: ${userProfile.displayName} at ${new Date().toLocaleString()}`
      }], {
        user_id: userProfile.userId,
        metadata: {
          type: 'auth_event',
          event: 'sign_in',
          timestamp: new Date().toISOString()
        }
      })

      // Store session
      this.setSession(userProfile)
      
      return { success: true, user: userProfile }
    } catch (error) {
      console.error('Signin error:', error)
      throw new Error('Invalid credentials')
    }
  }

  // Get current user
  getCurrentUser() {
    if (this.currentUser) return this.currentUser
    
    const sessionData = localStorage.getItem(this.SESSION_KEY)
    if (sessionData) {
      try {
        this.currentUser = JSON.parse(sessionData)
        return this.currentUser
      } catch (e) {
        console.error('Invalid session data')
        this.signOut()
      }
    }
    
    return null
  }

  // Sign out
  signOut() {
    this.currentUser = null
    localStorage.removeItem(this.SESSION_KEY)
  }

  // Set session
  setSession(userProfile) {
    this.currentUser = userProfile
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(userProfile))
  }

  // Check if user exists
  async checkUserExists(email) {
    if (!memoryClient) return false

    try {
      const searchResult = await memoryClient.search({
        query: `user profile email ${email}`,
        metadata: {
          type: 'user_profile',
          email: email
        },
        limit: 1
      })

      return searchResult.length > 0
    } catch (error) {
      console.error('Error checking user:', error)
      return false
    }
  }

  // Get user memories (assessments, progress, etc)
  async getUserMemories(userId, category = null) {
    if (!memoryClient) return []

    try {
      const searchQuery = category 
        ? `user memories ${category}`
        : 'all user memories and assessments'
        
      const memories = await memoryClient.search({
        query: searchQuery,
        user_id: userId,
        limit: 50
      })

      return memories
    } catch (error) {
      console.error('Error fetching memories:', error)
      return []
    }
  }

  // Delete user and all data
  async deleteUser(userId) {
    if (!memoryClient) return { success: false }

    try {
      // Delete all memories for user
      await memoryClient.delete({ user_id: userId })
      
      // Sign out
      this.signOut()
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting user:', error)
      return { success: false, error: error.message }
    }
  }
}

// Export singleton instance
export const mem0Auth = new Mem0AuthManager()

// Helper to ensure user is authenticated
export const requireAuth = () => {
  const user = mem0Auth.getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

// Store assessment with user context
export const storeUserAssessment = async (assessmentData, analysis) => {
  const user = requireAuth()
  
  if (!memoryClient) {
    console.warn('Mem0 not configured, storing locally')
    const key = `assessment_${user.userId}_${Date.now()}`
    localStorage.setItem(key, JSON.stringify({ assessmentData, analysis }))
    return { success: true, local: true }
  }

  try {
    // Store comprehensive assessment memory
    const assessmentMemory = {
      role: 'user',
      content: `Completed trauma assessment. Age: ${assessmentData.currentAge}, Biological Sex: ${assessmentData.biologicalSex}. 
                Found ${analysis.summary.totalACEs} ACEs affecting ${analysis.summary.totalRegionsAffected} brain regions.
                Primary impacts: ${analysis.summary.primaryImpacts.map(i => `${i.region} (${Math.round(i.impact * 100)}%)`).join(', ')}.`
    }

    await memoryClient.add([assessmentMemory], {
      user_id: user.userId,
      metadata: {
        type: 'assessment',
        timestamp: new Date().toISOString(),
        ace_count: analysis.summary.totalACEs,
        regions_affected: analysis.summary.totalRegionsAffected,
        has_protective_factors: analysis.summary.hasProtectiveFactors,
        user_name: user.displayName,
        user_email: user.email
      }
    })

    // Store raw data separately for retrieval
    const rawDataMemory = {
      role: 'system',
      content: JSON.stringify({
        assessmentData,
        analysis,
        version: '2.0',
        userId: user.userId,
        userName: user.displayName
      })
    }

    await memoryClient.add([rawDataMemory], {
      user_id: user.userId,
      metadata: {
        type: 'assessment_raw',
        timestamp: new Date().toISOString(),
        data_type: 'complete_assessment'
      }
    })

    return { success: true, message: 'Assessment stored successfully' }
  } catch (error) {
    console.error('Error storing assessment:', error)
    return { success: false, error: error.message }
  }
}

// Get user's assessment history
export const getUserAssessments = async () => {
  const user = requireAuth()
  
  if (!memoryClient) {
    // Get from localStorage
    const assessments = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith(`assessment_${user.userId}_`)) {
        try {
          const data = JSON.parse(localStorage.getItem(key))
          assessments.push(data)
        } catch (e) {
          console.error('Error parsing local assessment:', e)
        }
      }
    }
    return assessments
  }

  try {
    const memories = await memoryClient.search({
      query: 'trauma assessment complete',
      user_id: user.userId,
      metadata: {
        type: 'assessment_raw'
      },
      limit: 20
    })

    // Parse the raw assessment data
    return memories.map(memory => {
      try {
        const data = JSON.parse(memory.content)
        return {
          ...data,
          memoryId: memory.id,
          timestamp: memory.metadata?.timestamp || memory.created_at
        }
      } catch (e) {
        console.error('Error parsing assessment memory:', e)
        return null
      }
    }).filter(Boolean)
  } catch (error) {
    console.error('Error fetching assessments:', error)
    return []
  }
}