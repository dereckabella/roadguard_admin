import React, { useState, useRef, useMemo, useEffect } from 'react';
import logo from './images/logo.png';
import map from './images/map.png';
import pieIcon from './images/pie.png';
import usersIcon from './images/users-icon.png';
import leaderboardIcon from './images/leaderboard-icon.png';
import reportsIcon from './images/reports-icon.png';
import bellIcon from './images/bell.png';
import documentIcon from './images/document-icon.png';
import Users from './users';
import GameLeaderboard from './GameLeaderboard';
import Posts from './Posts';
import DailyAnalytics from './DailyAnalytics';
import ReviewReports from './ReviewReports';
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
import { getDatabase, ref, get, child } from 'firebase/database';
import { database } from './firebaseConfig';
import hazardIcon from './images/hazard-icon.png';

const API_KEY = 'AIzaSyACvMNE1lw18V00MT1wzRDW1vDlofnOZbw'; // Replace with your API key

const containerStyle = { width: '100%', height: '500px' };

const AdminHomePage = () => {
  const [activeComponent, setActiveComponent] = useState('admin'); // Default to 'admin' to show the map initially
  const [markers, setMarkers] = useState([]);
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);
  const [showTransitLayer, setShowTransitLayer] = useState(false);
  const [showBicyclingLayer, setShowBicyclingLayer] = useState(false);
  const searchBoxRef = useRef(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    // Fetch posts and set markers when the component mounts
    fetchPosts().then((posts) => {
      const markerData = posts
        .filter((post) => post.upvotes >= 2)
        .map((post) => ({
          id: post.id,
          lat: parseFloat(post.location.latitude),
          lng: parseFloat(post.location.longitude),
          data: post,
        }));
      setMarkers(markerData);
    });
  }, []); // Empty dependency array ensures this runs once

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
    const newCenter = {
      lat: places[0].geometry.location.lat(),
      lng: places[0].geometry.location.lng(),
    };
    setMarkers([newCenter]);
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
      default:
        return null; // Do not remove the map, just show other components
    }
  };

  return (
    <LoadScript googleMapsApiKey={API_KEY} libraries={['places']}>
      <div
        style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}
      >
        <div className="sidebar">
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
          <SidebarItem
            icon={bellIcon}
            label="Notifications"
            onClick={() => setActiveComponent('notifications')}
          />
        </div>
        <div className="main-content">
          {/* Map Management Component */}
          <div
            style={{
              display:
                activeComponent === 'admin' || activeComponent === ''
                  ? 'block'
                  : 'none',
            }}
          >
            <h2>Map Management (Cebu City)</h2>
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={() =>
                  setMarkers([
                    ...markers,
                    { lat: 10.3157, lng: 123.8854, id: Date.now() },
                  ])
                }
                style={{ marginRight: '10px' }}
              >
                Add Marker
              </button>
              <button
                onClick={() => setMarkers([])}
                style={{ marginRight: '10px' }}
              >
                Clear Markers
              </button>
              <button
                onClick={() => setShowTrafficLayer(!showTrafficLayer)}
                style={{ marginRight: '10px' }}
              >
                {showTrafficLayer ? 'Hide Traffic Layer' : 'Show Traffic Layer'}
              </button>
              <button
                onClick={() => setShowTransitLayer(!showTransitLayer)}
                style={{ marginRight: '10px' }}
              >
                {showTransitLayer ? 'Hide Transit Layer' : 'Show Transit Layer'}
              </button>
              <button
                onClick={() =>
                  setShowBicyclingLayer(!showBicyclingLayer)
                }
                style={{ marginRight: '10px' }}
              >
                {showBicyclingLayer
                  ? 'Hide Bicycling Layer'
                  : 'Show Bicycling Layer'}
              </button>
            </div>

            <StandaloneSearchBox
              onLoad={(ref) => (searchBoxRef.current = ref)}
              onPlacesChanged={handlePlaceChanged}
            >
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
            >
              {markers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={{ lat: marker.lat, lng: marker.lng }}
                  onClick={() => setSelectedPost(marker.data)}
                  icon={{
                    url: hazardIcon,
                    scaledSize: new window.google.maps.Size(30, 30),
                    origin: new window.google.maps.Point(0, 0),
                    anchor: new window.google.maps.Point(15, 15),
                  }}
                />
              ))}
              {showTrafficLayer && <TrafficLayer />}
              {showTransitLayer && <TransitLayer />}
              {showBicyclingLayer && <BicyclingLayer />}
              {selectedPost && (
                <InfoWindow
                  position={{
                    lat: selectedPost.location.latitude,
                    lng: selectedPost.location.longitude,
                  }}
                  onCloseClick={() => setSelectedPost(null)}
                >
                  <div>
                    <img
                      src={selectedPost.photoURL}
                      alt="User"
                      style={{ width: '50px', height: '50px' }}
                    />
                    <p>{selectedPost.body}</p>
                    <p>Reported by: {selectedPost.displayName}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>

          {/* Other Components */}
          <div
            style={{
              display:
                activeComponent !== 'admin' && activeComponent !== ''
                  ? 'block'
                  : 'none',
            }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </LoadScript>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`sidebar-item ${active ? 'active' : ''}`}
  >
    <img src={icon} alt={`${label} icon`} className="sidebar-icon" />
    <span className="sidebar-label">{label}</span>
  </div>
);

export default AdminHomePage;
