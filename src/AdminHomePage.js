import React, { useState } from 'react';
import './AdminHomePage.css'; // Importing CSS file
import logo from './images/logo.png'; // Logo path
import documentIcon from './images/document-icon.png';
import pieIcon from './images/pie.png';
import bellIcon from './images/bell.png';
import adminIcon from './images/admin-icon.png';
import usersIcon from './images/users-icon.png';
import leaderboardIcon from './images/leaderboard-icon.png';
import reportsIcon from './images/reports-icon.png';
import Users from './users';
import GameLeaderboard from './GameLeaderboard';
import Posts from './Posts';

const AdminHomePage = () => {
  const [activeComponent, setActiveComponent] = useState('admin'); // Default to admin

  const renderContent = () => {
    switch (activeComponent) {
      case 'users':
        return <Users />;
      case 'leaderboard':
        return <GameLeaderboard />;
      case 'reports':
        return <Posts />;
      case 'admin':
      default:
        return (
          <div className="centered-logo-container">
            <img src={logo} alt="Admin Dashboard Logo" className="centered-logo" />
            <h2 className="dashboard-text">Welcome to the Admin Dashboard</h2>
          </div>
        );
    }
  };

  return (
    <div className="container">
      {/* Top Navbar */}
      <div className="navbar">
        <div className="nav-icons">
          <NavbarIcon icon={documentIcon} tooltip="Documents" />
          <NavbarIcon icon={pieIcon} tooltip="Analytics" />
          <NavbarIcon icon={bellIcon} tooltip="Notifications" />
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="content-wrapper">
        {/* Sidebar */}
        <div className="sidebar">
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
        <div className="main-content">
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
    className={`sidebar-item ${active ? 'active' : ''}`}
  >
    <img src={icon} alt={`${label} icon`} className="sidebar-icon" />
    <span className="sidebar-label">{label}</span>
  </div>
);

// Navbar Icon Component
const NavbarIcon = ({ icon, tooltip }) => (
  <button className="nav-icon-button" title={tooltip}>
    <img src={icon} alt="Navbar Icon" className="nav-icon" />
  </button>
);

export default AdminHomePage;
