import React, { useState, useEffect } from 'react';
import { useNavigate, Route, Routes } from 'react-router-dom';
import roadguardLogo from './images/roadguardlogo.png';
import AdminHomePage from './AdminHomePage'; // Import AdminHomePage
import './App.css';

const App = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Load stored ID from localStorage if 'Remember Me' was selected
  useEffect(() => {
    const storedId = localStorage.getItem('rememberedId');
    if (storedId) setId(storedId);
  }, []);

  // Session timeout logic (15 minutes)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage("Session expired, please log in again.");
      handleLogout();
    }, 15 * 60 * 1000); // 15 minutes session timeout

    return () => clearTimeout(timer); // Clear timeout on component unmount
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    // Validate inputs
    if (!id || !password) {
      setMessage('Please enter both ID and password.');
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    // Rate limiting logic
    if (attempts >= 3) {
      setMessage('Too many failed attempts. Please try again later.');
      return;
    }

    setLoading(true);

    // Simulate login request (you can replace this with an API call)
    setTimeout(() => {
      setLoading(false);

      if (id === 'Admin' && password === 'Admin123') {
        setMessage('Login successful!');

        // Remember Me logic
        if (rememberMe) {
          localStorage.setItem('rememberedId', id);
        } else {
          localStorage.removeItem('rememberedId');
        }

        // Navigate to admin home page after successful login
        navigate('/admin-home');
      } else {
        setAttempts(attempts + 1);
        setMessage(`Invalid credentials. You have ${3 - attempts} attempts left.`);
      }
    }, 2000); // Simulating delay
  };

  const handleLogout = () => {
    // Clear user session data
    setId('');
    setPassword('');
    setMessage('You have been logged out.');
    setAttempts(0);
    setRememberMe(false);

    // Clear stored ID from localStorage
    localStorage.removeItem('rememberedId');

    // Redirect to login page
    navigate('/');
  };

  const handleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <Routes>
      {/* Define your routes here */}
      <Route
        path="/"
        element={
          <div className="login-container">
            {/* Left Section with Logo */}
            <div className="logo-section">
              <img src={roadguardLogo} alt="Roadguard Logo" className="roadguard-logo" />
              <h1 className="roadguard-title">Roadguard</h1>
              <p className="roadguard-tagline">Your Safety, Our Priority</p>
            </div>

            {/* Right Section with Login Form */}
            <div className="login-form">
              <h2 className="login-title">Login</h2>

              {/* ID Input */}
              <div className="input-container">
                <label htmlFor="id" className="input-label">ID</label>
                <input
                  id="id"
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="input-field"
                  onFocus={(e) => (e.target.style.border = '1px solid #FFD700')}
                  onBlur={(e) => (e.target.style.border = '1px solid #ccc')}
                />
              </div>

              {/* Password Input with Toggle */}
              <div className="input-container">
                <label htmlFor="password" className="input-label">Password</label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  onFocus={(e) => (e.target.style.border = '1px solid #FFD700')}
                  onBlur={(e) => (e.target.style.border = '1px solid #ccc')}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Remember Me Checkbox */}
              <label className="remember-me">
                <input type="checkbox" checked={rememberMe} onChange={handleRememberMe} />
                Remember Me
              </label>

              {/* Login Button */}
              <button onClick={handleLogin} disabled={loading} className="login-button">
                {loading ? 'Logging in...' : 'LOGIN'}
              </button>

              {/* Login Message */}
              {message && <p className="login-message">{message}</p>}
            </div>
          </div>
        }
      />
      <Route path="/admin-home" element={<AdminHomePage handleLogout={handleLogout} />} />
    </Routes>
  );
};

export default App;
