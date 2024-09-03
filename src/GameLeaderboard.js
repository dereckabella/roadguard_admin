import React from 'react';
import logo from './images/logo.png'; // Update with the correct path
import documentIcon from './images/document-icon.png'; // Update with the correct path
import pieIcon from './images/pie.png'; // Update with the correct path
import bellIcon from './images/bell.png'; // Update with the correct path
import adminIcon from './images/admin-icon.png'; // Update with the correct path
import usersIcon from './images/users-icon.png'; // Update with the correct path
import leaderboardIcon from './images/leaderboard-icon.png'; // Update with the correct path
import reportsIcon from './images/reports-icon.png'; // Update with the correct path

const LeaderboardItem = ({ name, score, rank, avatar }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center">
      <img src={avatar} alt={name} className="w-10 h-10 rounded-full mr-2" />
      <span className="font-semibold">{name}</span>
    </div>
    <div className={`h-24 w-16 flex items-end justify-center ${
      rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-gray-300' : 'bg-amber-700'
    }`}>
      <span className="text-white font-bold mb-2">{score}</span>
    </div>
  </div>
);

const GameLeaderboard = () => {
  const leaderboardData = [
    { name: 'Diovic Solon', score: 9999, avatar: '/api/placeholder/40/40', rank: 1 },
    { name: 'Mie Atcham', score: 7659, avatar: '/api/placeholder/40/40', rank: 2 },
    { name: 'Kusogmoh Sikad', score: 600, avatar: '/api/placeholder/40/40', rank: 3 },
  ];

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">Game Leaderboard</h2>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        {leaderboardData.map((item, index) => (
          <LeaderboardItem key={index} {...item} />
        ))}
      </div>
      <div className="text-center">
        <button className="bg-yellow-400 text-white font-bold py-2 px-4 rounded-full hover:bg-yellow-500 transition duration-300">
          View Rewards
        </button>
      </div>
    </div>
  );
};

const AdminHomePage = () => {
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
            >
              <img src={reportsIcon} alt="Reports icon" style={{ width: '24px', height: '24px', marginRight: '10px' }} />
              <span style={{ fontSize: '16px' }}>Reviews & Reports</span>
            </a>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flexGrow: 1, padding: '20px', marginLeft: '200px' }}>
          {/* Main content area */}
          <GameLeaderboard />
        </div>
      </div>
    </div>
  );
};

export default GameLeaderboard;
