import React from 'react';

function LoadingScreen({ progress }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated brain logo */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-40 animate-ping animation-delay-200"></div>
          <div className="relative w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center animate-pulse">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        
        {/* Loading text */}
        <h2 className="text-2xl font-light text-white mb-2">Initializing Neural Map</h2>
        <p className="text-gray-400 mb-8">Preparing your interactive brain visualization</p>
        
        {/* Progress bar */}
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}

export default LoadingScreen;