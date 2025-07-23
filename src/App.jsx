import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OfficialACEsQuestionnaire from './components/OfficialACEsQuestionnaire';
import ComprehensiveResultsDisplay from './components/ComprehensiveResultsDisplay';
import DataFocusedResults from './components/DataFocusedResults';

const App = () => {
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [displayMode, setDisplayMode] = useState('data-focused'); // 'comprehensive' or 'data-focused'

  const MainApp = () => {
    if (assessmentResults) {
      return (
        <div>
          <div className="fixed top-4 right-4 z-20">
            <button
              onClick={() => setDisplayMode(displayMode === 'comprehensive' ? 'data-focused' : 'comprehensive')}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
            >
              Switch to {displayMode === 'comprehensive' ? 'Data-Focused' : 'Comprehensive'} View
            </button>
          </div>
          {displayMode === 'comprehensive' 
            ? <ComprehensiveResultsDisplay assessmentResults={assessmentResults} />
            : <DataFocusedResults assessmentResults={assessmentResults} />
          }
        </div>
      );
    }
    
    return (
      <OfficialACEsQuestionnaire 
        onComplete={(results) => {
          if (results) {
            setAssessmentResults(results);
          }
        }}
      />
    );
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
      </Routes>
    </Router>
  );
};

export default App;