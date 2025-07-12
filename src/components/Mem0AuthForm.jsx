import React, { useState } from 'react';
import { mem0Auth } from '../lib/mem0-auth';

export default function Mem0AuthForm({ onSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let result;
      
      if (mode === 'signup') {
        // Check if user already exists
        const exists = await mem0Auth.checkUserExists(email);
        if (exists) {
          throw new Error('An account with this email already exists');
        }
        
        result = await mem0Auth.signUp(email, password, displayName || email.split('@')[0]);
      } else {
        result = await mem0Auth.signIn(email, password);
      }

      if (result.success) {
        if (onSuccess) onSuccess(result.user);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/10 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 text-center">
            <h2 className="text-3xl font-light text-white mb-2">
              {mode === 'signin' ? 'Welcome Back' : 'Create Your Profile'}
            </h2>
            <p className="text-gray-300 text-sm">
              Secure memory-based authentication powered by Mem0 AI
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {mode === 'signup' && (
              <div>
                <label className="block text-white text-sm mb-2">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="How should we address you?"
                />
              </div>
            )}

            <div>
              <label className="block text-white text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-400 mt-1">
                Used for local verification only - not stored in Mem0
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-600/25'
              } text-white`}
            >
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Profile'}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="p-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              {mode === 'signin' ? "Don't have a profile?" : "Already have a profile?"}
              <button
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                }}
                className="ml-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                {mode === 'signin' ? 'Create One' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-gray-500">
            🔒 SOC 2 & HIPAA Compliant Memory Storage
          </p>
          <p className="text-xs text-gray-500">
            Your assessments are stored in your personal Mem0 memory space
          </p>
        </div>
      </div>
    </div>
  );
}