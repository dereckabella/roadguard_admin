import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App'; // Login page
import AdminHomePage from './AdminHomePage'; // Admin dashboard

function MainApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} /> {/* Login page */}
        <Route path="/admin-home" element={<AdminHomePage />} /> {/* Admin dashboard */}
      </Routes>
    </Router>
  );
}

export default MainApp;
