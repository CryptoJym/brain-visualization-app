import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OfficialACEsQuestionnaire from './components/OfficialACEsQuestionnaire';
import ComprehensiveResultsDisplay from './components/ComprehensiveResultsDisplay';
import DataFocusedResults from './components/DataFocusedResults';
import NeurologicalNarrativeResults from './components/NeurologicalNarrativeResults';
import ModernResultsDisplay from './components/ModernResultsDisplay';

const App = () => {
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [displayMode, setDisplayMode] = useState('modern'); // 'modern', 'narrative', 'data-focused', or 'comprehensive'

  const MainApp = () => {
    if (assessmentResults) {
      return (
        <div>
          <div className="fixed top-4 right-4 z-20 flex gap-2">
            <select
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm backdrop-blur-sm"
            >
              <option value="modern">Modern View</option>
              <option value="narrative">Neurological Narrative</option>
              <option value="data-focused">Data-Focused</option>
              <option value="comprehensive">Comprehensive</option>
            </select>
          </div>
          {displayMode === 'modern' && <ModernResultsDisplay assessmentResults={assessmentResults} />}
          {displayMode === 'comprehensive' && <ComprehensiveResultsDisplay assessmentResults={assessmentResults} />}
          {displayMode === 'data-focused' && <DataFocusedResults assessmentResults={assessmentResults} />}
          {displayMode === 'narrative' && <NeurologicalNarrativeResults assessmentResults={assessmentResults} />}
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