import React, { useState, useRef } from 'react';
import logo from './images/logo.png'; // Update with the correct path
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
import { GoogleMap, LoadScript, Marker, TrafficLayer, TransitLayer, BicyclingLayer, StandaloneSearchBox } from '@react-google-maps/api'; // Google Maps API

const API_KEY = 'AIzaSyACvMNE1lw18V00MT1wzRDW1vDlofnOZbw'; // Replace with your actual API key

const AdminHomePage = () => {
  const [activeComponent, setActiveComponent] = useState(''); // State to manage active component
  const [markers, setMarkers] = useState([]); // State to store markers
  const [center, setCenter] = useState({ lat: 10.3157, lng: 123.8854 }); // Center state
  const [showTrafficLayer, setShowTrafficLayer] = useState(false); // Traffic Layer toggle state
  const [showTransitLayer, setShowTransitLayer] = useState(false); // Transit Layer toggle state
  const [showBicyclingLayer, setShowBicyclingLayer] = useState(false); // Bicycling Layer toggle state
  const searchBoxRef = useRef(null);

  // Map container style
  const containerStyle = {
    width: '100%',
    height: '500px',
  };

  // Bounds to restrict the map to Cebu City area
  const bounds = {
    north: 10.40, // Northern boundary of Cebu City
    south: 10.25, // Southern boundary of Cebu City
    east: 123.95, // Eastern boundary of Cebu City
    west: 123.80, // Western boundary of Cebu City
  };

  const toggleTrafficLayer = () => setShowTrafficLayer(!showTrafficLayer);
  const toggleTransitLayer = () => setShowTransitLayer(!showTransitLayer);
  const toggleBicyclingLayer = () => setShowBicyclingLayer(!showBicyclingLayer);

  // Add a marker at the center (Cebu City)
  const addMarker = () => {
    const newMarker = {
      lat: 10.3157, // Cebu City's latitude
      lng: 123.8854, // Cebu City's longitude
    };
    setMarkers([...markers, newMarker]);
  };

  // Clear all markers
  const clearMarkers = () => {
    setMarkers([]);
  };

  // Handle places changed from search box
  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places.length === 0) return;

    const newCenter = {
      lat: places[0].geometry.location.lat(),
      lng: places[0].geometry.location.lng(),
    };

    setCenter(newCenter);
  };

  // Function to render content based on active component
  const renderContent = () => {
    switch (activeComponent) {
      case 'users':
        return <Users />;
      case 'leaderboard':
        return <GameLeaderboard />;
      case 'reports':
        return <Posts />;
      default:
        return (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2>Map Management (Cebu City)</h2>
              <button onClick={addMarker} style={{ marginRight: '10px' }}>Add Marker</button>
              <button onClick={clearMarkers} style={{ marginRight: '10px' }}>Clear Markers</button>
              <button onClick={toggleTrafficLayer} style={{ marginRight: '10px' }}>
                {showTrafficLayer ? 'Hide Traffic Layer' : 'Show Traffic Layer'}
              </button>
              <button onClick={toggleTransitLayer} style={{ marginRight: '10px' }}>
                {showTransitLayer ? 'Hide Transit Layer' : 'Show Transit Layer'}
              </button>
              <button onClick={toggleBicyclingLayer}>
                {showBicyclingLayer ? 'Hide Bicycling Layer' : 'Show Bicycling Layer'}
              </button>
            </div>

            <LoadScript googleMapsApiKey={API_KEY} libraries={['places']}>
              <StandaloneSearchBox
                onLoad={ref => (searchBoxRef.current = ref)}
                onPlacesChanged={onPlacesChanged}
              >
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

              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13} // Adjust zoom level for Cebu City
                bounds={bounds}
              >
                {markers.map((marker, index) => (
                  <Marker key={index} position={marker} />
                ))}

                {/* Conditional rendering of layers */}
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
              onClick={() => setActiveComponent('map')} // Add Map Management option
            >
              <img src={adminIcon} alt="Admin icon" style={{ width: '24px', height: '24px', marginRight: '10px' }} />
              <span style={{ fontSize: '16px' }}>Map Management</span>
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
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} // Removed the extra closing parenthesis
              onClick={() => setActiveComponent('leaderboard')}
            >
              <img src={leaderboardIcon} alt="Leaderboard icon" style={{ width: '24px', height: '24px', marginRight: '10px' }} />
              <span style={{ fontSize: '16px' }}>Leaderboard</span>
            </a>

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
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} // Removed the extra closing parenthesis
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
