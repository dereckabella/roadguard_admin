import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  TrafficLayer,
  TransitLayer,
  BicyclingLayer,
  StreetViewPanorama,
  StandaloneSearchBox,
} from '@react-google-maps/api';
import './AdminHomePage.css';
import mapIcon from './images/map.png';
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
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { storage } from './firebaseConfig'; // Import storage from your Firebase configuration
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

import adminImage from './images/admin.jpg';


import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {  Slide } from 'react-toastify';
const API_KEY = 'AIzaSyDZShgCYNWnTIkKJFRGsqY8GZDax9Ykqo0';
const libraries = ['places'];

// Define the Cebu City bounds to restrict both the map and search box
const cebuCityBounds = {
  north: 10.4510, // Slightly extended northern boundary
  south: 10.2110, // Slightly extended southern boundary
  east: 124.0240, // Slightly extended eastern boundary
  west: 123.7990, // Slightly extended western boundary
};


// Map options to restrict the viewable area to Cebu City
const mapOptions = {
  restriction: {
    latLngBounds: cebuCityBounds,
    strictBounds: true,
  },
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: true, // Enable Street View control
  fullscreenControl: false,
};


const AdminHomePage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeComponent, setActiveComponent] = useState('admin');
  const [markers, setMarkers] = useState([]);
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);
  const [showTransitLayer, setShowTransitLayer] = useState(false);
  const [showBicyclingLayer, setShowBicyclingLayer] = useState(false);
  const searchBoxRef = useRef(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState({ lat: 10.3157, lng: 123.8854 });
  const [mapZoom, setMapZoom] = useState(14); // Zoom level set for Cebu City
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
  const [categories, setCategories] = useState([]);
  const [dateOptions, setDateOptions] = useState([
    "Last 5 Hours",
    "Last 24 Hours",
    "Last 3 Days",
    "Last 7 Days",
    "Last 30 Days",
  ]);
 
  const [notification, setNotification] = useState('');
  const markerClusterRef = useRef(null);
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
const [tempFilterDate, setTempFilterDate] = useState(filterDate);
const [tempFilterCategory, setTempFilterCategory] = useState(filterCategory);
const [streetViewVisible, setStreetViewVisible] = useState(false);
  const streetViewRef = useRef(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  
  const handleStreetViewToggle = () => {
    setStreetViewVisible(!streetViewVisible);
  };
  const handleMapLoad = (loadedMap) => {
    setMap(loadedMap); // Save the map instance to state
  };

  const handleDateFilter = () => {
    if (startDate && endDate) {
      const startTime = startDate.getTime();
      const endTime = endDate.getTime();
  
      const filtered = markers.filter(marker => {
        const markerDate = new Date(marker.data.dateAdded).getTime();
        return markerDate >= startTime && markerDate <= endTime;
      });
  
      setMarkers(filtered);
    }
  };

  const handleStreetViewLoad = (streetView) => {
    // Customize Street View if needed
    streetView.setPov({
      heading: 100,
      pitch: 0,
    });
  };
  
  useEffect(() => {
    if (markerClusterRef.current) {
      markerClusterRef.current.clearMarkers(); // Clear existing markers
    }
  
    if (map && markers.length > 0) {
      const googleMarkers = markers
        .filter((marker) => marker.lat && marker.lng) // Ensure valid coordinates
        .map((marker) => {
          const gMarker = new window.google.maps.Marker({
            position: { lat: marker.lat, lng: marker.lng },
            title: marker.data.title,
            icon: {
              url: hazardIcon || 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(30, 30),
            },
          });
  
          // Add click listener for each marker to handle InfoWindow
          gMarker.addListener('click', () => {
            console.log('Marker clicked:', marker); // Debugging log
            setSelectedPost(marker);
          });          
  
          return gMarker;
        });
  
      markerClusterRef.current = new MarkerClusterer({
        markers: googleMarkers,
        map,
        styles: clusterStyles, // Apply custom styles if needed
      });
  
      console.log('MarkerClusterer initialized with', googleMarkers.length, 'markers');
    }
  }, [markers, map]); // Run this effect whenever `markers` or `map` changes
  
  useEffect(() => {
    const categoriesRef = ref(database, 'categories'); // Adjust path as needed
    onValue(categoriesRef, (snapshot) => {
      if (snapshot.exists()) {
        setCategories(Object.values(snapshot.val()));
      }
    });
  
    return () => off(categoriesRef); // Cleanup listener
  }, []);
  
  
  useEffect(() => {
    const postsRef = ref(database, 'posts');
    onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const updatedMarkers = Object.keys(data).map((key) => ({
          id: key,
          lat: data[key].lat || 0, // Default to 0 if missing
          lng: data[key].lng || 0,
          data: {
            title: data[key].title || "No Title",
            description: data[key].description || "No Description",
            imageURL: data[key].imageURL || "",
            displayName: data[key].displayName || "Anonymous",
            dateAdded: new Date(data[key].dateAdded).toLocaleString(),
          },
        }));
        
        console.log("Updated Markers:", updatedMarkers); // Debug the markers array
        setMarkers(updatedMarkers);
      } else {
        console.log("No posts found in Firebase");
        setMarkers([]); // Clear markers if no data exists
      }
    });
  
    return () => off(postsRef); // Cleanup listener on unmount
  }, []);
  
  
  const clusterStyles = [
    {
      url: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m1.png",
      height: 50,
    width: 50,
    textColor: "#fff",
    textSize: 14,
    },
    {
      url: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m2.png",
      height: 60,
    width: 60,
    textColor: "#fff",
    textSize: 16,
    },
    {
      url: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m3.png",
      height: 70,
      width: 70,
      textColor: "#fff",
      textSize: 18,
    },
  ];
  
  // Fetch markers when the component mounts
  useEffect(() => {
    const markersRef = ref(database, 'posts');
    onValue(markersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const updatedMarkers = Object.values(data);
        setMarkers((prevMarkers) => [...prevMarkers, ...updatedMarkers]);
      }
    });

    return () => off(markersRef); // Cleanup listener on component unmount
  }, []);

    // Save markers to Firebase
    const saveMarkersToFirebase = async (updatedMarkers) => {
      const dbRef = ref(database, 'posts'); // Ensure 'markers' is the correct path
      try {
        const markersObject = updatedMarkers.reduce((acc, marker) => {
          acc[marker.id] = marker; // Use marker ID as the key
          return acc;
        }, {});
        await set(dbRef, markersObject); // Save the markers object to Firebase
        console.log('Markers saved to Firebase successfully.');
      } catch (error) {
        console.error('Error saving markers to Firebase:', error);
      }
    };
    
    const imageInputRef = useRef(null); // Create a reference for the image file input
    
    const addNewMarker = async () => {
      if (!editTitle || !editDescription || !selectedLocation) {
        setErrorMessage('Please fill in all fields and select a location on the map.');
        return;
      }
    
      let uploadedImageURL;
    
      try {
        // Adjusting the path to match the actual folder structure seen in Firebase Storage
        const adminImageRef = storageRef(storage, 'admin/admin.jpg'); // Note the path "admin/admin.jpg"
        uploadedImageURL = await getDownloadURL(adminImageRef);
      } catch (err) {
        console.error('Error fetching admin image:', err);
        setErrorMessage('Error fetching admin image. Please try again.');
        return;
      }
    
      // If the user uploads an image, upload it to Firebase Storage
      if (imageFile) {
        try {
          const imageRef = storageRef(storage, `posts/${Date.now()}.jpg`);
          await uploadBytes(imageRef, imageFile);
          uploadedImageURL = await getDownloadURL(imageRef);
        } catch (err) {
          console.error('Error uploading image:', err);
          setErrorMessage('Error uploading image. Please try again.');
          return;
        }
      }
    
      const newMarker = {
        title: editTitle,
        body: editDescription,
        createdAt: new Date().toISOString(),
        displayName: 'Admin',
        email: 'admin@example.com',
        imageURL: uploadedImageURL,
        photoURL: uploadedImageURL, // Set photoURL for the admin image or the uploaded image
        upvotes: 2, // Automatically set upvotes to 2
        location: {
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          title: editTitle,
        },
      };
    
      try {
        const markerKey = Date.now().toString();
        const dbRef = ref(database, `posts/${markerKey}`);
        await set(dbRef, newMarker);
    
        setMarkers((prevMarkers) => [
          ...prevMarkers,
          { id: markerKey, ...newMarker },
        ]);
    
        setShowFormModal(false);
        setSelectedLocation(null);
        setEditTitle('');
        setEditDescription('');
        setImageFile(null);
    
        // Show success toast
        toast.success('Marker added successfully!', { autoClose: 1500 });
      } catch (err) {
        setErrorMessage('Error adding marker: ' + err.message);
      }
    };
    
  
  const handleCategoryFilterChange = (e) => setFilterCategory(e.target.value);

  const getTimeCutoff = (filterDate) => {
    const now = new Date().getTime(); // Current time in milliseconds
    switch (filterDate) {
      case "Last 5 Hours":
        return now - 5 * 60 * 60 * 1000; // 5 hours ago
      case "Last 24 Hours":
        return now - 24 * 60 * 60 * 1000; // 24 hours ago
      case "Last 3 Days":
        return now - 3 * 24 * 60 * 60 * 1000; // 3 days ago
      case "Last 7 Days":
        return now - 7 * 24 * 60 * 60 * 1000; // 7 days ago
      case "Last 30 Days":
        return now - 30 * 24 * 60 * 60 * 1000; // 30 days ago
      default:
        return null;
    }
  };
  
  const getCategoryFromTitle = (title) => {
    if (!title) return "Other";
  
    title = title.toLowerCase();
  
    if (title.includes("bridge damage")) return "Bridge Damage";
    if (title.includes("flooding")) return "Flood";
    if (title.includes("traffic accidents")) return "Accident";
  
    return "Other"; // Default category if no match
  };
  
  
  useEffect(() => {
    const uniqueCategories = Array.from(
      new Set(
        markers.map((marker) => getCategoryFromTitle(marker.data?.title || ""))
      )
    );
    setCategories(["All", ...uniqueCategories]); // Include "All" as the default option
  }, [markers]);
  
  
  const filteredMarkers = markers.filter((marker) => {
    const categoryFromTitle = getCategoryFromTitle(marker.data?.title || "");
    const matchesCategory =
    filterCategory === "All" || categoryFromTitle === filterCategory;
  
    const createdAt = marker.createdAt; // Accessing createdAt directly
    if (!createdAt) return false; // Skip markers without a timestamp
  
    const dateAdded = new Date(createdAt).getTime(); // Convert to timestamp
    const cutoffTime = getTimeCutoff(filterDate);
    const matchesDate = cutoffTime ? dateAdded >= cutoffTime : true;
  
    return matchesCategory && matchesDate;
  });
  
  const startAddMarkerProcess = () => {
    setIsAddingMarker(true); // Enable "Add Marker" mode
    setNotification('Click on the map to select the marker location.'); // Notify user
    setSelectedLocation(null); // Reset previously selected location
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

  useEffect(() => {
    return () => {
      if (markerClusterRef.current) {
        markerClusterRef.current.clearMarkers();
        markerClusterRef.current.addListener("clusterclick", (event) => {
          const cluster = event.cluster;
          map.fitBounds(cluster.bounds); // Zoom to the cluster's bounds
        });
      }
    };
  }, []);
  
  
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

  const MarkerDetailsModal = ({ selectedPost, onClose }) => {
  if (!selectedPost) return null;

  return (

    
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-96 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          &times;
        </button>
        <h3 className="text-lg font-bold text-yellow-500 mb-2">
          {selectedPost?.data?.title || selectedPost?.location?.title || "No Title"}
        </h3>
        <p className="text-gray-600 mb-4">
          {selectedPost.data?.description || "No Description"}
        </p>
        {selectedPost.data?.imageURL && (
          <img
            src={selectedPost.data.imageURL}
            alt="Post"
            className="w-full rounded-lg mb-4"
          />
        )}
        <p className="text-sm text-gray-500 mb-2">
          <strong>Posted By:</strong> {selectedPost.data?.displayName || "Anonymous"}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          <strong>Posted On:</strong> {selectedPost.data?.dateAdded || "N/A"}
        </p>
      </div>
    </div>
  );
};

  
useEffect(() => {
  const postsRef = ref(database, 'posts'); // Reference to Firebase "posts"
  onValue(postsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Filter data: only show admin posts or posts with 2+ upvotes
      const filteredMarkers = Object.keys(data)
        .filter((key) => {
          const post = data[key];
          return (
            post.email === 'admin@example.com' || // Admin markers
            (post.upvotes && post.upvotes >= 2) // Markers with 2+ upvotes
          );
        })
        .map((key) => ({
          id: key,
          lat: data[key]?.location?.latitude || 0,
          lng: data[key]?.location?.longitude || 0,
          data: {
            title: data[key]?.title || "No Title",
            description: data[key]?.body || "No Description",
            imageURL: data[key]?.imageURL || "",
            displayName: data[key]?.displayName || "Anonymous",
            dateAdded: new Date(data[key]?.createdAt).toLocaleString(),
          },
        }));

      console.log('Filtered Markers:', filteredMarkers); // Debug filtered markers
      setMarkers(filteredMarkers); // Set the filtered markers
    } else {
      console.log("No posts found in Firebase");
      setMarkers([]); // Clear markers if no data exists
    }
  });

  return () => off(postsRef); // Cleanup listener on component unmount
}, []);

  
  const handleMapClick = (event) => {
    if (isAddingMarker) {
      setSelectedLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      setShowFormModal(true); // Open the form to fill in marker details
      setIsAddingMarker(false); // Disable add marker mode after selecting location
      setNotification(''); // Clear any notifications since the action is completed
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
    <LoadScript googleMapsApiKey={API_KEY} libraries={libraries} >
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#001F3F' }}>
        {/* Sidebar Container */}
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-logo">
            <img src={logo} alt="Logo" />
            <span className="logo-text mt-5"></span>
          </div>

  
          {/* Other Sidebar Items */}
          <SidebarItem icon={mapIcon} label="Map Management" active={activeComponent === 'admin'} onClick={() => setActiveComponent('admin')}/>
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
           
    <ToastContainer
                position="top-center"
                autoClose={500} // 0.5 seconds
                hideProgressBar
                closeOnClick
                transition={Slide}
            />
          <div className="main-content">
          {activeComponent === 'admin' ? (
  <>
    {/* Notification Message */}
    {notification && (
  <div style={{ marginBottom: '20px', padding: '10px', background: '#FFC107', color: '#000', borderRadius: '5px' }}>
    {notification}
  </div>
)}        
        {/* Button Controls */}
        <div style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <button
              onClick={startAddMarkerProcess}
              style={{
                marginBottom: '10px',
                padding: '10px 15px',
                borderRadius: '5px',
                background: '#007BFF',
                color: '#FFF',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Add Marker
            </button>
          <button onClick={() => setShowTrafficLayer(!showTrafficLayer)} style={{ padding: "10px 15px", borderRadius: "5px", background: showTrafficLayer ? "#FFC107" : "#6C757D", color: "#FFF", border: "none", cursor: "pointer" }}>
            {showTrafficLayer ? "Hide Traffic Layer" : "Show Traffic Layer"}
          </button>
          <button onClick={() => setShowTransitLayer(!showTransitLayer)} style={{ padding: "10px 15px", borderRadius: "5px", background: showTransitLayer ? "#FFC107" : "#6C757D", color: "#FFF", border: "none", cursor: "pointer" }}>
            {showTransitLayer ? "Hide Transit Layer" : "Show Transit Layer"}
          </button>
          <button onClick={() => setShowBicyclingLayer(!showBicyclingLayer)} style={{ padding: "10px 15px", borderRadius: "5px", background: showBicyclingLayer ? "#FFC107" : "#6C757D", color: "#FFF", border: "none", cursor: "pointer" }}>
            {showBicyclingLayer ? "Hide Bicycling Layer" : "Show Bicycling Layer"}
          </button>
         
        </div>
    <div style={{ marginBottom: "20px" }}>
    

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

      <GoogleMap
  mapContainerStyle={{ width: "100%", height: "500px" }}
  center={mapCenter}
  zoom={mapZoom}
  options={mapOptions}
  onClick={handleMapClick}
  onLoad={handleMapLoad}
>
  {/* Layers */}
  {showTrafficLayer && <TrafficLayer />}
  {showTransitLayer && <TransitLayer />}
  {showBicyclingLayer && <BicyclingLayer />}

  {/* Street View Panorama */}
  {streetViewVisible && (
    <StreetViewPanorama
      position={mapCenter} // Center position or a specific marker's position
      visible={true} // Street View visibility
      onLoad={(streetView) => {
        // Customize Street View POV
        streetView.setPov({
          heading: 100, // Adjust heading for the initial view
          pitch: 0,     // Adjust pitch for the initial view
        });
      }}
      options={{
        pov: { heading: 100, pitch: 0 }, // Default POV for Street View
        zoom: 1, // Default Street View zoom level
      }}
      style={{ width: "100%", height: "300px", marginTop: "20px" }} // Style Street View
    />
  )}

  {/* Render Markers */}
  {filteredMarkers.map((marker) => (
     <Marker
     key={marker.id}
     position={{ lat: marker.lat, lng: marker.lng }}
     onClick={() => {
       setMapCenter({ lat: marker.lat, lng: marker.lng }); // Center map on marker click
       setStreetViewVisible(true); // Show Street View on marker click
     }}
     icon={{
       url: hazardIcon || "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
       scaledSize: new window.google.maps.Size(30, 30),
     }}
   />
 ))}
</GoogleMap>



      {/* Form Modal to add a new marker */}
      {showFormModal && (
  <div className="marker-form-modal">
    <div className="marker-form">
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      <h3>Marker Details</h3>

      {/* Dropdown to select the issue type */}
      <select
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        style={{ marginBottom: '10px', width: '100%', padding: '10px' }}
      >
        <option value="">Select an Issue</option>
        <option value="Construction">Construction</option>
        <option value="Potholes">Potholes</option>
        <option value="Landslide">Landslide</option>
        <option value="Flooding">Flooding</option>
        <option value="Debris">Debris</option>
        <option value="Broken Glass">Broken Glass</option>
        <option value="Traffic Accidents">Traffic Accidents</option>
        <option value="Roadway Erosion">Roadway Erosion</option>
        <option value="Loose Gravel">Loose Gravel</option>
        <option value="Bridge Damage">Bridge Damage</option>
      </select>

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

{showFilterModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        width: "400px",
        background: "#FFF",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      }}
    >
      <h3 style={{ marginBottom: "20px", textAlign: "center" }}>Filter Markers</h3>

      {/* Date Filter */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Date Range</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
          style={{ marginBottom: "10px" }}
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="End Date"
        />
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: "15px" }}>
      <label style={{ display: "block", marginBottom: "5px" }}>Filter by Category</label>
      <select
    value={tempFilterCategory}
    onChange={(e) => setTempFilterCategory(e.target.value)}
    style={{
      width: "100%",
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ddd",
    }}
  >
    {categories.map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>
      </div>

      {/* Modal Actions */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={() => setShowFilterModal(false)}
          style={{
            padding: "10px 15px",
            borderRadius: "5px",
            background: "#6C757D",
            color: "#FFF",
            border: "none",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setFilterCategory(tempFilterCategory);
            handleDateFilter(); // Apply date filter
            setShowFilterModal(false);
          }}
          style={{
            padding: "10px 15px",
            borderRadius: "5px",
            background: "#007BFF",
            color: "#FFF",
            border: "none",
            cursor: "pointer",
          }}
        >
          Apply Filters
        </button>
      </div>
    </div>
  </div>
)}


{selectedPost && !showFormModal && (
  <MarkerDetailsModal
    selectedPost={selectedPost}
    onClose={() => setSelectedPost(null)}
  />
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
