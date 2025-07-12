import React, { useEffect, useState } from 'react';

export default function TestBrain() {
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('TestBrain component mounted');
    setStatus('Component loaded successfully!');
  }, []);

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        background: 'red', 
        color: 'white',
        textAlign: 'center'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      background: '#0a0a0a', 
      color: 'white',
      minHeight: '100vh',
      textAlign: 'center'
    }}>
      <h1>Test Brain Component</h1>
      <p>Status: {status}</p>
      <p>If you see this, the app is loading correctly!</p>
    </div>
  );
}