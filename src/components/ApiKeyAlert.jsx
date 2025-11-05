import React, { useState } from 'react';
import { generateErrorMessage, getSetupInstructions } from '../utils/apiKeyValidator';

/**
 * API Key Configuration Alert
 * Shows users when features are unavailable due to missing API keys
 * with helpful setup instructions
 */
const ApiKeyAlert = ({ featureName }) => {
  const [showDetails, setShowDetails] = useState(false);
  const error = generateErrorMessage(featureName);

  if (!error) {
    return null; // Feature is configured
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-white font-medium mb-2">{error.title}</h3>
          <p className="text-gray-300 text-sm mb-4">{error.message}</p>

          {/* Show Details Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors flex items-center gap-2"
          >
            {showDetails ? '▼' : '▶'} {showDetails ? 'Hide' : 'Show'} Setup Instructions
          </button>

          {/* Expanded Details */}
          {showDetails && (
            <div className="mt-4 space-y-4">
              {error.keys.map((key) => {
                const instructions = getSetupInstructions(key);
                const keyDisplay = key.replace('VITE_', '');

                return (
                  <div key={key} className="bg-black/30 rounded-xl p-4 border border-white/10">
                    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                      <span className="text-yellow-400">🔑</span>
                      {keyDisplay}
                    </h4>

                    {instructions.url && (
                      <a
                        href={instructions.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm block mb-2 transition-colors"
                      >
                        {instructions.url} ↗
                      </a>
                    )}

                    <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                      {instructions.steps.map((step, index) => (
                        <li key={index} className="ml-2">{step}</li>
                      ))}
                    </ol>
                  </div>
                );
              })}

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-300 text-sm">
                  <strong>💡 Tip:</strong> Copy <code className="bg-black/40 px-2 py-1 rounded">.env.example</code> to{' '}
                  <code className="bg-black/40 px-2 py-1 rounded">.env</code> and fill in your API keys.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyAlert;
