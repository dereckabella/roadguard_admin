import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore, database } from './firebaseConfig';  // Ensure the correct database and firestore imports
import { ref as dbRef, get, push, set, remove, update } from 'firebase/database';  // Import Realtime Database methods
import Crown from './images/crown.png';  // Correctly imported crown image
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig"; 
import './GameLeaderboard.css';
import { Player } from '@lottiefiles/react-lottie-player';
import loadingAnimation from './lottie/loading.json';
import { ToastContainer, toast } from 'react-toastify';  // Import toast
import 'react-toastify/dist/ReactToastify.css';
import {  Slide } from 'react-toastify';

const GameLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [showViewRewardsModal, setShowViewRewardsModal] = useState(false);
  const [rewardName, setRewardName] = useState('');
  const [rewardImage, setRewardImage] = useState(null);
  const [pointsRequired, setPointsRequired] = useState('');
  const [rewards, setRewards] = useState([]);
  const [editingReward, setEditingReward] = useState(null); // New state to track editing
  const [claims, setClaims] = useState([]); // State to hold claims
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null); // Selected claim for verification

  // Fetch claim rewards data
  useEffect(() => {
    const fetchClaimRewards = async () => {
      try {
        const claimsRef = dbRef(database, 'claim_reward');
        const snapshot = await get(claimsRef);

        if (snapshot.exists()) {
          const claimsData = Object.keys(snapshot.val()).map((key) => ({
            id: key,
            ...snapshot.val()[key],
          }));
          setClaims(claimsData);
        } else {
          setClaims([]);
        }
      } catch (error) {
        console.error('Error fetching claims:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaimRewards();
  }, []);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        const scoresMap = {};
        usersSnapshot.docs.forEach((doc) => {
          const userId = doc.id;
          const userDoc = doc.data();
          const scoresArray = userDoc.scores || [];

          let totalScore = 0;
          scoresArray.forEach((scoreEntry) => {
            totalScore += scoreEntry.score || 0;
          });

          scoresMap[userId] = {
            displayName: userDoc.displayName || 'Anonymous',
            score: totalScore,
            photoURL: userDoc.photoURL || 'default-image-url.jpg',
          };
        });

        let leaderboard = Object.values(scoresMap).sort((a, b) => b.score - a.score);

        // Logic to assign ranks while handling ties
        let rank = 1;
        leaderboard = leaderboard.map((user, index, arr) => {
          if (index > 0 && user.score === arr[index - 1].score) {
            return { ...user, rank: arr[index - 1].rank, tied: true }; // Same rank as previous user if tied
          } else {
            const currentRank = rank;
            rank++; // Increment rank for next user
            return { ...user, rank: currentRank, tied: false };
          }
        });

        setLeaderboardData(leaderboard); // Store full leaderboard data
        // Simulate a loading delay (2 seconds)
        setTimeout(() => {
          setLoading(false); // Stop loading once data is fetched
        }, 2000);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData();
  }, []);

  // Fetch rewards from Firebase Realtime Database
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const rewardsRef = dbRef(database, 'rewards');
        const snapshot = await get(rewardsRef);

        if (snapshot.exists()) {
          const rewardsData = snapshot.val();
          const rewardsList = Object.keys(rewardsData).map((key) => ({
            id: key, // Reward ID from the database
            ...rewardsData[key], // Reward data (name, image, pointsRequired)
          }));

          setRewards(rewardsList); // Store rewards in state
        } else {
          setRewards([]); // No rewards found
        }
      } catch (error) {
        console.error('Error fetching rewards:', error);
      }
    };

    // Fetch rewards only when the modal is open
    if (showViewRewardsModal) {
      fetchRewards();
    }
  }, [showViewRewardsModal]);  // Trigger fetch when modal opens

  const handleRewardImageChange = (event) => {
    setRewardImage(event.target.files[0]);
  };

  const handleVerifyClaim = async (claimId) => {
    try {
      const claimRef = dbRef(database, `claim_reward/${claimId}`);
      await update(claimRef, { status: 'verified' });

      setClaims((prevClaims) =>
        prevClaims.map((claim) =>
          claim.id === claimId ? { ...claim, status: 'verified' } : claim
        )
      );
      
      toast.success('Claim verified successfully!', {
        transition: Slide,
        position: "top-center"
      });
    } catch (error) {
      toast.error('Failed to verify claim. Please try again.', {
        transition: Slide,
        position: "top-center"
      });
    }
  };

  // Open Claim Modal
  const openClaimModal = () => {
    setShowClaimModal(true);
  };

  // Close Claim Modal
  const closeClaimModal = () => {
    setSelectedClaim(null);
    setShowClaimModal(false);
  };

  const handleRewardSubmit = async () => {
    if (!rewardName || (!rewardImage && !editingReward) || !pointsRequired) {
      toast.error("Please fill out all fields.", {
        transition: Slide,
        position: "top-center"
      });
      return;
    }
  
    try {
      let imageUrl = editingReward?.imageUrl;
  
      if (rewardImage) {
        const imageRef = storageRef(storage, `rewards/${rewardImage.name}`);
        await uploadBytes(imageRef, rewardImage);
        imageUrl = await getDownloadURL(imageRef);
      }
  
      const updatedReward = {
        rewardName,
        pointsRequired: Number(pointsRequired),
        imageUrl,
      };
  
      if (editingReward) {
        const rewardRef = dbRef(database, `rewards/${editingReward.id}`);
        await set(rewardRef, updatedReward);
        toast.success("Reward updated successfully!", {
          transition: Slide,
          position: "top-center"
        });
      } else {
        const rewardsRef = dbRef(database, "rewards");
        await push(rewardsRef, updatedReward);
        toast.success("Reward added successfully!", {
          transition: Slide,
          position: "top-center"
        });
      }
  
  
      // Step 3: Clear form fields and close the modal
      setRewardName("");
      setRewardImage(null);
      setPointsRequired("");
      setEditingReward(null);
      setShowAddRewardModal(false);
  
      // Refresh the rewards list
      setRewards((prevRewards) => {
        if (editingReward) {
          // Update the existing reward in the list
          return prevRewards.map((reward) =>
            reward.id === editingReward.id ? { id: reward.id, ...updatedReward } : reward
          );
        }
        // Add the new reward to the list
        return [...prevRewards, { id: new Date().getTime().toString(), ...updatedReward }];
      });
    } catch (error) {
      toast.error("An error occurred while saving the reward.", {
        transition: Slide,
        position: "top-center"
      });
    }
  };
  
  const handleDeleteReward = async (rewardId) => {
    try {
      const rewardRef = dbRef(database, `rewards/${rewardId}`);
      await remove(rewardRef);
  
      setRewards(rewards.filter((reward) => reward.id !== rewardId));
  
      toast.success("Reward successfully deleted!", {
        transition: Slide,
        position: "top-center"
      });
    } catch (error) {
      toast.error("An error occurred while deleting the reward.", {
        transition: Slide,
        position: "top-center"
      });
    }
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward); // Store the reward being edited
    setRewardName(reward.rewardName); // Prefill the reward name
    setRewardImage(null); // Reset the reward image input (image uploading is optional during edits)
    setPointsRequired(reward.pointsRequired.toString()); // Prefill points required
    setShowAddRewardModal(true); // Open the modal
  };
  
  const maxScore = leaderboardData.length > 0 ? Math.max(...leaderboardData.map(user => user.score)) : 1;

  // Separate top 5 and other users
  const top5Data = leaderboardData.slice(0, 5);
  const otherUsers = leaderboardData.slice(5);

  return (
    <div className="container mx-auto p-4">
             <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        transition={Slide}
      />

 
      <h1 className="leaderboard-title">Claim Rewards</h1>

      {/* Claim Reward Button */}
      <div className="text-center mb-6 space-x-4">
        <button
          className="claim-reward-btn bg-blue-500 text-white px-6 py-2 rounded shadow"
          onClick={openClaimModal}
        >
          Claim Reward
        </button>
        {/* View Rewards Button */}
        <button
          className="claim-reward-btn bg-blue-500 text-white px-6 py-2 rounded shadow"
          onClick={() => setShowViewRewardsModal(true)}
        >
          View Rewards
        </button>
        {/* Add Reward Button */}
        <button
          className="claim-reward-btn bg-blue-500 text-white px-6 py-2 rounded shadow"
          onClick={() => setShowAddRewardModal(true)}
        >
          Add Reward
        </button>
      </div>

    {/* Claim Modal */}
{showClaimModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Claim Rewards</h2>
          <button 
            onClick={closeClaimModal} 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Claims List */}
        <div className="space-y-4">
          {claims.length > 0 ? (
            claims.map((claim) => (
              <div 
                key={claim.id} 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{claim.fullName}</p>
                    <p className="text-sm text-gray-600">{claim.rewardName}</p>
                    <span 
                      className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                        claim.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedClaim(claim)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {claim.status === 'pending' && (
                      <button
                        onClick={() => handleVerifyClaim(claim.id)}
                        className="text-green-500 hover:text-green-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <p>No claims available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}

{/* Claim Details Modal */}
{selectedClaim && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Claim Details</h2>
          <button 
            onClick={() => setSelectedClaim(null)} 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Claim Details Content */}
        <div className="space-y-4">
          {selectedClaim.rewardImageUrl && (
            <img
              src={selectedClaim.rewardImageUrl}
              alt={selectedClaim.rewardName}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="font-semibold">{selectedClaim.fullName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-semibold">{selectedClaim.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Phone</p>
              <p className="font-semibold">{selectedClaim.phoneNumber}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Reward</p>
              <p className="font-semibold">{selectedClaim.rewardName}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-gray-600 text-sm">Address</p>
            <p className="font-semibold">{selectedClaim.address}</p>
          </div>

          <div className="mt-4">
            <p className="text-gray-600 text-sm">Status</p>
            <span 
              className={`inline-block px-3 py-1 rounded-full text-sm ${
                selectedClaim.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {selectedClaim.status}
            </span>
          </div>

          {selectedClaim.status === 'pending' && (
            <button
              onClick={() => handleVerifyClaim(selectedClaim.id)}
              className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Verify Claim
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
)}
      {/* Toast Notifications */}
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar closeOnClick pauseOnHover draggable />

      {/* View Rewards Modal */}
      {showViewRewardsModal && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full h-[80%] overflow-y-auto p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowViewRewardsModal(false)}
            >
              &times;
            </button>
            <h2 className="reward-list-title text-center">Rewards</h2>
            <div className="reward-list-container">
              {rewards.length > 0 ? (
                <ul>
                  {rewards.map((reward) => (
                    <li key={reward.id} className="reward-item">
                      <img
                        src={reward.imageUrl}
                        alt={reward.rewardName}
                        className="object-cover"
                      />
                      <div className="reward-details">
                        <p>{reward.rewardName}</p>
                        <p className="points-required">Points Required: {reward.pointsRequired}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this reward?")) {
                            handleDeleteReward(reward.id);
                          }
                        }}
                        className="delete-button"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleEditReward(reward)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No rewards available yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Player
            autoplay
            loop
            src={loadingAnimation}
            style={{ height: '150px', width: '150px' }}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start gap-8 chart-container">
        {/* Podium Container */}
          <div className="podium-container flex-1 bg-white rounded-lg shadow-lg p-4">
            {top5Data.slice(0, 3).map((user, index) => (
              <div
                key={index}
                className={`podium-item podium-rank-${user.rank} ${user.tied ? 'podium-tied' : ''}`}
                style={{ height: (user.score / maxScore) * 300 }}
              >
                {user.tied && <span className="tied-badge">Tied</span>}
                <img src={user.photoURL} alt={user.displayName} className="podium-image" />
                {user.rank === 1 && <img src={Crown} alt="Crown" className="crown" />}
                <p className="username">{user.displayName}</p>
                <p className="score">{user.score}</p>
              </div>
            ))}
          </div>

          {/* Other Users Container */}
          <div className="other-users-container flex-1 bg-white rounded-lg shadow-lg p-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
            <h2 className="text-2xl font-bold mb-4">Other Users</h2>
            <ul className="space-y-2">
              {otherUsers.map((user, index) => (
                <li key={user.displayName} className="flex items-center space-x-4 p-2 bg-gray-100 rounded-lg">
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-lg font-semibold">{user.displayName}</p>
                    <p className="text-gray-600">Score: {user.score}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
                </>
              )}

      {/* Updated Modal Component with Enhanced Design */}
      {showAddRewardModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
          <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md mx-auto transform transition-transform duration-300 ease-in-out scale-100 hover:scale-105">
            <div className="relative p-8">
              {/* Elegant Close Button */}
              <button
                onClick={() => {
                  setShowAddRewardModal(false);
                  setEditingReward(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Title with Gradient */}
              <h2 className="text-2xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500">
                {editingReward ? 'Edit Reward' : 'Add New Reward'}
              </h2>

              {/* Input Containers with Enhanced Styling */}
              <div className="space-y-5">
                {/* Reward Name Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Reward Name"
                    value={rewardName}
                    onChange={(e) => setRewardName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300
                               placeholder-gray-400 text-sm"
                  />
                  <span className="absolute left-4 -top-2.5 bg-gray-50 px-1 text-xs text-gray-500">Reward Name</span>
                </div>

                {/* Image Upload with Preview */}
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition duration-300">
                  <input
                    type="file"
                    id="reward-image"
                    accept="image/*"
                    onChange={handleRewardImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    {rewardImage ? (
                      <img 
                        src={URL.createObjectURL(rewardImage)} 
                        alt="Preview" 
                        className="max-h-32 rounded-lg mb-2 shadow-md"
                      />
                    ) : (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-12 w-12 text-gray-400 mb-2" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    <p className="text-sm text-gray-500">
                      {rewardImage ? rewardImage.name : 'Click to upload image'}
                    </p>
                  </div>
                </div>

                {/* Points Required Input */}
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Points Required"
                    value={pointsRequired}
                    onChange={(e) => setPointsRequired(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300
                               placeholder-gray-400 text-sm"
                  />
                  <span className="absolute left-4 -top-2.5 bg-gray-50 px-1 text-xs text-gray-500">Points Threshold</span>
                </div>
              </div>

              {/* Action Buttons with Modern Design */}
              <div className="flex justify-between mt-6 space-x-4">
                <button
                  onClick={() => {
                    setShowAddRewardModal(false);
                    setEditingReward(null);
                  }}
                  className="flex-1 py-3 text-gray-700 border border-gray-300 rounded-lg 
                             hover:bg-gray-100 transition duration-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRewardSubmit}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white 
                             rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all 
                             duration-300 font-semibold shadow-md"
                >
                  {editingReward ? 'Update Reward' : 'Create Reward'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLeaderboard;
