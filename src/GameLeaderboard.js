import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { firestore, storage, database } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, set, get } from 'firebase/database';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './GameLeaderboard.css'; // Ensure this file is used for custom CSS if needed

const GameLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [highestScorer, setHighestScorer] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]);
  const [rewardName, setRewardName] = useState('');
  const [rewardImage, setRewardImage] = useState(null);
  const [pointsRequired, setPointsRequired] = useState('');
  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [showViewRewardsModal, setShowViewRewardsModal] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [editingReward, setEditingReward] = useState(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        const scoresMap = {};
        
        for (const doc of usersSnapshot.docs) {
          const userId = doc.id;
          const userDoc = doc.data();
          const scoresArray = userDoc.scores || []; 

          let totalScore = 0;
          scoresArray.forEach(scoreEntry => {
            totalScore += scoreEntry.score || 0;
          });

          if (!scoresMap[userId]) {
            scoresMap[userId] = {
              displayName: userDoc.displayName || 'Anonymous',
              score: 0,
              photoURL: userDoc.photoURL || 'default-image-url.jpg' // Default image if none provided
            };
          }

          scoresMap[userId].score = totalScore;
        }

        const leaderboard = Object.values(scoresMap);
        const sortedLeaderboard = leaderboard.sort((a, b) => b.score - a.score);
        const top3Leaderboard = sortedLeaderboard.slice(0, 3);

        setLeaderboardData(top3Leaderboard);

        if (top3Leaderboard.length > 0) {
          const highest = top3Leaderboard[0];
          setHighestScorer(highest);
        }

        const otherUsersData = sortedLeaderboard.slice(3);
        setOtherUsers(otherUsersData);

      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData();
  }, []);

  useEffect(() => {
  const fetchRewards = async () => {
    try {
      // Get rewards data from Realtime Database
      const rewardsRef = dbRef(database, 'rewards');
      const snapshot = await get(rewardsRef);
      
      if (snapshot.exists()) {
        const rewardsData = snapshot.val();
        
        // Convert the object returned by Realtime Database into an array of rewards
        const rewardsList = Object.keys(rewardsData).map((key) => ({
          id: key, // The reward ID from Realtime Database
          ...rewardsData[key], // Spread the reward properties (rewardName, imageUrl, pointsRequired)
        }));
        
        setRewards(rewardsList); // Update state with rewards
      } else {
        console.log('No rewards found');
        setRewards([]); // If no rewards exist, set an empty array
      }
    } catch (error) {
      console.error('Error fetching rewards from Realtime Database:', error);
    }
  };

  if (showViewRewardsModal) {
    fetchRewards();
  }
}, [showViewRewardsModal]);

  const handleRewardImageChange = (event) => {
    setRewardImage(event.target.files[0]);
  };

  const handleEditReward = (reward) => {
  setRewardName(reward.rewardName);
  setPointsRequired(reward.pointsRequired);
  setEditingReward(reward); // Store the current reward being edited
  setShowAddRewardModal(true); // Reuse the existing modal for editing
};

  const handleRewardSubmit = async () => {
    if (!rewardImage || !rewardName || !pointsRequired) {
      alert('Please fill out all fields and upload an image.');
      return;
    }

    try {
      console.log('Uploading image to Firebase Storage...');

      // Upload image to Firebase Storage
      const imageRef = ref(storage, `rewards/${rewardImage.name}`);
      await uploadBytes(imageRef, rewardImage); // Pass the file to uploadBytes
      console.log('Image uploaded successfully.');

      const imageUrl = await getDownloadURL(imageRef);
      console.log('Image URL:', imageUrl);

      // Get current reward counter
      const counterRef = dbRef(database, 'rewardCounter');
      const counterSnapshot = await get(counterRef);
      const currentCounter = counterSnapshot.exists() ? counterSnapshot.val() : 0;

      // Generate a new reward ID
      const newCounter = currentCounter + 1;
      const rewardId = `rewardid${newCounter}`;
      
      // Update the reward counter in the database
      await set(counterRef, newCounter); // Use set to update the counter

      // Save reward details to the Realtime Database
      const newRewardRef = dbRef(database, `rewards/${rewardId}`);
      await set(newRewardRef, {
        rewardName: rewardName,
        imageUrl: imageUrl,
        pointsRequired: parseInt(pointsRequired),
      });

      console.log('Reward added successfully.');
      alert('Reward added successfully!');
      setShowAddRewardModal(false); // Close modal after successful submission
    } catch (error) {
      console.error('Error adding reward:', error.message);
      console.error('Stack Trace:', error.stack);

      // Display more detailed error information to the user
      alert(`Failed to add reward. Error: ${error.message}`);
    }
  };

  const handleDeleteReward = async (rewardId) => {
  try {
    // Delete the reward from the Realtime Database
    const rewardRef = dbRef(database, `rewards/${rewardId}`);
    await set(rewardRef, null); // Setting to null will delete the entry
    alert('Reward deleted successfully!');
    
    // Update the rewards list in the state after deletion
    setRewards(rewards.filter(reward => reward.id !== rewardId));
  } catch (error) {
    console.error('Error deleting reward:', error);
  }
};

  const colors = ['#B6B6B6', '#E0C55B', '#A56020'];

  const podiumData = [leaderboardData[1], leaderboardData[0], leaderboardData[2]];

  const chartData = {
    labels: podiumData.map((user, index) => user ? user.displayName : ''),
    datasets: [
      {
        label: 'Scores',
        data: podiumData.map((user, index) => user ? user.score : 0),
        backgroundColor: podiumData.map((user, index) => colors[index] || 'rgba(75, 192, 192, 0.8)'),
      },
    ],
  };

  // Custom plugin to draw images on top of bars
  const drawImagesOnTop = {
    id: 'drawImagesOnTop',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea: { top }, scales: { x, y } } = chart;
      podiumData.forEach((user, index) => {
        if (user && user.photoURL) {
          const img = new Image();
          img.src = user.photoURL;
          img.onload = () => {
            const xPos = x.getPixelForValue(index);
            const yPos = y.getPixelForValue(user.score);
            ctx.drawImage(img, xPos - 15, yPos - 40, 30, 30); // Adjust the image size and position
          };
        }
      });
    }
  };

  const chartOptions = {
    indexAxis: 'x',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: true,
          maxRotation: 0,
          minRotation: 0,
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
      drawImagesOnTop, // Add the custom plugin
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      },
    },
    elements: {
      bar: {
        borderRadius: 10,
        borderWidth: 1,
        barThickness: (context) => {
          const index = context.dataIndex;
          return index === 1 ? 40 : 30;
        },
      },
    },
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Game Leaderboard</h1>
      {highestScorer && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-2xl font-semibold">Highest Scorer: {highestScorer.displayName}</h2>
          <p className="text-lg">Score: {highestScorer.score}</p>
        </div>
      )}
      <div className="flex flex-wrap lg:flex-nowrap gap-4">
        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4">Other Users</h2>
          <ul className="space-y-4">
            {otherUsers.map((user, index) => (
              <li
                key={index}
                className="bg-gray-100 p-4 rounded-lg flex items-center shadow-sm"
              >
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-12 h-12 rounded-full object-cover mr-4"
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
      <button
        onClick={() => setShowAddRewardModal(true)}
        className="bg-green-500 text-white px-4 py-2 rounded-lg mt-6 hover:bg-green-600 transition"
      >
        Add Reward
      </button>
      <button
        onClick={() => setShowViewRewardsModal(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-6 ml-4 hover:bg-blue-600 transition"
      >
        View Rewards
      </button>
      {showAddRewardModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowAddRewardModal(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Add Reward</h2>
            <input
              type="text"
              placeholder="Reward Name"
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleRewardImageChange}
              className="mb-4 w-full text-gray-700"
            />
            <input
              type="number"
              placeholder="Points Required"
              value={pointsRequired}
              onChange={(e) => setPointsRequired(e.target.value)}
              className="border border-gray-300 rounded-lg p-3 mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={handleRewardSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Submit
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setShowAddRewardModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showViewRewardsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full h-[80%] overflow-y-auto p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowViewRewardsModal(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Rewards</h2>
            <ul className="space-y-4">
              {rewards.map((reward) => (
                <li key={reward.id} className="flex items-center bg-gray-100 p-4 rounded-lg shadow-sm">
                  <img
                    src={reward.imageUrl}
                    alt={reward.rewardName}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div className="flex-1">
                    <p className="text-lg font-semibold">{reward.rewardName}</p>
                    <p className="text-gray-600">Points Required: {reward.pointsRequired}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteReward(reward.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLeaderboard;
