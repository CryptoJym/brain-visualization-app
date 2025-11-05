import React, { useState, useEffect } from 'react';
import { mem0Auth, getUserAssessments } from '../lib/mem0-auth';
import { getPersonalizedInsights } from '../lib/mem0';

export default function Mem0SavedAssessments({ onSelectAssessment }) {
  const [assessments, setAssessments] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = mem0Auth.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        
        // Load assessment history
        const history = await getUserAssessments();
        setAssessments(history);
        
        // Load personalized insights
        const userInsights = await getPersonalizedInsights(currentUser.userId);
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

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account and all data? This cannot be undone.')) {
      return;
    }

    try {
      await mem0Auth.deleteUser(user.userId);
      window.location.reload(); // Refresh to show auth screen
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your memory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* User Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light text-white">
              Welcome back, {user?.displayName || 'User'}
            </h1>
            <p className="text-gray-400 mt-1">Your assessment history and insights</p>
          </div>
          
          <button
            onClick={() => {
              mem0Auth.signOut();
              window.location.reload();
            }}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Sign Out
          </button>
        </div>
        
        {/* Personalized Insights */}
        {insights.length > 0 && (
          <div className="bg-purple-600/20 border border-purple-600/50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-medium text-white mb-4 flex items-center gap-2">
              <span>🧠</span> Your Personalized Brain Insights
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
              No assessments found in your memory. Take your first assessment to see your brain impact map.
            </p>
            <button
              onClick={() => onSelectAssessment(null)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-600/25 transition-all duration-300"
            >
              Start First Assessment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-white mb-4">Assessment History</h2>
            
            {assessments.map((assessment, idx) => {
              const { analysis, assessmentData, timestamp } = assessment;
              const aceCount = analysis?.summary?.totalACEs || 0;
              const regionsAffected = analysis?.summary?.totalRegionsAffected || 0;
              const primaryImpacts = analysis?.summary?.primaryImpacts || [];
              
              return (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  onClick={() => onSelectAssessment(assessment)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-white">
                      Assessment #{assessments.length - idx}
                    </h3>
                    <span className="text-sm text-gray-400">
                      {formatDate(timestamp)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-400">ACE Score:</span>
                      <span className="ml-2 text-white font-medium">{aceCount}</span>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Regions:</span>
                      <span className="ml-2 text-white font-medium">{regionsAffected}</span>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Age:</span>
                      <span className="ml-2 text-white font-medium">{assessmentData?.currentAge || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {primaryImpacts.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Primary impacts:</p>
                      <div className="flex flex-wrap gap-2">
                        {primaryImpacts.slice(0, 3).map((impact, ridx) => (
                          <span
                            key={ridx}
                            className="text-xs bg-gray-800 px-3 py-1 rounded-full"
                          >
                            {impact.region} ({Math.round(impact.impact * 100)}%)
                          </span>
                        ))}
                        {primaryImpacts.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{primaryImpacts.length - 3} more
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
          
          {user && (
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-3 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg font-medium hover:bg-red-600/30 transition-all duration-300"
            >
              Delete Account & All Data
            </button>
          )}
        </div>

        {/* Mem0 Attribution */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500">
            Powered by Mem0 AI - SOC 2 & HIPAA Compliant Memory Storage
          </p>
        </div>
      </div>
    </div>
  );
}