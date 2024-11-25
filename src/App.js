import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import roadguardLogo from './images/roadguardlogo.png';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import roadImage from './images/road2.gif';
import logiImage from './images/road.jpg';
import tireImage from './images/road1.png';
 
import './App.css';

const App = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedId = localStorage.getItem('rememberedId');
    if (storedId) setId(storedId);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage("Session expired, please log in again.");
      navigate('/login');
    }, 15 * 60 * 1000); // 15 minutes session timeout

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!id || !password) {
      setMessage('Please enter both ID and password.');
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    if (attempts >= 3) {
      setMessage('Too many failed attempts. Please try again later.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (id === 'Admin' && password === 'Admin123') {
        setMessage('Login successful!');
        if (rememberMe) {
          localStorage.setItem('rememberedId', id);
        }
        navigate('/admin-home');
      } else {
        setAttempts(attempts + 1);
        setMessage(`Invalid credentials. You have ${3 - attempts} attempts left.`);
      }
    }, 2000);
  };

  const carouselImages = [roadImage, logiImage, tireImage];

  const carouselSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  return (
    <div className="login-container">
      {/* Split Container */}
      <div className="split-container">
        {/* Left Section with Carousel */}
        <div className="logo-section">
          <Slider {...carouselSettings} className="carousel-background">
            {carouselImages.map((image, index) => (
              <div key={index}>
                <img src={image} alt={`carousel-${index}`} className="carousel-image" />
              </div>
            ))}
          </Slider>
        </div>

        {/* Right Section with Login Form */}
        <div className="login-form-section">
          <div className="login-header mt-28" >
            <img src={roadguardLogo} alt="Roadguard Logo" className="header-logo rounded-2xl" /> {/* Logo in Header */}
            <h2 className="login-title">Welcome Back!</h2>
            <p className="login-subtitle">Please enter your ID and password to continue</p>
          </div>

          {/* ID Input */}
          <div className="input-container">
            <FaUser className="input-icon" />
            <input
              id="id"
              type="text"
              placeholder="Enter ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Password Input with Toggle */}
          <div className="input-container">
            <FaLock className="input-icon" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
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

          {/* Social Media Login Options */}
          <div className="social-login mb-20">
            <p>Follow us</p>
            <div className="social-icons">
              <a href="https://www.facebook.com/profile.php?id=100067045089619" target="_blank" rel="noopener noreferrer">
                <button className="social-btn facebook">
                  <FaFacebook /> 
                </button>
              </a>
            </div>
            
          </div>

          {/* Footer Text */}
          <div className="login-footer">
            <p>Powered by <strong>RoadGuard 2024.</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
