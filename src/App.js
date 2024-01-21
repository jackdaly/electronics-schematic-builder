// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

// Import your screen components
import SchematicQuestion from './schematicQuestion/schematicQuestion';
import WelcomePage from './WelcomePage';

const App = () => {
  // App state and functions (if any)
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/schematic-question" element={<SchematicQuestion />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
