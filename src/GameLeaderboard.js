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
              score: 0
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
    <div className="container">
      <h1 className="title">Game Leaderboard</h1>
      {highestScorer && (
        <div className="highest-scorer">
          <h2>Highest Scorer: {highestScorer.displayName}</h2>
          <p>Score: {highestScorer.score}</p>
        </div>
      )}
      <div className="chart-container">
        <Bar data={chartData} options={chartOptions} />
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
