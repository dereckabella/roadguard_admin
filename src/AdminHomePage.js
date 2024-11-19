import React, { useState, useEffect, useRef } from 'react';
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
import { MarkerClusterer } from "@react-google-maps/api";
import './AdminHomePage.css';
import map from './images/map.png';
import hazardIcon from './images/hazard-icon.png';
import logo from './images/logo.png';
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
import { ref, onValue, off, set, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const API_KEY = 'AIzaSyACvMNE1lw18V00MT1wzRDW1vDlofnOZbw';
const containerStyle = { width: '100%', height: '600px' };

// Define the Cebu City bounds to restrict both the map and search box
const cebuCityBounds = {
  north: 10.4858,
  south: 10.2524,
  west: 123.790,
  east: 124.030,
};

// Map options to restrict the viewable area to Cebu City
const mapOptions = {
  restriction: {
    latLngBounds: cebuCityBounds,
    strictBounds: true,
  },
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

const AdminHomePage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeComponent, setActiveComponent] = useState('admin');
  const [markers, setMarkers] = useState([]);
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);
  const [showTransitLayer, setShowTransitLayer] = useState(false);
  const [showBicyclingLayer, setShowBicyclingLayer] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showHazardPins, setShowHazardPins] = useState(true);
  const searchBoxRef = useRef(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  const [mapCenter, setMapCenter] = useState({ lat: 10.3157, lng: 123.8854 });
  const [mapZoom, setMapZoom] = useState(14); // Zoom level set for Cebu City
  const [mapBounds, setMapBounds] = useState(cebuCityBounds);

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPhotoURL, setEditPhotoURL] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAddingMarker, setIsAddingMarker] = useState(false); // Controls whether we are in "Add Marker" mode
  const [selectedLocation, setSelectedLocation] = useState(null); // Stores the selected location (latitude and longitude)
  const [showFormModal, setShowFormModal] = useState(false); // Controls visibility of the form modal

  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDate, setFilterDate] = useState('All');

  const [markerAnimation, setMarkerAnimation] = useState(null); // State to control marker animation


  // Fetch markers when the component mounts
  useEffect(() => {
    const markersRef = ref(database, 'markers');
    onValue(markersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const updatedMarkers = Object.values(data);
        setMarkers(updatedMarkers);
      }
    });

    return () => off(markersRef); // Cleanup listener on component unmount
  }, []);

  // Save markers to Firebase
  const saveMarkersToFirebase = async (updatedMarkers) => {
    const dbRef = ref(database, 'markers');
    try {
      const markersObject = updatedMarkers.reduce((acc, marker) => {
        acc[marker.id] = marker;
        return acc;
      }, {});
      await set(dbRef, markersObject);
      console.log('Markers saved to Firebase successfully.');
    } catch (error) {
      console.error('Error saving markers to Firebase:', error);
    }
  };

  
  const imageInputRef = useRef(null); // Create a reference for the image file input

  const addNewMarker = () => {
    if (!editTitle || !editDescription || !imageFile || !selectedLocation) {
      setErrorMessage('Please fill in all fields, upload an image, and select a location before adding a marker.');
      return;
    }
  
    // Convert image file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const newMarker = {
        id: Date.now().toString(),
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        data: {
          description: editDescription,
          title: editTitle,
          photoURL: reader.result, // Base64 encoded image
          displayName: 'Admin',
          dateAdded: new Date().toLocaleString(),
          category: filterCategory,
        },
        animation: window.google.maps.Animation.BOUNCE, // Add animation for new marker
      };
  
      // Update markers state and Firebase
      setMarkers((prevMarkers) => {
        const updatedMarkers = [...prevMarkers, newMarker];
        saveMarkersToFirebase(updatedMarkers); // Save to Firebase
        return updatedMarkers;
      });
  
      // Reset form and state
      setMarkerAnimation(window.google.maps.Animation.BOUNCE);
      setEditTitle('');
      setEditDescription('');
      setImageFile(null);
      setEditPhotoURL('');
      setErrorMessage('');
      if (imageInputRef.current) {
        imageInputRef.current.value = ''; // Reset image input
      }
      setShowFormModal(false); // Close modal after saving
    };
    reader.readAsDataURL(imageFile); // Convert image to base64 format
  };

  const handleCategoryFilterChange = (e) => setFilterCategory(e.target.value);

  const handleDateFilterChange = (e) => setFilterDate(e.target.value);

  const getFilteredMarkers = () => {
    const currentTime = new Date();

    return markers.filter((marker) => {
      // Filter by category
      const matchesCategory = filterCategory === 'All' || marker.data.category === filterCategory;

      // Filter by date
      const dateAdded = new Date(marker.data.dateAdded);
      let matchesDate = true;

      if (filterDate === 'Last 24 Hours') {
        matchesDate = (currentTime - dateAdded) / (1000 * 60 * 60) <= 24;
      } else if (filterDate === 'Last 7 Days') {
        matchesDate = (currentTime - dateAdded) / (1000 * 60 * 60 * 24) <= 7;
      } else if (filterDate === 'Last 30 Days') {
        matchesDate = (currentTime - dateAdded) / (1000 * 60 * 60 * 24) <= 30;
      }

      return matchesCategory && matchesDate;
    });
  };

  const handleMapBoundsChanged = () => {
    if (searchBoxRef.current) {
      const bounds = searchBoxRef.current.getBounds();
      if (bounds) {
        const newBounds = {
          north: bounds.getNorthEast().lat(),
          south: bounds.getSouthWest().lat(),
          west: bounds.getSouthWest().lng(),
          east: bounds.getNorthEast().lng(),
        };
        setMapBounds(newBounds);
      }
    }
  };
  
  // Toggle showing/hiding hazard pins
  const handleShowHazardPins = () => setShowHazardPins(!showHazardPins);

  const startAddMarkerProcess = () => {
    setIsAddingMarker(true); // Start the add marker process
    setSelectedLocation(null); // Clear any previously selected location
    setShowFormModal(true); // Show the form modal immediately
  };
  
  // Handle Google Maps search box place changed event
  const handlePlaceChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (!places || places.length === 0) return;

    const place = places[0];
    setMapCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
    setMapZoom(15);
  };

  // Handle logout functionality
  const handleLogout = () => {
    localStorage.removeItem('rememberedId');
    localStorage.removeItem('markers');
    navigate('/');
  };

  // Render the appropriate content based on the active component
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

  const handleEditMarker = (markerId) => {
    setMarkers((prevMarkers) =>
      prevMarkers.map((marker) =>
        marker.id === markerId
          ? {
              ...marker,
              data: {
                ...marker.data,
                title: editTitle || marker.data.title,
                description: editDescription || marker.data.description,
                photoURL: editPhotoURL || marker.data.photoURL,
              },
            }
          : marker
      )
    );

    saveMarkersToFirebase(markers);
    setEditTitle('');
    setEditDescription('');
    setEditPhotoURL('');
    setSelectedPost(null);
  };

  const handleDeleteMarker = (markerId) => {
    if (window.confirm('Are you sure you want to delete this marker?')) {
      setMarkers((prevMarkers) => {
        const updatedMarkers = prevMarkers.filter((marker) => marker.id !== markerId);
        saveMarkersToFirebase(updatedMarkers); // Update Firebase after deletion
        return updatedMarkers;
      });
      remove(ref(database, 'markers/' + markerId)); // Remove marker from Firebase
      setSelectedPost(null);
    }
  };

  // Sidebar item component
  const SidebarItem = ({ icon, label, active, children, onClick }) => (
    <div className={`sidebar-item ${active ? 'active' : ''}`} onClick={onClick}>
      <img src={icon} alt={`${label} icon`} className="sidebar-icon" />
      <span className="sidebar-label">{label}</span>
      {children && <div className="nested-menu">{children}</div>}
    </div>
  );

  return (
    <LoadScript googleMapsApiKey={API_KEY} libraries={['places']}>
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#001F3F' }}>
        {/* Sidebar Container */}
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-logo">
            <img src={logo} alt="Logo" />
            <span className="logo-text mt-5"></span>
          </div>
  
          {/* Main Menu Section */}
          <SidebarItem icon={map} label="Map Management" active={activeComponent === 'admin'} onClick={() => setActiveComponent('admin')}>
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column' }}>
              <button onClick={startAddMarkerProcess} style={{ marginBottom: '10px' }}>Add Marker</button>
              <button onClick={handleShowHazardPins} style={{ marginBottom: '10px' }}>{showHazardPins ? 'Hide Hazard Pins' : 'Show Hazard Pins'}</button>
              <button onClick={() => setShowTrafficLayer(!showTrafficLayer)} style={{ marginBottom: '10px' }}>{showTrafficLayer ? 'Hide Traffic Layer' : 'Show Traffic Layer'}</button>
              <button onClick={() => setShowTransitLayer(!showTransitLayer)} style={{ marginBottom: '10px' }}>{showTransitLayer ? 'Hide Transit Layer' : 'Show Transit Layer'}</button>
              <button onClick={() => setShowBicyclingLayer(!showBicyclingLayer)}>{showBicyclingLayer ? 'Hide Bicycling Layer' : 'Show Bicycling Layer'}</button>
            </div>
          </SidebarItem>
  
          {/* Other Sidebar Items */}
          <SidebarItem icon={documentIcon} label="Feed Management" active={activeComponent === 'Posts'} onClick={() => setActiveComponent('Posts')} />
          <SidebarItem icon={usersIcon} label="Users Management" active={activeComponent === 'users'} onClick={() => setActiveComponent('users')} />
          <SidebarItem icon={subscriptionIcon} label="Subscription Management" active={activeComponent === 'subscriptionManagement'} onClick={() => setActiveComponent('subscriptionManagement')} />
          <SidebarItem icon={leaderboardIcon} label="Leaderboard Management" active={activeComponent === 'leaderboard'} onClick={() => setActiveComponent('leaderboard')} />
          <SidebarItem icon={reportsIcon} label="Reviews & Reports" active={activeComponent === 'reports'} onClick={() => setActiveComponent('reports')} />
          <SidebarItem icon={pieIcon} label="Analytics" active={activeComponent === 'dailyAnalytics'} onClick={() => setActiveComponent('dailyAnalytics')} />
  
          {/* Account Section */}
          <div className="sidebar-section">Account</div>
          <SidebarItem icon={logoutIcon} label="Logout" onClick={handleLogout} />
        </div>
  
        {/* Main Content Container */}
        <div className="main-content-container">
          <div className="main-content">
            {activeComponent === 'admin' ? (
              <>
                <h2>Map Management (Cebu City)</h2>
                <div style={{ marginBottom: '20px' }}>
                  <select onChange={handleCategoryFilterChange} value={filterCategory} style={{ marginRight: '10px' }}>
                    <option value="All">All Categories</option>
                    <option value="Potholes">Potholes</option>
                    <option value="Accidents">Accidents</option>
                    <option value="Flooding">Flooding</option>
                    <option value="Construction">Construction</option>
                  </select>
  
                  <select onChange={handleDateFilterChange} value={filterDate} style={{ marginRight: '10px' }}>
                    <option value="All">All Dates</option>
                    <option value="Last 24 Hours">Last 24 Hours</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                  </select>
                </div>
  
                <StandaloneSearchBox
                  onLoad={(ref) => (searchBoxRef.current = ref)}
                  bounds={cebuCityBounds}
                  options={{
                    strictBounds: true,
                    componentRestrictions: { country: 'PH' },
                  }}
                  onPlacesChanged={handlePlaceChanged}
                >
                  <input
                    type="text"
                    placeholder="Search location within Cebu City"
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
  
                {/* Google Map Container */}
                <div className="map-container">
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={mapCenter}
                    zoom={14}
                    options={mapOptions}
                    onClick={(e) => {
                      if (isAddingMarker) {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        setSelectedLocation({ lat, lng });
                        setShowFormModal(true);
                        setIsAddingMarker(false);
                      }
                    }}
                  >
                    {/* Show a temporary marker at the selected location */}
                    {selectedLocation && (
                      <Marker
                        position={selectedLocation}
                        icon={{
                          url: hazardIcon,
                          scaledSize: new window.google.maps.Size(30, 30),
                        }}
                      />
                    )}
  
                    {/* Render existing markers */}
                    <MarkerClusterer>
                      {(clusterer) =>
                        markers.map((marker) => (
                          <Marker
                            key={marker.id}
                            position={{ lat: marker.lat, lng: marker.lng }}
                            clusterer={clusterer}
                            icon={{
                              url: hazardIcon,
                              scaledSize: new window.google.maps.Size(30, 30),
                            }}
                          />
                        ))
                      }
                    </MarkerClusterer>
  
                    {showTrafficLayer && <TrafficLayer />}
                    {showTransitLayer && <TransitLayer />}
                    {showBicyclingLayer && <BicyclingLayer />}
                  </GoogleMap>
  
                  {/* Form Modal */}
                  {showFormModal && (
                    <div className="marker-form-modal">
                      <div className="marker-form">
                        <h3>Add Marker Details</h3>
                        <input
                          type="text"
                          placeholder="Title"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          style={{ marginBottom: '10px' }}
                        />
                        <input
                          type="text"
                          placeholder="Description"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          style={{ marginBottom: '10px' }}
                        />
                        <input
                          type="file"
                          accept="image/*"
                          ref={imageInputRef}
                          onChange={(e) => setImageFile(e.target.files[0])}
                          style={{ marginBottom: '10px' }}
                        />
                        <div>
                          <button onClick={() => setShowFormModal(false)}>Cancel</button>
                          <button onClick={addNewMarker}>Save Marker</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
    </LoadScript>
  );
}
export default AdminHomePage;
