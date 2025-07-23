import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResearchBasedACEsQuestionnaire from './components/ResearchBasedACEsQuestionnaire';
import BrainImpactResults from './components/BrainImpactResults';

const App = () => {
  const [assessmentResults, setAssessmentResults] = useState(null);

  const MainApp = () => {
    if (assessmentResults) {
      return <BrainImpactResults assessmentResults={assessmentResults} />;
    }
    
    return (
      <ResearchBasedACEsQuestionnaire 
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