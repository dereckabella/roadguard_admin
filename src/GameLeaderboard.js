import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore, database } from './firebaseConfig';  // Ensure the correct database and firestore imports
import { ref as dbRef, get } from 'firebase/database';  // Import Realtime Database ref and get
import Crown from './images/crown.png';  // Correctly imported crown image
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig"; 
import { push } from "firebase/database";
import './GameLeaderboard.css';
import { Player } from '@lottiefiles/react-lottie-player';
import loadingAnimation from './lottie/loading.json';

const GameLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [showViewRewardsModal, setShowViewRewardsModal] = useState(false);
  const [rewardName, setRewardName] = useState('');
  const [rewardImage, setRewardImage] = useState(null);
  const [pointsRequired, setPointsRequired] = useState('');
  const [rewards, setRewards] = useState([]);

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
         // Simulate a loading delay (5 seconds)
         setTimeout(() => {
          setLoading(false); // Stop loading once data is fetched
      }, 2000); // 5-second delay
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

  const handleRewardSubmit = async () => {
    if (!rewardName || !rewardImage || !pointsRequired) {
      alert("Please fill out all fields.");
      return;
    }
  
    try {
      // Step 1: Upload the image to Firebase Storage
      const imageRef = storageRef(storage, `rewards/${rewardImage.name}`);
      await uploadBytes(imageRef, rewardImage);
      const imageUrl = await getDownloadURL(imageRef);
  
      // Step 2: Save reward data to Firebase Realtime Database
      const rewardsRef = dbRef(database, "rewards");
      const newReward = {
        rewardName,
        pointsRequired: Number(pointsRequired), // Ensure points are stored as a number
        imageUrl,
      };
      await push(rewardsRef, newReward);
  
      // Step 3: Clear form fields and close the modal
      setRewardName("");
      setRewardImage(null);
      setPointsRequired("");
      setShowAddRewardModal(false);
  
      alert("Reward added successfully!");
    } catch (error) {
      console.error("Error adding reward:", error);
      alert("An error occurred while adding the reward. Please try again.");
    }
  };

  // Handle reward deletion
  const handleDeleteReward = (rewardId) => {
    console.log('Delete reward with ID:', rewardId);
    setRewards(rewards.filter((reward) => reward.id !== rewardId));
  };

  const maxScore = leaderboardData.length > 0 ? Math.max(...leaderboardData.map(user => user.score)) : 1;

  // Separate top 5 and other users
  const top5Data = leaderboardData.slice(0, 5);
  const otherUsers = leaderboardData.slice(5);



  return (
    <div className="container mx-auto p-4">
      <h1 className="leaderboard-title mb-6">
        Game Leaderboard
      </h1>

      <div className="button-container mt-8">
        <button
          onClick={() => setShowAddRewardModal(true)}
          className=""
        >
          Add Reward
        </button>
        <button
          onClick={() => setShowViewRewardsModal(true)}
          className=""
        >
          View Rewards
        </button>
      </div>
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
            <br></br><br></br>
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
                            alert("Reward successfully deleted!"); // Confirmation message
                          }
                        }}
                        className="delete-button"
                      >
                        Delete
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

      

      {showAddRewardModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
    <div className="bg-white rounded-lg shadow-lg w-11/12 sm:w-[400px] md:w-[500px] p-6 relative">
      {/* Close Button */}
      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring focus:ring-gray-300"
        onClick={() => setShowAddRewardModal(false)}
        aria-label="Close"
      >
        &times;
      </button>

      {/* Modal Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Reward</h2>

      {/* Reward Name Input */}
      <input
        type="text"
        placeholder="Reward Name"
        value={rewardName}
        onChange={(e) => setRewardName(e.target.value)}
        className="w-full px-4 py-2 mb-4 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* File Input */}
      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <span>{rewardImage ? rewardImage.name : "Choose an image"}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16l-4-4m0 0l4-4m-4 4h18"
            />
          </svg>
        </label>
        <input
          type="file"
          id="file-upload"
          accept="image/*"
          onChange={handleRewardImageChange}
          className="hidden"
        />
      </div>

      {/* Points Required Input */}
      <input
        type="number"
        placeholder="Points Required"
        value={pointsRequired}
        onChange={(e) => setPointsRequired(e.target.value)}
        className="w-200 px-4 py-2 mb-4 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={() => setShowAddRewardModal(false)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleRewardSubmit}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}



    </div>
  );
};

export default GameLeaderboard;
