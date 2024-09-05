import React, { useState } from 'react';
import logo from './images/logo.png'; // Update with the correct path
import documentIcon from './images/document-icon.png'; // Update with the correct path
import pieIcon from './images/pie.png'; // Update with the correct path
import bellIcon from './images/bell.png'; // Update with the correct path
import adminIcon from './images/admin-icon.png'; // Update with the correct path
import usersIcon from './images/users-icon.png'; // Update with the correct path
import leaderboardIcon from './images/leaderboard-icon.png'; // Update with the correct path
import reportsIcon from './images/reports-icon.png'; // Update with the correct path
import Users from './users'; // Import the Users component

const AdminHomePage = () => {
  const [activeComponent, setActiveComponent] = useState(''); // State to manage active component

  const renderContent = () => {
    switch (activeComponent) {
      case 'users':
        return <Users />;
      // Add more cases for other components if needed
      default:
        return <div>Welcome to the Admin Dashboard</div>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Top Navbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        border: '1px solid #E0C55B',
        padding: '10px',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        height: '60px',
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        zIndex: '1000',
      }}>
        <img src={logo} alt="Logo" style={{ width: '50px', height: '50px', margin: '0 20px' }} />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexGrow: 1,
        }}>
          <button style={{
            backgroundColor: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            padding: '20px',
            transition: 'background-color 0.3s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D9D9D9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <img src={documentIcon} alt="Document icon" style={{ width: '24px', height: '24px' }} />
          </button>
          <button style={{
            backgroundColor: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            padding: '20px',
            transition: 'background-color 0.3s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D9D9D9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <img src={pieIcon} alt="Pie icon" style={{ width: '24px', height: '24px' }} />
          </button>
          <button style={{
            backgroundColor: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            padding: '20px',
            transition: 'background-color 0.3s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D9D9D9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <img src={bellIcon} alt="Bell icon" style={{ width: '24px', height: '24px' }} />
          </button>
        </div>
      </div>

      {/* Content Wrapper */}
      <div style={{ display: 'flex', flexGrow: 1, marginTop: '60px' }}>
        {/* Sidebar */}
        <div style={{
          width: '200px',
          background: 'linear-gradient(180deg, #FAFF00 0%, #E0C55B 100%)',
          padding: '20px',
          position: 'fixed',
          top: '60px',
          bottom: '0',
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', borderRadius: '5px', overflow: 'hidden' }}>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#000',
              padding: '10px',
              width: '100%',
              height: '50px',
              border: 'none',
              transition: 'background-color 0.3s, color 0.3s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0C55B'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => setActiveComponent('admin')}
            >
              <img src={adminIcon} alt="Admin icon" style={{ width: '24px', height: '24px', marginRight: '10px' }} />
              <span style={{ fontSize: '16px' }}>Admin</span>
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', borderRadius: '5px', overflow: 'hidden' }}>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#000',
              padding: '10px',
              width: '100%',
              height: '50px',
              border: 'none',
              transition: 'background-color 0.3s, color 0.3s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0C55B'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => setActiveComponent('users')}
            >
              <img src={usersIcon} alt="Users icon" style={{ width: '24px', height: '24px', marginRight: '10px' }} />
              <span style={{ fontSize: '16px' }}>Users</span>
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', borderRadius: '5px', overflow: 'hidden' }}>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#000',
              padding: '10px',
              width: '100%',
              height: '50px',
              border: 'none',
              transition: 'background-color 0.3s, color 0.3s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0C55B'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => setActiveComponent('leaderboard')}
            >
              <img src={leaderboardIcon} alt="Leaderboard icon" style={{ width: '24px', height: '24px', marginRight: '10px' }} />
              <span style={{ fontSize: '16px' }}>Leaderboard</span>
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', borderRadius: '5px', overflow: 'hidden' }}>
            <a href="#" style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#000',
              padding: '10px',
              width: '100%',
              height: '50px',
              border: 'none',
              transition: 'background-color 0.3s, color 0.3s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0C55B'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => setActiveComponent('reports')}
            >
              <img src={reportsIcon} alt="Reports icon" style={{ width: '24px', height: '24px', marginRight: '10px' }} />
              <span style={{ fontSize: '16px' }}>Reviews & Reports</span>
            </a>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flexGrow: 1, padding: '20px', marginLeft: '200px' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;