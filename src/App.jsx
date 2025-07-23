import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OfficialACEsQuestionnaire from './components/OfficialACEsQuestionnaire';
import SimpleBrainResults from './components/SimpleBrainResults';

const App = () => {
  const [assessmentResults, setAssessmentResults] = useState(null);

  const MainApp = () => {
    if (assessmentResults) {
      return <SimpleBrainResults assessmentResults={assessmentResults} />;
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