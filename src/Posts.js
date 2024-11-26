import React, { useEffect, useState, useRef } from 'react';
import { ref, get, child, remove, update } from 'firebase/database';
import { database } from './firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import './Posts.css';
import { Player } from '@lottiefiles/react-lottie-player';
import loadingAnimation from './lottie/loading.json';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';



const GOOGLE_MAPS_API_KEY = 'AIzaSyDZShgCYNWnTIkKJFRGsqY8GZDax9Ykqo0';

const Posts = () => {
  
// Helper function to export CSV
const exportToCSV = (data, filename) => {
  const headers = ['ID', 'Title', 'Content', 'Created At', 'Latitude', 'Longitude', 'Upvotes', 'Downvotes'];
  const rows = data.map(post => [
    post.id,
    post.title || 'Untitled Post',
    post.body || 'No content',
    post.createdAt ? new Date(post.createdAt).toLocaleString() : 'N/A',
    post.location?.latitude || 'N/A',
    post.location?.longitude || 'N/A',
    post.upvotes || 0,
    post.downvotes || 0,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper function to export PDF
const exportToPDF = (data, filename) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Posts Report', 14, 20);

  // Add table headers
  const headers = ['ID', 'Title', 'Content', 'Created At', 'Latitude', 'Longitude', 'Upvotes', 'Downvotes'];
  const rows = data.map(post => [
    post.id,
    post.title || 'Untitled Post',
    post.body || 'No content',
    post.createdAt ? new Date(post.createdAt).toLocaleString() : 'N/A',
    post.location?.latitude || 'N/A',
    post.location?.longitude || 'N/A',
    post.upvotes || 0,
    post.downvotes || 0,
  ]);

  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 30,
    styles: { fontSize: 10 },
  });

  doc.save(`${filename}.pdf`);
};

  const [posts, setPosts] = useState([]);
  const [originalPosts, setOriginalPosts] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [sortOption, setSortOption] = useState('Most Recent');
  const [showAllPosts, setShowAllPosts] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const modalRef = useRef(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dropdownRef = useRef(null);
  

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, "posts"));
        if (snapshot.exists()) {
          const postsData = [];
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            postsData.push({
              id: childSnapshot.key,
              ...data,
            });
          });
          setOriginalPosts(postsData);
          setPosts(postsData);
        } else {
          console.log("No data available");
        }
        setTimeout(() => {
          setLoading(false); // Stop loading once data is fetched
      }, 1000); // 5-second delay
      } catch (error) {
        console.error('Error fetching users:', error);
    } finally {
        // Simulate a loading delay (5 seconds)
        setTimeout(() => {
            setLoading(false); // Stop loading once data is fetched
        }, 5000); // 5-second delay
    }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      posts.forEach((post) => {
        if (post.location?.latitude && post.location?.longitude) {
          initializeMap(post.id, post.location.latitude, post.location.longitude);
        }
      });
    };
    document.head.appendChild(script);

    return () => {
      const scriptElement = document.querySelector(`script[src^="https://maps.googleapis.com/maps/api/js"]`);
      if (scriptElement) {
        scriptElement.remove();
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };

    const handleScroll = () => {
      setDropdownOpen(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const initializeMap = (postId, lat, lng) => {
    const mapElement = document.getElementById(`map-${postId}`);
    if (mapElement && window.google) {
      const map = new window.google.maps.Map(mapElement, {
        center: { lat: Number(lat), lng: Number(lng) },
        zoom: 15,
      });

      new window.google.maps.Marker({
        position: { lat: Number(lat), lng: Number(lng) },
        map,
        title: 'Post Location'
      });
    }
  };

  useEffect(() => {
    if (window.google) {
      posts.forEach((post) => {
        if (post.location?.latitude && post.location?.longitude) {
          initializeMap(post.id, post.location.latitude, post.location.longitude);
        }
      });
    }
  }, [posts]);

  const handleDeleteClick = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  const handleExport = format => {
    if (format === 'csv') {
      exportToCSV(posts, 'Posts_Report');
    } else if (format === 'pdf') {
      exportToPDF(posts, 'Posts_Report');
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedPost) {
      try {
        setDeleting(true);  // Start deleting (disable UI interactions)
        await remove(ref(database, `posts/${selectedPost.id}`));  // Remove from Firebase Realtime Database
        // Update the local state to remove the deleted post
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== selectedPost.id));
        setOriginalPosts((prevPosts) => prevPosts.filter((post) => post.id !== selectedPost.id));
        setSuccessMessage('Post deleted successfully!');  // Show success message
      } catch (error) {
        console.error('Error deleting post:', error);
        setErrorMessage('Failed to delete the post. Please try again.');  // Show error message
      } finally {
        setDeleting(false);  // Reset deleting state (reenable UI interactions)
        setShowDeleteModal(false);  // Close the delete confirmation modal
        setSelectedPost(null);  // Reset selected post
      }
    }
  };
  
  const handleCloseDeleteModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowDeleteModal(false);  // Close modal after animation
    }, 300);  // Adjust the timing for the animation if needed
  };

  const handleMarkResolved = async (post) => {
    try {
      await update(ref(database, `posts/${post.id}`), { resolved: true });
      setPosts(posts.map((p) => (p.id === post.id ? { ...p, resolved: true } : p)));
      setSuccessMessage('Post marked as resolved!');
      setDropdownOpen(null);
    } catch (error) {
      console.error('Error marking post as resolved:', error);
      setErrorMessage('Error marking post as resolved. Please try again.');
    }
  };

  const handleEditClick = (post) => {
    setEditPost(post);
    setShowEditModal(true);
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      const modal = document.querySelector('.modal-container');
      if (modal) {
        modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    document.body.style.overflow = 'auto';
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setShowDeleteModal(false), 300);
  };

  const handleEditSubmit = async () => {
    if (!editPost?.title.trim() || !editPost?.body.trim()) {
      setErrorMessage('Title and Body cannot be empty.');
      return;
    }

    try {
      await update(ref(database, `posts/${editPost.id}`), {
        title: editPost.title,
        body: editPost.body,
      });      
      setPosts(posts.map((p) => (p.id === editPost.id ? editPost : p)));
      setSuccessMessage('Post updated successfully!');
      setShowEditModal(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error updating post:', error);
      setErrorMessage('Failed to update the post. Please try again.');
    }
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    let sortedPosts = [...originalPosts];

    if (option === 'Most Recent') {
      sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (option === 'Most Voted') {
      sortedPosts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    } else if (option === 'Least Voted') {
      sortedPosts.sort((a, b) => (a.upvotes - a.downvotes) - (b.upvotes - b.downvotes));
    }

    setPosts(sortedPosts);
    setShowAllPosts(false);
  };

  const renderLocationSection = (post) => {
    if (post.location?.latitude && post.location?.longitude) {
      return (
        <div className="location-section">
          <div className="coordinates">
            <p><strong>Latitude:</strong> {post.location.latitude}</p>
            <p><strong>Longitude:</strong> {post.location.longitude}</p>
          </div>
         
        </div>
      );
    }
    return null;
  };

  
  if (isLoading) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Player
                autoplay
                loop
                src={loadingAnimation}
                style={{ height: '150px', width: '150px' }}
            />
        </div>
    );
}

  return (
    <div className="container">
       <div className="export-container">
        <div className="dropdown">
          <button className="export-dropdown-button">Export</button>
          <div className="dropdown-menu">
            <button onClick={() => handleExport('csv')} className="dropdown-item">
              Export as CSV
            </button>
            <button onClick={() => handleExport('pdf')} className="dropdown-item">
              Export as PDF
            </button>
          </div>
        </div>
      </div>
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="flex justify-end mb-4">
        <div className="relative dropdown-container">
          <button
            className={`sort-button ${dropdownOpen === 'sort' ? 'open' : ''}`}
            onClick={() => setDropdownOpen((prev) => (prev === 'sort' ? null : 'sort'))}
          >
            {sortOption} 
            <span className={`chevron-icon ${dropdownOpen === 'sort' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {dropdownOpen === 'sort' && (
            <div className="dropdown-menu glassmorphism">
              <button
                className={`dropdown-item ${sortOption === 'Most Recent' ? 'active' : ''}`}
                onClick={() => handleSortChange('Most Recent')}
              >
                Most Recent
                {sortOption === 'Most Recent' && <span className="checkmark-icon"></span>}
              </button>
              <button
                className={`dropdown-item ${sortOption === 'Most Voted' ? 'active' : ''}`}
                onClick={() => handleSortChange('Most Voted')}
              >
                Most Voted
                {sortOption === 'Most Voted' && <span className="checkmark-icon"></span>}
              </button>
              <button
                className={`dropdown-item ${sortOption === 'Least Voted' ? 'active' : ''}`}
                onClick={() => handleSortChange('Least Voted')}
              >
                Least Voted
                {sortOption === 'Least Voted' && <span className="checkmark-icon"></span>}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="posts-list">
        {(showAllPosts ? originalPosts : posts).map((post) => (
          <div key={post.id} className="post-item">
            <div className="post-header">
              <div className="user-info">
                <img src={post.photoURL || '/path-to-default-user-photo.png'} alt="User Photo" className="user-photo" />
                <p className="username">{post.displayName || 'Anonymous User'}</p>
                <button className="dropdown-btn" onClick={() => setDropdownOpen(post.id)}>
                  <FontAwesomeIcon icon={faEllipsisV} />
                </button>
              </div>
              {dropdownOpen === post.id && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={() => handleDeleteClick(post)}>
                    Delete
                  </button>
                  <button className="dropdown-item" onClick={() => handleEditClick(post)}>
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="post-body">
              <h2 className="post-title">{post.title || 'Untitled Post'}</h2>
              <p className="post-content">{post.body || 'No content available for this post.'}</p>
              <p className="post-date">
                <strong>Created At:</strong> {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'N/A'}
              </p>

              {post.imageURL && (
                <img src={post.imageURL} alt={post.title || 'Post Image'} className="post-image" />
              )}

              {renderLocationSection(post)}
            </div>

            <div className="post-footer">
              <span><strong>Upvotes:</strong> {post.upvotes || 0}</span>
              <span><strong>Downvotes:</strong> {post.downvotes || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
{showDeleteModal && (
  <div className={`modal-container ${isClosing ? 'closing' : ''}`}>
    <div className="modal-content">
      <h3>Are you sure you want to delete this post?</h3>
      <p className="confirmation-text">This action cannot be undone.</p>
      <div className="modal-actions">
        <button onClick={handleCloseDeleteModal} disabled={deleting} className="cancel-button">
          Cancel
        </button>
        <button onClick={handleDeleteConfirm} disabled={deleting} className="delete-button">
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  </div>
)}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-container edit-modal">
            <h2>Edit Post</h2>
            <input
              type="text"
              placeholder="Enter title"
              value={editPost?.title || ""}
              onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
            />
            <textarea
              placeholder="Enter body"
              value={editPost?.body || ""}
              onChange={(e) => setEditPost({ ...editPost, body: e.target.value })}
            />
            <div className="modal-actions">
              <button
                className="modal-button cancel"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-button confirm"
                onClick={handleEditSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;