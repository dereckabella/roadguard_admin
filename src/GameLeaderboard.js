import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore, database } from './firebaseConfig';  // Ensure the correct database and firestore imports
import { ref as dbRef, get } from 'firebase/database';  // Import Realtime Database ref and get
import Crown from './images/crown.png';  // Correctly imported crown image

import './GameLeaderboard.css';

const GameLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setLoading(false); // Loading completed
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

  const handleRewardSubmit = () => {
    console.log('Reward submitted:', rewardName, pointsRequired, rewardImage);
    setShowAddRewardModal(false);
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

      {loading ? (
        <div className="loading-spinner"></div> // Loading spinner
      ) : (
        <>
          {/* Podium for top 5 */}
          <div className="flex justify-center chart-container">
            <div className="podium-container">
              {top5Data.map((user, index) => (
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
          </div>

          {/* Standings for other users */}
          {otherUsers.length > 0 && (
            <div className="other-users-container mt-8">
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
          )}
        </>
      )}

      <div className="button-container mt-8">
        <button
          onClick={() => setShowAddRewardModal(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Add Reward
        </button>
        <button
          onClick={() => setShowViewRewardsModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-4 hover:bg-blue-600 transition"
        >
          View Rewards
        </button>
      </div>

      {/* Add Reward Modal */}
      {showAddRewardModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="modal-container"> 
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowAddRewardModal(false)}
            >
              &times;
            </button>
            <h2 className="modal-title">Add Reward</h2> 

            <input
              type="text"
              placeholder="Reward Name"
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
              className="modal-input" 
            />

            <div className="file-input-container"> 
              <label className="file-input-label" htmlFor="file-upload"> 
                Choose File
              </label>
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                onChange={handleRewardImageChange}
                className="file-input" 
              />
              <span>{rewardImage ? rewardImage.name : "No file chosen"}</span>
            </div>

            <input
              type="number"
              placeholder="Points Required"
              value={pointsRequired}
              onChange={(e) => setPointsRequired(e.target.value)}
              className="modal-input" 
            />

            <div className="modal-buttons"> 
              <button
                onClick={handleRewardSubmit}
                className="modal-button submit-button" 
              >
                Submit
              </button>
              <button
                onClick={() => setShowAddRewardModal(false)}
                className="modal-button cancel-button" 
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Rewards Modal */}
      {showViewRewardsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full h-[80%] overflow-y-auto p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowViewRewardsModal(false)}
            >
              &times;
            </button>
            <h2 className="reward-list-title">Rewards</h2>
            <div className="reward-list-container">
              {rewards.length > 0 ? (
                <ul>
                  {rewards.map((reward) => (
                    <li key={reward.id} className="reward-item">
                      <img
                        src={reward.imageUrl}
                        alt={reward.rewardName}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div className="reward-details">
                        <p>{reward.rewardName}</p>
                        <p className="points-required">Points Required: {reward.pointsRequired}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
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
    </div>
  );
};

export default GameLeaderboard;
