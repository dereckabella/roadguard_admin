import React, { useState, useRef } from 'react';
import logo from './images/logo.png';
import pieIcon from './images/pie.png';
import adminIcon from './images/admin-icon.png';
import usersIcon from './images/users-icon.png';
import leaderboardIcon from './images/leaderboard-icon.png';
import reportsIcon from './images/reports-icon.png';
import Users from './users';
import GameLeaderboard from './GameLeaderboard';
import Posts from './Posts';
import DailyAnalytics from './DailyAnalytics';
import { GoogleMap, LoadScript, Marker, TrafficLayer, TransitLayer, BicyclingLayer, StandaloneSearchBox } from '@react-google-maps/api';

const API_KEY = 'AIzaSyACvMNE1lw18V00MT1wzRDW1vDlofnOZbw'; // Replace with your API key

const AdminHomePage = () => {
  const [activeComponent, setActiveComponent] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Collapsible sidebar state
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState({ lat: 10.3157, lng: 123.8854 });
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);
  const [showTransitLayer, setShowTransitLayer] = useState(false);
  const [showBicyclingLayer, setShowBicyclingLayer] = useState(false);
  const searchBoxRef = useRef(null);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const containerStyle = { width: '100%', height: '500px' };

  const bounds = {
    north: 10.40,
    south: 10.25,
    east: 123.95,
    west: 123.80,
  };

  const renderContent = () => {
    switch (activeComponent) {
      case 'users':
        return <Users />;
      case 'leaderboard':
        return <GameLeaderboard />;
      case 'reports':
        return <Posts />;
      case 'dailyAnalytics':
        return <DailyAnalytics />;
      default:
        return (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2>Map Management (Cebu City)</h2>
              <button onClick={() => setMarkers([...markers, { lat: 10.3157, lng: 123.8854 }])} style={{ marginRight: '10px' }}>Add Marker</button>
              <button onClick={() => setMarkers([])} style={{ marginRight: '10px' }}>Clear Markers</button>
              <button onClick={() => setShowTrafficLayer(!showTrafficLayer)} style={{ marginRight: '10px' }}>
                {showTrafficLayer ? 'Hide Traffic Layer' : 'Show Traffic Layer'}
              </button>
              <button onClick={() => setShowTransitLayer(!showTransitLayer)} style={{ marginRight: '10px' }}>
                {showTransitLayer ? 'Hide Transit Layer' : 'Show Transit Layer'}
              </button>
              <button onClick={() => setShowBicyclingLayer(!showBicyclingLayer)}>
                {showBicyclingLayer ? 'Hide Bicycling Layer' : 'Show Bicycling Layer'}
              </button>
            </div>
            <LoadScript googleMapsApiKey={API_KEY} libraries={['places']}>
              <StandaloneSearchBox onLoad={ref => (searchBoxRef.current = ref)} onPlacesChanged={() => {
                const places = searchBoxRef.current.getPlaces();
                if (places.length === 0) return;
                setCenter({ lat: places[0].geometry.location.lat(), lng: places[0].geometry.location.lng() });
              }}>
                <input
                  type="text"
                  placeholder="Search location"
                  style={{
                    boxSizing: `border-box`,
                    border: `1px solid transparent`,
                    width: `240px`,
                    height: `32px`,
                    marginTop: `10px`,
                    padding: `0 12px`,
                    borderRadius: `3px`,
                    boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                    fontSize: `14px`,
                    outline: `none`,
                    textOverflow: `ellipses`,
                  }}
                />
              </StandaloneSearchBox>
              <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13} bounds={bounds}>
                {markers.map((marker, index) => (
                  <Marker key={index} position={marker} />
                ))}
                {showTrafficLayer && <TrafficLayer />}
                {showTransitLayer && <TransitLayer />}
                {showBicyclingLayer && <BicyclingLayer />}
              </GoogleMap>
            </LoadScript>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Sidebar */}
      <div
        style={{
          width: isSidebarCollapsed ? '60px' : '200px', // Collapsible width
          background: 'linear-gradient(180deg, #FAFF00 0%, #E0C55B 100%)',
          padding: '20px',
          position: 'fixed',
          top: '0',
          bottom: '0',
          overflowY: 'auto',
          transition: 'width 0.3s', // Smooth transition
          zIndex: '1000',
        }}
      >
        {/* Toggle Button */}
        <div style={{ textAlign: 'center', marginBottom: '20px', cursor: 'pointer' }} onClick={toggleSidebar}>
          <img src={logo} alt="Logo" style={{ width: '40px', height: '40px' }} />
        </div>

        {/* Sidebar Links */}
        <SidebarLink
          icon={adminIcon}
          label="Map Management"
          isCollapsed={isSidebarCollapsed}
          onClick={() => setActiveComponent('map')}
        />
        <SidebarLink
          icon={usersIcon}
          label="Users"
          isCollapsed={isSidebarCollapsed}
          onClick={() => setActiveComponent('users')}
        />
        <SidebarLink
          icon={leaderboardIcon}
          label="Leaderboard"
          isCollapsed={isSidebarCollapsed}
          onClick={() => setActiveComponent('leaderboard')}
        />
        <SidebarLink
          icon={reportsIcon}
          label="Reviews & Reports"
          isCollapsed={isSidebarCollapsed}
          onClick={() => setActiveComponent('reports')}
        />
        <SidebarLink
          icon={pieIcon}
          label="Daily Analytics"
          isCollapsed={isSidebarCollapsed}
          onClick={() => setActiveComponent('dailyAnalytics')}
        />
      </div>

      {/* Main Content */}
      <div style={{ flexGrow: 1, padding: '20px', marginLeft: isSidebarCollapsed ? '60px' : '200px', transition: 'margin-left 0.3s' }}>
        {renderContent()}
      </div>
    </div>
  );
};

const SidebarLink = ({ icon, label, isCollapsed, onClick }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', borderRadius: '5px', overflow: 'hidden', cursor: 'pointer' }}>
    <a
      href="#"
      style={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: '#000',
        padding: '10px',
        width: '100%',
        transition: 'background-color 0.3s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E0C55B')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      onClick={onClick}
    >
      <img src={icon} alt={`${label} icon`} style={{ width: '24px', height: '24px', marginRight: isCollapsed ? '0px' : '10px' }} />
      {!isCollapsed && <span style={{ fontSize: '16px' }}>{label}</span>}
    </a>
  </div>
);

export default AdminHomePage;
