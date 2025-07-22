import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PersonalizedThreeBrain from './components/PersonalizedThreeBrain';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<PersonalizedThreeBrain />} />
    </Routes>
  </Router>
);

export default App;