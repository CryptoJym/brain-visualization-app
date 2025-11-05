import React, { useState, useEffect } from 'react';
import { getAssessmentHistory, getPersonalizedInsights } from '../lib/mem0';
import { getCurrentUser } from '../lib/supabase';

export default function SavedAssessments({ onSelectAssessment }) {
  const [assessments, setAssessments] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        
        // Load assessment history
        const history = await getAssessmentHistory(currentUser.id);
        setAssessments(history);
        
        // Load personalized insights
        const userInsights = await getPersonalizedInsights(currentUser.id);
        setInsights(userInsights.insights);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your assessment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-light text-white mb-8">Your Assessment History</h1>
        
        {/* Personalized Insights */}
        {insights.length > 0 && (
          <div className="bg-purple-600/20 border border-purple-600/50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-medium text-white mb-4">
              Your Personalized Insights
            </h2>
            <ul className="space-y-2">
              {insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span className="text-gray-300">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Assessment List */}
        {assessments.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 text-center">
            <p className="text-gray-300 mb-4">
              No assessments found. Take your first assessment to see your brain impact map.
            </p>
            <button
              onClick={() => onSelectAssessment(null)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-300"
            >
              Start Assessment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment, idx) => {
              const metadata = assessment.metadata || {};
              const aceCount = metadata.ace_count || 0;
              const regions = metadata.primary_regions || [];
              const timestamp = metadata.timestamp || assessment.created_at;
              
              return (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    // Parse the assessment data if it's stored as JSON
                    try {
                      const data = assessment.content.includes('assessmentData') 
                        ? JSON.parse(assessment.content)
                        : assessment;
                      onSelectAssessment(data);
                    } catch (e) {
                      console.error('Error parsing assessment:', e);
                      onSelectAssessment(assessment);
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-white">
                      Assessment #{assessments.length - idx}
                    </h3>
                    <span className="text-sm text-gray-400">
                      {formatDate(timestamp)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">ACE Score:</span>
                      <span className="ml-2 text-white font-medium">{aceCount}</span>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Regions Affected:</span>
                      <span className="ml-2 text-white font-medium">{regions.length}</span>
                    </div>
                  </div>
                  
                  {regions.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2">Primary impacts:</p>
                      <div className="flex flex-wrap gap-2">
                        {regions.slice(0, 3).map((region, ridx) => (
                          <span
                            key={ridx}
                            className="text-xs bg-gray-800 px-3 py-1 rounded-full"
                          >
                            {region}
                          </span>
                        ))}
                        {regions.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{regions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                      View Brain Map →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => onSelectAssessment(null)}
            className="px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300"
          >
            Take New Assessment
          </button>
          
          {assessments.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete all your assessment data? This cannot be undone.')) {
                  // Delete functionality would go here
                  console.log('Delete requested');
                }
              }}
              className="px-6 py-3 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg font-medium hover:bg-red-600/30 transition-all duration-300"
            >
              Delete All Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
}