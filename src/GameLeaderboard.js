import React, { useEffect, useState } from 'react';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { firestore, database, storage } from './firebaseConfig';
import { ref as dbRef, get, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Crown from './images/crown.png';
import './GameLeaderboard.css';

const GameLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [showViewRewardsModal, setShowViewRewardsModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [rewardName, setRewardName] = useState('');
  const [rewardImage, setRewardImage] = useState(null);
  const [pointsRequired, setPointsRequired] = useState('');
  const [rewards, setRewards] = useState([]);
  const [rewardToDelete, setRewardToDelete] = useState(null);

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

        let rank = 1;
        leaderboard = leaderboard.map((user, index, arr) => {
          if (index > 0 && user.score === arr[index - 1].score) {
            return { ...user, rank: arr[index - 1].rank, tied: true };
          } else {
            const currentRank = rank;
            rank++;
            return { ...user, rank: currentRank, tied: false };
          }
        });

        setLeaderboardData(leaderboard);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData();
  }, []);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const rewardsRef = dbRef(database, 'rewards');
        const snapshot = await get(rewardsRef);

        if (snapshot.exists()) {
          const rewardsData = snapshot.val();
          const rewardsList = Object.keys(rewardsData).map((key) => ({
            id: key,
            ...rewardsData[key],
          }));

          setRewards(rewardsList);
        } else {
          setRewards([]);
        }
      } catch (error) {
        console.error('Error fetching rewards:', error);
      }
    };

    if (showViewRewardsModal) {
      fetchRewards();
    }
  }, [showViewRewardsModal]);

  const handleRewardImageChange = (event) => {
    setRewardImage(event.target.files[0]);
  };

  const handleRewardSubmit = async () => {
    if (!rewardName || !pointsRequired || !rewardImage) {
      alert('Please fill all fields and choose an image');
      return;
    }

    try {
      const imageRef = storageRef(storage, `rewards/${rewardImage.name}`);
      await uploadBytes(imageRef, rewardImage);
      const imageUrl = await getDownloadURL(imageRef);

      const newRewardRef = dbRef(database, `rewards/${rewardName}`);
      await set(newRewardRef, {
        rewardName,
        pointsRequired,
        imageUrl,
      });

      const newReward = { rewardName, pointsRequired, imageUrl, id: rewardName };
      setRewards([...rewards, newReward]);

      setRewardName('');
      setRewardImage(null);
      setPointsRequired('');
      setShowAddRewardModal(false);
    } catch (error) {
      console.error('Error adding reward:', error);
    }
  };

  const handleDeleteReward = (rewardId) => {
    setRewardToDelete(rewardId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteReward = async () => {
    if (!rewardToDelete) return;

    try {
      const rewardRef = dbRef(database, `rewards/${rewardToDelete}`);
      await set(rewardRef, null);

      setRewards(rewards.filter((reward) => reward.id !== rewardToDelete));
      setShowDeleteConfirmation(false);
      setRewardToDelete(null);
    } catch (error) {
      console.error('Error deleting reward:', error);
    }
  };

  const maxScore = leaderboardData.length > 0 ? Math.max(...leaderboardData.map((user) => user.score)) : 1;
  const top5Data = leaderboardData.slice(0, 5);
  const otherUsers = leaderboardData.slice(5);

  return (
    <div className="container mx-auto p-4">
      <h1 className="leaderboard-title mb-6">Game Leaderboard</h1>
      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <div className="leaderboard-layout">
          <div className="chart-and-other-container">
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

            <div className="other-users-container">
              <h2 className="text-2xl font-bold mb-4">Other Users</h2>
              <ul>
                {otherUsers.map((user, index) => (
                  <li key={user.displayName} className="flex items-center space-x-4 p-2 bg-gray-100 rounded-lg">
                    <img src={user.photoURL} alt={user.displayName} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="text-lg font-semibold">{user.displayName}</p>
                      <p className="text-gray-600">Score: {user.score}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="button-container">
            <button onClick={() => setShowAddRewardModal(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
              Add Reward
            </button>
            <button onClick={() => setShowViewRewardsModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-4 hover:bg-blue-600 transition">
              View Rewards
            </button>
          </div>
        </div>
      )}

      {/* Add Reward Modal */}
      {showAddRewardModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="modal-container">
            <button className="close-button" onClick={() => setShowAddRewardModal(false)}>
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
              <span className="file-name">{rewardImage ? rewardImage.name : 'No file chosen'}</span>
            </div>

            <input
              type="number"
              placeholder="Points Required"
              value={pointsRequired}
              onChange={(e) => setPointsRequired(e.target.value)}
              className="modal-input"
            />

            <div className="modal-buttons">
              <button onClick={handleRewardSubmit} className="modal-button submit-button">
                Submit
              </button>
              <button onClick={() => setShowAddRewardModal(false)} className="modal-button cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Rewards Modal */}
      {showViewRewardsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="modal-container">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={() => setShowViewRewardsModal(false)}>
              &times;
            </button>
           
            <div className="reward-list-container">
            <h2 className="reward-list-title">Rewards</h2>
              {rewards.length > 0 ? (
                <ul>
                  {rewards.map((reward) => (
                    <li key={reward.id} className="reward-item">
                      <img src={reward.imageUrl} alt={reward.rewardName} className="w-16 h-16 rounded-full object-cover mr-4" />
                      <div className="reward-details">
                        <p>{reward.rewardName}</p>
                        <p className="points-required">Points Required: {reward.pointsRequired}</p>
                      </div>
                      <button onClick={() => handleDeleteReward(reward.id)} className="delete-button">
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this reward? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                onClick={confirmDeleteReward}
              >
                Confirm
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLeaderboard;
