import React, { useState, useEffect } from 'react';
import HealingJourneyVisualization from './HealingJourneyVisualization';
import { supabase } from '../config/supabaseClient';
import { calculateHealingMetrics } from '../utils/HealingMetrics';

// Integration component that connects healing visualization with actual user data
export default function HealingJourneyIntegration({ userId }) {
  const [assessmentData, setAssessmentData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile);

      // Load assessment history
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (assessmentsError) throw assessmentsError;

      // Transform assessment data for visualization
      const transformedData = assessments.map(assessment => ({
        date: assessment.created_at,
        brainImpacts: assessment.brain_impacts || {},
        responses: assessment.responses || {},
        metadata: assessment.metadata || {}
      }));

      setHistoricalData(transformedData);
      setAssessmentData(transformedData[transformedData.length - 1]);

    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHealingProgress = async (metrics) => {
    try {
      const { error } = await supabase
        .from('healing_progress')
        .insert({
          user_id: userId,
          metrics,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving healing progress:', err);
    }
  };

  // Handle adding new healing activities
  const addHealingActivity = async (activity) => {
    try {
      const updatedActivities = [
        ...(userProfile?.healing_activities || []),
        activity
      ];

      const { error } = await supabase
        .from('user_profiles')
        .update({ healing_activities: updatedActivities })
        .eq('user_id', userId);

      if (error) throw error;

      setUserProfile(prev => ({
        ...prev,
        healing_activities: updatedActivities
      }));

    } catch (err) {
      console.error('Error updating healing activities:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-indigo-900 to-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading your healing data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-indigo-900 to-black">
        <div className="text-center bg-red-500/20 border border-red-500/50 rounded-lg p-8">
          <p className="text-white text-xl mb-4">Error loading healing data</p>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={loadUserData}
            className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If no assessment data, show onboarding
  if (!assessmentData || historicalData.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-indigo-900 to-black">
        <div className="text-center">
          <h2 className="text-3xl font-light text-white mb-4">
            Start Your Healing Journey
          </h2>
          <p className="text-gray-300 mb-8">
            Complete your first assessment to begin tracking your brain's healing progress
          </p>
          <button
            onClick={() => window.location.href = '/assessment'}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Take Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <HealingJourneyVisualization
        assessmentData={assessmentData}
        historicalData={historicalData}
        userProfile={userProfile}
        onMetricsUpdate={saveHealingProgress}
        onAddActivity={addHealingActivity}
      />
      
      {/* Quick Stats Overlay */}
      <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-xl rounded-lg p-4 border border-white/20">
        <h3 className="text-white font-medium mb-2">Your Journey</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <p>Started: {new Date(historicalData[0].date).toLocaleDateString()}</p>
          <p>Assessments: {historicalData.length}</p>
          <p>Activities: {userProfile?.healing_activities?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}

// Standalone function to integrate with existing assessment flow
export function integrateHealingVisualization(assessmentResults, userId) {
  // This function can be called after an assessment is completed
  // to automatically update the healing visualization
  
  return new Promise(async (resolve, reject) => {
    try {
      // Calculate metrics from assessment
      const metrics = calculateHealingMetrics(assessmentResults);
      
      // Save to database
      const { error } = await supabase
        .from('assessments')
        .insert({
          user_id: userId,
          brain_impacts: assessmentResults.brainImpacts,
          responses: assessmentResults.responses,
          metrics,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      resolve({
        success: true,
        metrics,
        message: 'Assessment saved and healing progress updated'
      });
      
    } catch (err) {
      reject({
        success: false,
        error: err.message
      });
    }
  });
}