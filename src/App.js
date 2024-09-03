import React from 'react';
import roadguardLogo from './images/roadguardlogo.png';

const App = () => {
  return (
    <div style={{
      position: 'relative',
      width: '1440px',
      height: '1024px',
      background: '#FFFFFF',
      fontFamily: 'Poppins, sans-serif',
    }}>
      {/* Image */}
      <img
        src={roadguardLogo}  // Use the imported variable here
        alt="Roadguard Logo"
        style={{
          position: 'absolute',
          width: '450px',
          height: '360px',
          left: '300px',
          top: '60px',
          objectFit: 'cover', // Ensures the image covers the specified dimensions
        }}
      />

      {/* Roadguard Text */}
      <h1 style={{
        position: 'absolute',
        width: '695px',
        height: '180px',
        left: '250px',
        top: '330px',
        fontWeight: '700',
        fontSize: '100px',
        lineHeight: '180px',
        color: '#000000',
      }}>
        Roadguard
      </h1>

      {/* Your Safety, Our Priority */}
      <p style={{
        position: 'absolute',
        width: '694px',
        height: '90px',
        left: '275px',
        top: '470px',
        fontWeight: '400',
        fontSize: '45px',
        lineHeight: '90px',
        color: '#FAFF00',
        textShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      }}>
        Your Safety, Our Priority
      </p>

      {/* Login Form Background */}
      <div style={{
        position: 'absolute',
        width: '443px',
        height: '543px',
        left: '917px',
        top: '100px',
        background: 'linear-gradient(180deg, #FAFF00 0%, #E0C55B 100%)',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        borderRadius: '30px',
      }}></div>

      {/* Login Title */}
      <h2 style={{
        position: 'absolute',
        width: '166px',
        height: '90px',
        left: '1055px',
        top: '100px',
        fontWeight: '700',
        fontSize: '60px',
        lineHeight: '90px',
        color: '#000000',
      }}>
        Login
      </h2>

      {/* ID Input Field */}
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '90px',
        left: '963px',
        top: '300px',
        boxSizing: 'border-box',
      }}>
        <label htmlFor="id" style={{
          position: 'absolute',
          width: '100%',
          height: '20px',
          left: '0',
          top: '0',
          fontWeight: '700',
          fontSize: '20px',
          lineHeight: '20px',
          color: '#000000',
        }}>ID</label>
        <input id="id" type="text" style={{
          position: 'absolute',
          width: '100%',
          height: '45px',
          top: '30px',
          borderRadius: '25px',
          border: '1px solid #18191A',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          padding: '5px 10px',
          outline: 'none',
        }} />
      </div>

      {/* Password Input Field */}
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '90px',
        left: '963px',
        top: '450px',
        boxSizing: 'border-box',
      }}>
        <label htmlFor="password" style={{
          position: 'absolute',
          width: '100%',
          height: '20px',
          left: '0',
          top: '0',
          fontWeight: '700',
          fontSize: '20px',
          lineHeight: '20px',
          color: '#000000',
        }}>Password</label>
        <input id="password" type="password" style={{
          position: 'absolute',
          width: '100%',
          height: '45px',
          top: '30px',
          borderRadius: '25px',
          border: '1px solid #18191A',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          padding: '5px 10px',
          outline: 'none',
        }} />
      </div>

      {/* Login Button */}
      <button style={{
        position: 'absolute',
        width: '168px',
        height: '52px',
        left: '1055px',
        top: '550px',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #E4E4E4 100%)',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        borderRadius: '25px',
        fontWeight: '700',
        fontSize: '15px',
        lineHeight: '45px',
        color: '#000000',
        border: 'none',
        cursor: 'pointer',
      }}>
        Login
      </button>
    </div>
  );
};

export default App;
