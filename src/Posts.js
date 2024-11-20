import React, { useEffect, useState, useRef } from 'react';
import { ref, get, child, remove, update } from 'firebase/database';
import { database } from './firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import './Posts.css';


const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your API Key

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [originalPosts, setOriginalPosts] = useState([]); // Store all posts without filters
  const [loading, setLoading] = useState(true);
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

  // Fetch posts from Firebase
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const loadGoogleMapsScript = () => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  };

  useEffect(() => {
    loadGoogleMapsScript();
  }, []);

  const initializeMapForPost = (postId, lat, lng) => {
    const mapElement = document.getElementById(`map-${postId}`);
    if (mapElement && window.google) {
      const map = new window.google.maps.Map(mapElement, {
        center: { lat, lng },
        zoom: 15,
      });

      new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: "Post Location",
      });
    }
  };

  // Render maps for posts with coordinates after DOM updates
  useEffect(() => {
    posts.forEach((post) => {
      if (post.latitude && post.longitude) {
        initializeMap(post.id, post.latitude, post.longitude);
      }
    });
  }, [posts]);

  // Handle closing dropdown when clicking outside or scrolling
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
        center: { lat, lng },
        zoom: 15,
      });

      new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: 'Post Location',
      });
    }
  };

  // Render maps for posts with coordinates after DOM updates
  useEffect(() => {
    posts.forEach((post) => {
      if (post.latitude && post.longitude) {
        initializeMap(post.id, post.latitude, post.longitude);
      }
    });
  }, [posts]);
  
  // Handle delete post
  const handleDeleteClick = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
    setDropdownOpen(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPost) {
      try {
        setDeleting(true); // Start loading
        await remove(ref(database, `posts/${selectedPost.id}`));
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== selectedPost.id));
        setOriginalPosts((prevPosts) => prevPosts.filter((post) => post.id !== selectedPost.id));
        setShowDeleteModal(false);
        setSelectedPost(null);
        setSuccessMessage('Post deleted successfully!');
      } catch (error) {
        console.error('Error deleting post:', error);
        setErrorMessage('Failed to delete the post. Please try again.');
      } finally {
        setDeleting(false); // End loading
      }
    }
  };
  
  
  // Handle mark as resolved
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

  // Handle edit post
  const handleEditClick = (post) => {
    setEditPost(post);
    setShowEditModal(true);

    // Prevent scrolling and ensure the modal is centered
    document.body.style.overflow = 'hidden'; // Prevent body scroll

    // Center the modal
    setTimeout(() => {
      const modal = document.querySelector('.modal-container');
      if (modal) {
        modal.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    document.body.style.overflow = 'auto'; // Restore body scroll
  };
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setShowDeleteModal(false), 300); // Match animation duration
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

  // Handle sorting change
  const handleSortChange = (option) => {
    setSortOption(option);
    let sortedPosts = [...originalPosts]; // Copy original posts

    if (option === 'Most Recent') {
      sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (option === 'Most Voted') {
      sortedPosts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    } else if (option === 'Least Voted') {
      sortedPosts.sort((a, b) => (a.upvotes - a.downvotes) - (b.upvotes - b.downvotes));
    }

    setPosts(sortedPosts); // Update posts to show sorted version
    setShowAllPosts(false); // Hide all posts and show only sorted posts
  };

  return (
<div className="container">
  {successMessage && <p className="success-message">{successMessage}</p>}

  <div className="flex justify-end mb-4">
    <div className="relative dropdown-container">
      <button
        className={`sort-button ${dropdownOpen === 'sort' ? 'open' : ''}`}
        onClick={() => setDropdownOpen((prev) => (prev === 'sort' ? null : 'sort'))}
      >
        Sort by: {sortOption}
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
              <button className="dropdown-item" onClick={() => handleDeleteClick(post)}>Delete</button>
              <button className="dropdown-item" onClick={() => handleEditClick(post)}>Edit</button>
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

          {/* Display coordinates if available */}
          {!post.latitude || !post.longitude ? (
  <p>Coordinates are not available for this post.</p>
) : (
  <>
    <div className="coordinates">
      <p><strong>Latitude:</strong> {post.latitude}</p>
      <p><strong>Longitude:</strong> {post.longitude}</p>
    </div>
    <div id={`map-${post.id}`} className="map-container"></div>
  </>
)}

          {post.location && (
            <div id={`map-${post.id}`} className="map-container"></div>
          )}
        </div>

        <div className="post-footer">
          <span><strong>Upvotes:</strong> {post.upvotes || 0}</span>
          <span><strong>Downvotes:</strong> {post.downvotes || 0}</span>
        </div>
      </div>
    ))}
  </div>
      {showDeleteModal && (
  <div
  className="modal-overlay"
  role="dialog"
  aria-labelledby="delete-modal-title"
  aria-describedby="delete-modal-description"
  onClick={() => setShowDeleteModal(false)} // Close modal when clicking outside
>
  <div
    className="modal-container delete-modal"
    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
  >
    <h2 id="delete-modal-title">Confirm Delete</h2>
    <p id="delete-modal-description">
      Are you sure you want to delete this post? This action cannot be undone.
    </p>
    <p>
      <strong>Post Title:</strong> {selectedPost?.title || "Untitled Post"}
    </p>
    <div className="modal-actions">
      <button
        className="modal-button cancel"
        onClick={() => setShowDeleteModal(false)}
      >
        Cancel
      </button>
      <button
        className="modal-button delete"
        onClick={handleDeleteConfirm}
        disabled={deleting}
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
    </div>
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