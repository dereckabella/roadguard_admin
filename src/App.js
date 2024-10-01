import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import roadguardLogo from './images/roadguardlogo.png';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';  // Importing Eye icons
import './App.css';

const App = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
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
      navigate('/login');
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

        // Navigate based on user role (you can adjust this logic based on your app)
        navigate('/admin-home');
      } else {
        setAttempts(attempts + 1);
        setMessage(`Invalid credentials. You have ${3 - attempts} attempts left.`);
      }
    }, 2000); // Simulating delay
  };

  return (
    <div className="login-container">
      {/* Left Section with Logo */}
      <div className="logo-section">
        <img
          src={roadguardLogo}
          alt="Roadguard Logo"
          className="roadguard-logo"
        />
        <h1 className="roadguard-title">Roadguard</h1>
        <p className="roadguard-tagline">Your Safety, Our Priority</p>
      </div>

      {/* Right Section with Login Form */}
      <div className="login-form">
        <h2 className="login-title">Login</h2>

        {/* ID Input */}
        <div className="input-container">
          <FaUser className="input-icon" />
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
          <FaLock className="input-icon" />
          <label htmlFor="password" className="input-label">Password</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
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
            {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Using icons instead of text */}
          </button>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="login-button"
        >
          {loading ? "Logging in..." : "LOGIN"}
        </button>

        {/* Login Message */}
        {message && (
          <p className="login-message">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};
    
export default App;