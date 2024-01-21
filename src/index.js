import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Make sure this exists or remove if not needed.
import App from './App';
import reportWebVitals from './reportWebVitals';

// Inject Vercel Analytics
import { inject } from '@vercel/analytics';
inject();

// Use the new createRoot API for React 18
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
reportWebVitals();
