import React, { useState } from 'react';
import logo from './images/logo.png'; // Logo path
import documentIcon from './images/document-icon.png'; // Update with the correct path
import pieIcon from './images/pie.png'; // Update with the correct path
import bellIcon from './images/bell.png'; // Update with the correct path
import adminIcon from './images/admin-icon.png'; // Update with the correct path
import usersIcon from './images/users-icon.png'; // Update with the correct path
import leaderboardIcon from './images/leaderboard-icon.png'; // Update with the correct path
import reportsIcon from './images/reports-icon.png'; // Update with the correct path
import Users from './users'; // Import the Users component
import GameLeaderboard from './GameLeaderboard'; // Import the GameLeaderboard component
import Posts from './Posts'; // Import the Posts component

const AdminHomePage = () => {
  const [activeComponent, setActiveComponent] = useState(''); // State to manage active component

  const renderContent = () => {
    switch (activeComponent) {
      case 'users':
        return <Users />;
      case 'leaderboard':
        return <GameLeaderboard />;
      case 'reports':
        return <Posts />;
      case 'admin':
        return (
          <div style={styles.centeredLogoContainer}>
            <img src={logo} alt="Admin Dashboard Logo" style={styles.centeredLogo} />
            <h2 style={styles.dashboardText}>Welcome to the Admin Dashboard</h2>
          </div>
        );
      default:
        return <div>Welcome to the Admin Dashboard</div>;
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navIcons}>
          <NavbarIcon icon={documentIcon} />
          <NavbarIcon icon={pieIcon} />
          <NavbarIcon icon={bellIcon} />
        </div>
      </div>

      {/* Content Wrapper */}
      <div style={styles.contentWrapper}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <SidebarItem
            icon={adminIcon}
            label="Admin"
            active={activeComponent === 'admin'}
            onClick={() => setActiveComponent('admin')}
          />
          <SidebarItem
            icon={usersIcon}
            label="Users"
            active={activeComponent === 'users'}
            onClick={() => setActiveComponent('users')}
          />
          <SidebarItem
            icon={leaderboardIcon}
            label="Leaderboard"
            active={activeComponent === 'leaderboard'}
            onClick={() => setActiveComponent('leaderboard')}
          />
          <SidebarItem
            icon={reportsIcon}
            label="Reviews & Reports"
            active={activeComponent === 'reports'}
            onClick={() => setActiveComponent('reports')}
          />
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      ...styles.sidebarItem,
      backgroundColor: active ? '#FFD700' : 'transparent',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E0C55B')}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = active ? '#FFD700' : 'transparent')}
  >
    <img src={icon} alt={`${label} icon`} style={styles.sidebarIcon} />
    <span style={styles.sidebarLabel}>{label}</span>
  </div>
);

// Navbar Icon Component
const NavbarIcon = ({ icon }) => (
  <button style={styles.navIconButton}>
    <img src={icon} alt="Navbar Icon" style={styles.navIcon} />
  </button>
);

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #E0C55B',
    padding: '10px 20px',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    height: '60px',
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    zIndex: '1000',
  },
  navIcons: {
    display: 'flex',
    justifyContent: 'center',
    flexGrow: 1,
  },
  navIconButton: {
    backgroundColor: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    padding: '15px',
    margin: '0 10px',
    transition: 'background-color 0.3s',
  },
  navIcon: {
    width: '30px',
    height: '30px',
  },
  contentWrapper: {
    display: 'flex',
    flexGrow: 1,
    marginTop: '60px',
  },
  sidebar: {
    width: '200px',
    background: 'linear-gradient(180deg, #FAFF00 0%, #E0C55B 100%)',
    padding: '20px',
    position: 'fixed',
    top: '60px',
    bottom: '0',
    overflowY: 'auto',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
  },
  sidebarItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
    cursor: 'pointer',
  },
  sidebarIcon: {
    width: '24px',
    height: '24px',
    marginRight: '10px',
  },
  sidebarLabel: {
    fontSize: '16px',
    color: '#000',
  },
  mainContent: {
    flexGrow: 1,
    padding: '40px',
    marginLeft: '200px',
    backgroundColor: '#F5F5F5',
    minHeight: '100vh',
  },
  centeredLogoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  centeredLogo: {
    width: '150px',
    height: '150px',
    marginBottom: '20px',
  },
  dashboardText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2C3E50',
  },
};

export default AdminHomePage;
