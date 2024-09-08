import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firestore, storage, database } from './firebaseConfig'; // Import Firestore and Storage from firebaseConfig.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, set } from 'firebase/database';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Import Chart.js
import './GameLeaderboard.css'; // Import the CSS file

const GameLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [highestScorer, setHighestScorer] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]); // State for other users
  const [rewardName, setRewardName] = useState('');
  const [rewardImage, setRewardImage] = useState(null);
  const [userIdForReward, setUserIdForReward] = useState('');

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

        // Set other users data
        const otherUsersData = sortedLeaderboard.slice(3);
        setOtherUsers(otherUsersData);

      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData();
  }, []);

  const handleRewardImageChange = (event) => {
    setRewardImage(event.target.files[0]);
  };

  const handleRewardSubmit = async () => {
    if (!rewardImage || !rewardName || !userIdForReward) {
      alert('Please fill out all fields and upload an image.');
      return;
    }

    try {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `rewards/${rewardImage.name}`);
      await uploadBytes(imageRef, rewardImage);
      const imageUrl = await getDownloadURL(imageRef);

      // Save reward details to Realtime Database
      const rewardRef = dbRef(database, `rewards/${userIdForReward}`);
      await set(rewardRef, {
        name: rewardName,
        imageUrl: imageUrl
      });

      alert('Reward added successfully!');
    } catch (error) {
      console.error('Error adding reward:', error);
      alert('Failed to add reward.');
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
      <div className="flex flex-wrap lg:flex-nowrap">
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="other-users">
          <h2 className="text-2xl font-semibold mb-4">Other Users</h2>
          <ul className="space-y-4">
            {otherUsers.map((user, index) => (
              <li
                key={index}
                className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between"
              >
                <img src={user.photoURL} alt={user.displayName} className="user-image" />
                <span className="text-lg font-medium">{user.displayName}</span>
                <span className="text-lg font-semibold text-gray-700">{user.score}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="reward-form">
        <h2>Add Reward</h2>
        <input
          type="text"
          placeholder="Reward Name"
          value={rewardName}
          onChange={(e) => setRewardName(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleRewardImageChange}
        />
        <input
          type="text"
          placeholder="User ID (for reward)"
          value={userIdForReward}
          onChange={(e) => setUserIdForReward(e.target.value)}
        />
        <button onClick={handleRewardSubmit}>Add Reward</button>
      </div>
    </div>
  );
};

export default GameLeaderboard;
