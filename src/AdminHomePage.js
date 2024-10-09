import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  TrafficLayer,
  TransitLayer,
  BicyclingLayer,
  StandaloneSearchBox,
  InfoWindow,
} from '@react-google-maps/api';
import './AdminHomePage.css';
import hazardIcon from './images/hazard-icon.png';
import logo from './images/logo.png';
import map from './images/map.png';
import pieIcon from './images/pie.png';
import usersIcon from './images/users-icon.png';
import leaderboardIcon from './images/leaderboard-icon.png';
import reportsIcon from './images/reports-icon.png';
import subscriptionIcon from './images/subscription.png'; 
import documentIcon from './images/document-icon.png';
import logoutIcon from './images/logout.png';
import Users from './users';
import GameLeaderboard from './GameLeaderboard';
import Posts from './Posts';
import DailyAnalytics from './DailyAnalytics';
import ReviewReports from './ReviewReports';
import SubscriptionManagement from './SubscriptionManagement';
import { database } from './firebaseConfig';
import { getDatabase, ref, get, child, set } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const API_KEY = 'AIzaSyACvMNE1lw18V00MT1wzRDW1vDlofnOZbw'; // Replace with your actual Google Maps API key

const containerStyle = { width: '100%', height: '500px' };

const AdminHomePage = () => {
  const [activeComponent, setActiveComponent] = useState('admin');
  const [markers, setMarkers] = useState(() => {
    const savedMarkers = localStorage.getItem('markers');
    return savedMarkers ? JSON.parse(savedMarkers) : [];
  });
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);
  const [showTransitLayer, setShowTransitLayer] = useState(false);
  const [showBicyclingLayer, setShowBicyclingLayer] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showHazardPins, setShowHazardPins] = useState(true); // State to toggle hazard pins
  const [pinAnimation, setPinAnimation] = useState(null); // State to control marker animation
  const searchBoxRef = useRef(null);
  const [selectedPost, setSelectedPost] = useState(null); // Track the selected post for InfoWindow
  const navigate = useNavigate(); // Hook to navigate programmatically

  // Fetch initial markers from Firebase or local storage
  useEffect(() => {
    fetchPosts().then((posts) => {
      const markerData = posts
        .filter((post) => post.upvotes >= 2)
        .map((post) => ({
          id: post.id,
          lat: parseFloat(post.location.latitude),
          lng: parseFloat(post.location.longitude),
          data: post, // Ensure the entire post data is passed, including photoURL, title, and displayName
        }));
      setMarkers((prevMarkers) => [...prevMarkers, ...markerData]);
    });
  }, []);

  useEffect(() => {
    // Save markers state to localStorage whenever it changes
    localStorage.setItem('markers', JSON.stringify(markers));
    saveMarkersToFirebase(markers); // Optionally save markers to Firebase
  }, [markers]);

  const center = useMemo(() => ({ lat: 10.3157, lng: 123.8854 }), []);
  const bounds = useMemo(
    () => ({
      north: 10.4,
      south: 10.25,
      east: 123.95,
      west: 123.8,
    }),
    []
  );


  const handlePlaceChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (!places || places.length === 0) return;
    const newMarker = {
      id: Date.now(),
      lat: places[0].geometry.location.lat(),
      lng: places[0].geometry.location.lng(),
      data: { description: 'Custom marker from search box' },
    };
    setMarkers([...markers, newMarker]);
  };

  const addNewMarker = () => {
    const newMarker = {
      id: Date.now(),
      lat: center.lat,
      lng: center.lng,
      data: { description: 'New hazard marker', title: 'Hazard', photoURL: '', displayName: 'Admin' },
    };
    setMarkers([...markers, newMarker]);
  };

  const fetchPosts = async () => {
    const dbRef = ref(database);
    try {
      const snapshot = await get(child(dbRef, 'posts'));
      if (snapshot.exists()) {
        const postsData = snapshot.val();
        return Object.entries(postsData)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }))
          .filter(
            (post) =>
              post.upvotes >= 2 &&
              post.location &&
              post.location.latitude &&
              post.location.longitude
          );
      } else {
        console.log('No data available');
      }
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
    return [];
  };

  const saveMarkersToFirebase = async (markers) => {
    const dbRef = ref(database, 'markers');
    try {
      await set(dbRef, markers);
      console.log('Markers saved to Firebase successfully');
    } catch (error) {
      console.error('Error saving markers to Firebase: ', error);
    }
  };

  const handleShowHazardPins = () => {
    setShowHazardPins(!showHazardPins);
    setPinAnimation(window.google.maps.Animation.DROP); // Set animation to DROP when showing pins
  };


  const handleLogout = () => {
    // Clear user session data (local storage, etc.)
    localStorage.removeItem('rememberedId');
    localStorage.removeItem('markers');

    // Navigate back to login page
    navigate('/');
  };


  const renderContent = () => {
    switch (activeComponent) {
      case 'users':
        return <Users />;
      case 'leaderboard':
        return <GameLeaderboard />;
      case 'reports':
        return <ReviewReports />;
      case 'dailyAnalytics':
        return <DailyAnalytics />;
      case 'Posts':
        return <Posts />;
      case 'subscriptionManagement': // Add this case to render SubscriptionManagement
        return <SubscriptionManagement />;
      default:
        return null;
    }
  };

  return (
    <LoadScript googleMapsApiKey={API_KEY} libraries={['places']}>
      <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
        {/* Sidebar with hover effect */}
        <div
          className={`sidebar ${sidebarExpanded ? 'expanded' : ''}`}
          onMouseEnter={() => setSidebarExpanded(true)} // Expand sidebar on hover
          onMouseLeave={() => setSidebarExpanded(false)} // Collapse sidebar when mouse leaves
        >
          <div className="sidebar-logo">
            <img src={logo} alt="Logo" />
            <span className="logo-text">RoadGuard</span>
          </div>
          <SidebarItem
            icon={map}
            label="Map Management"
            active={activeComponent === 'admin'}
            onClick={() => setActiveComponent('admin')}
          />
          <SidebarItem
            icon={usersIcon}
            label="Users Management"
            active={activeComponent === 'users'}
            onClick={() => setActiveComponent('users')}
          />
          <SidebarItem
            icon={leaderboardIcon}
            label="Leaderboard Management"
            active={activeComponent === 'leaderboard'}
            onClick={() => setActiveComponent('leaderboard')}
          />
          <SidebarItem
            icon={reportsIcon}
            label="Reviews & Reports"
            active={activeComponent === 'reports'}
            onClick={() => setActiveComponent('reports')}
          />
          <SidebarItem
            icon={documentIcon}
            label="Feed Management"
            active={activeComponent === 'Posts'}
            onClick={() => setActiveComponent('Posts')}
          />
          <SidebarItem
            icon={pieIcon}
            label="Analytics"
            active={activeComponent === 'dailyAnalytics'}
            onClick={() => setActiveComponent('dailyAnalytics')}
          />
          {/* Replaced the Notification icon with Subscription Management */}
          <SidebarItem
            icon={subscriptionIcon}
            label="Subscription Management"
            active={activeComponent === 'subscriptionManagement'}
            onClick={() => setActiveComponent('subscriptionManagement')}
          />
           <div className="logout-section">
            <SidebarItem
              icon={logoutIcon}
              label="Logout"
              onClick={handleLogout} // Call handleLogout when clicking the Logout menu item
            />
          </div>
        </div>


        {/* Main content remains the same */}
        <div className="main-content">
          {activeComponent === 'admin' || activeComponent === '' ? (
            <>
              <h2>Map Management (Cebu City)</h2>
              <div style={{ marginBottom: '20px' }}>
                <button onClick={addNewMarker} style={{ marginRight: '10px' }}>
                  Add Marker
                </button>
                <button onClick={() => setMarkers([])} style={{ marginRight: '10px' }}>
                  Clear Markers
                </button>
                <button onClick={handleShowHazardPins} style={{ marginRight: '10px' }}>
                  {showHazardPins ? 'Hide Hazard Pins' : 'Show Hazard Pins'}
                </button>
                <button onClick={() => setShowTrafficLayer(!showTrafficLayer)} style={{ marginRight: '10px' }}>
                  {showTrafficLayer ? 'Hide Traffic Layer' : 'Show Traffic Layer'}
                </button>
                <button onClick={() => setShowTransitLayer(!showTransitLayer)} style={{ marginRight: '10px' }}>
                  {showTransitLayer ? 'Hide Transit Layer' : 'Show Transit Layer'}
                </button>
                <button onClick={() => setShowBicyclingLayer(!showBicyclingLayer)} style={{ marginRight: '10px' }}>
                  {showBicyclingLayer ? 'Hide Bicycling Layer' : 'Show Bicycling Layer'}
                </button>
              </div>
              <StandaloneSearchBox onLoad={(ref) => (searchBoxRef.current = ref)} onPlacesChanged={handlePlaceChanged}>
                <input
                  type="text"
                  placeholder="Search location"
                  className="search-box"
                  style={{
                    boxSizing: 'border-box',
                    border: '1px solid transparent',
                    width: '240px',
                    height: '32px',
                    marginTop: '10px',
                    padding: '0 12px',
                    borderRadius: '3px',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    fontSize: '14px',
                    outline: 'none',
                    textOverflow: 'ellipses',
                  }}
                />
              </StandaloneSearchBox>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
                bounds={bounds}
                onLoad={() => setMapLoaded(true)} // Set mapLoaded to true when the map is fully loaded
              >
                {mapLoaded &&
                  window.google &&
                  window.google.maps &&
                  showHazardPins && // Only show hazard pins if showHazardPins is true
                  markers.map((marker) => (
                    <Marker
                      key={marker.id}
                      position={{ lat: marker.lat, lng: marker.lng }}
                      onClick={() => setSelectedPost(marker)} // Set selected marker for InfoWindow
                      icon={{
                        url: hazardIcon,
                        scaledSize: new window.google.maps.Size(30, 30),
                        origin: new window.google.maps.Point(0, 0),
                        anchor: new window.google.maps.Point(15, 15),
                      }}
                      animation={pinAnimation} // Apply the animation to each marker
                    />
                  ))}
                {showTrafficLayer && <TrafficLayer />}
                {showTransitLayer && <TransitLayer />}
                {showBicyclingLayer && <BicyclingLayer />}
                
                {/* Ensure selectedPost has valid position properties before rendering InfoWindow */}
                {selectedPost && selectedPost.lat && selectedPost.lng && (
                  <InfoWindow
                    position={{
                      lat: selectedPost.lat,
                      lng: selectedPost.lng,
                    }}
                    onCloseClick={() => setSelectedPost(null)}
                  >
                    <div>
                      {selectedPost.data.photoURL && (
                        <img
                          src={selectedPost.data.photoURL}
                          alt="Hazard"
                          style={{ width: '100px', height: '100px', marginBottom: '10px' }}
                        />
                      )}
                      <h4>{selectedPost.data.title || 'No Title'}</h4>
                      <p>Posted by: {selectedPost.data.displayName || 'Unknown'}</p> {/* Updated to displayName */}
                      <p>{selectedPost.data.description}</p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </LoadScript>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} className={`sidebar-item ${active ? 'active' : ''}`}>
    <img src={icon} alt={`${label} icon`} className="sidebar-icon" />
    <span className="sidebar-label">{label}</span>
  </div>
);

export default AdminHomePage;
