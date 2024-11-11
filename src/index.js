import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import LandingPage from './LandingPage'; // Import LandingPage
import App from './App';
import AdminHomePage from './AdminHomePage'; // Import AdminHomePage
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} /> {/* Set LandingPage as the default route */}
        <Route path="/app" element={<App />} />
        <Route path="/admin-home" element={<AdminHomePage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
