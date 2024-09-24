import React, { useEffect, useState, useRef} from 'react';
import { ref, get, child, remove, update } from 'firebase/database';
import { database } from './firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import './Posts.css';

const GOOGLE_MAPS_API_KEY = 'AIzaSyACvMNE1lw18V00MT1wzRDW1vDlofnOZbw';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [sortOption, setSortOption] = useState('Most Recent');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const dropdownRef = useRef(null);

  const postsPerPage = 6;
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, 'posts'));

        if (snapshot.exists()) {
          const postsData = [];
          snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            postsData.push({
              id: childSnapshot.key,
              ...data
            });
          });
          setPosts(postsData);
        } else {
          console.log('No data available');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);
// Event listener to handle closing the dropdown when clicking outside or scrolling
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
  const initMaps = (sortedPosts) => {
    try {
      const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);

      currentPosts.forEach((post) => {
        if (post.location) {
          const mapElement = document.getElementById(`map-${post.id}`);
          if (!mapElement) return;

          const map = new window.google.maps.Map(mapElement, {
            center: { lat: post.location.latitude, lng: post.location.longitude },
            zoom: 13
          });

          new window.google.maps.Marker({
            position: { lat: post.location.latitude, lng: post.location.longitude },
            map,
            title: post.title
          });

          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: post.location.latitude, lng: post.location.longitude } },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                const locationElement = document.getElementById(`location-${post.id}`);
                if (locationElement) {
                  locationElement.innerText = results[0].formatted_address;
                }
              } else {
                console.error('Geocode was not successful: ' + status);
              }
            }
          );
        }
      });
    } catch (error) {
      console.error('Error loading Google Maps:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      loadGoogleMapsScript();
    }
  }, [loading]);

  const loadGoogleMapsScript = () => {
    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initMaps(sortedPosts);
      };
      document.head.appendChild(script);
    } else {
      initMaps(sortedPosts);
    }
  };

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        initMaps(sortedPosts);
      }, 500);
    }
  }, [sortOption, currentPage]);

  const handleDeleteClick = (post) => {
    setSelectedPost(post);
    setShowModal(true);
    setDropdownOpen(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPost) {
      try {
        await remove(ref(database, `posts/${selectedPost.id}`));
        setPosts(posts.filter((post) => post.id !== selectedPost.id));
        setShowModal(false);
        setDeleteReason('');
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleMarkResolved = async (post) => {
    try {
      await update(ref(database, `posts/${post.id}`), { resolved: true });
      setPosts(posts.map((p) => (p.id === post.id ? { ...p, resolved: true } : p)));
      setSuccessMessage('Post marked as resolved!');
      setDropdownOpen(null);
    } catch (error) {
      setErrorMessage('Error marking post as resolved. Please try again.');
    }
  };

  const handleEditClick = (post) => {
    setDropdownOpen(null);
    setEditPost(post);
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editPost?.title.trim() || !editPost?.body.trim()) {
      setErrorMessage('Title and Body cannot be empty.');
      return;
    }

    try {
      await update(ref(database, `posts/${editPost.id}`), {
        title: editPost.title,
        body: editPost.body
      });
      setPosts(posts.map((p) => (p.id === editPost.id ? editPost : p)));
      setSuccessMessage('Post updated successfully!');
      setErrorMessage('');
      setShowEditModal(false);

      // Scroll to the top of the page after successful update
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error updating post:', error);
      setErrorMessage('Failed to update the post. Please try again.');
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSortChange = (option) => {
    setSortOption(option);
    setDropdownOpen(null);
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortOption === 'Most Recent') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortOption === 'Most Voted') {
      return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    } else if (sortOption === 'Least Voted') {
      return (a.upvotes - a.downvotes) - (b.upvotes - b.downvotes);
    }
    return 0;
  });

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="reported-posts-container p-4">
      <h1 className="text-2xl font-bold mb-4">Reported Posts</h1>
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      <div className="flex justify-end mb-4">
        <div className="relative">
          <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => setDropdownOpen('sort')}>
            Sort by: {sortOption}
          </button>
          {dropdownOpen === 'sort' && (
            <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
              <button className="dropdown-item w-full text-left px-4 py-2" onClick={() => handleSortChange('Most Recent')}>Most Recent</button>
              <button className="dropdown-item w-full text-left px-4 py-2" onClick={() => handleSortChange('Most Voted')}>Most Voted</button>
              <button className="dropdown-item w-full text-left px-4 py-2" onClick={() => handleSortChange('Least Voted')}>Least Voted</button>
            </div>
          )}
        </div>
      </div>

      <div className="posts-list grid grid-cols-1 gap-4">
        {sortedPosts.slice(indexOfFirstPost, indexOfLastPost).map((post) => (
          <div key={post.id} className="post-item bg-white p-4 rounded-lg shadow-md relative">
            <div className="absolute top-6 right-6">
              <FontAwesomeIcon icon={faEllipsisV} size="lg" className="cursor-pointer" onClick={() => setDropdownOpen(post.id)} />
              {dropdownOpen === post.id && (
                <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                  <button className="dropdown-item w-full text-left px-4 py-2" onClick={() => handleDeleteClick(post)}>Delete</button>
                  {!post.resolved && (
                    <button className="dropdown-item w-full text-left px-4 py-2" onClick={() => handleMarkResolved(post)}>Mark as Resolved</button>
                  )}
                  <button className="dropdown-item w-full text-left px-4 py-2" onClick={() => handleEditClick(post)}>Edit</button>
                </div>
              )}
            </div>

            <div className="flex items-center mb-2">
  <img src={post.photoURL || '/path-to-default-user-photo.png'} alt="User Photo" className="user-photo mr-2 fixed-size" />
  <p className="text-sm text-gray-600">
    <strong>{post.displayName || 'Anonymous User'}</strong>
  </p>
  {post.resolved && <span className="badge-resolved">Resolved</span>}
</div>


            <h2 className="text-3xl font-bold mb-2">{post.title || 'Untitled Post'}</h2>
            <p className="mb-3 text-xl">{post.body || 'No content available for this post.'}</p>

            <p className="text-sm text-gray-600 mb-2">
              <strong>Created At:</strong> {post.createdAt ? new Date(post.createdAt).toLocaleString() : 'N/A'}
            </p>

            <img
              src={post.imageURL || '/path-to-default-image.png'}
              alt={post.title || 'Post Image'}
              className="post-image mb-2 rounded fixed-size"
            />

            <p className="text-sm text-gray-600 mb-2">
              <strong>Location:</strong>
              <span id={`location-${post.id}`}>
                {post.location ? `${post.location.latitude}, ${post.location.longitude}` : 'Location not available'}
              </span>
            </p>

            {post.location && (
              <div id={`map-${post.id}`} className="map-container mb-2 rounded fixed-size"></div>
            )}

            <div className="flex justify-end">
              <p className="text-sm text-gray-600 mb-2 mr-4"><strong>Upvotes:</strong> {post.upvotes || 0}</p>
              <p className="text-sm text-gray-600 mb-2"><strong>Downvotes:</strong> {post.downvotes || 0}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(posts.length / postsPerPage) }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={`px-4 py-2 mx-1 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Delete Post</h2>
            <textarea
              className="w-full p-2 mb-4 border rounded"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
            <div className="flex justify-end">
              <button className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Edit Post</h2>

            {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}

            <label className="block mb-2">
              Title:
              <input
                type="text"
                className="w-full p-2 mb-4 border rounded"
                value={editPost?.title || ''}
                onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
              />
            </label>

            <label className="block mb-2">
              Body:
              <textarea
                className="w-full p-2 mb-4 border rounded"
                value={editPost?.body || ''}
                onChange={(e) => setEditPost({ ...editPost, body: e.target.value })}
              />
            </label>

            <div className="flex justify-end">
              <button className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleEditSubmit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
