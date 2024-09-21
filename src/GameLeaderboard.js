import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore'; // Use Firestore for dynamic data fetching
import { firestore } from './firebaseConfig'; // Adjust the path to your Firebase config
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './GameLeaderboard.css'; // Ensure this file is used for custom CSS if needed

const GameLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [highestScorer, setHighestScorer] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]);

  useEffect(() => {
    // Fetch leaderboard data dynamically from Firebase
    const fetchLeaderboardData = async () => {
      try {
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        const scoresMap = {};

        // Process user documents and accumulate scores
        usersSnapshot.forEach((doc) => {
          const userId = doc.id;
          const userData = doc.data();
          const scoresArray = userData.scores || [];

          let totalScore = 0;
          scoresArray.forEach((scoreEntry) => {
            totalScore += scoreEntry.score || 0;
          });

          if (!scoresMap[userId]) {
            scoresMap[userId] = {
              displayName: userData.displayName || 'Anonymous',
              score: totalScore,
              photoURL: userData.photoURL || 'default-image-url.jpg', // Default image if none provided
            };
          }
        });

        // Convert scoresMap to an array and sort by score in descending order
        const sortedLeaderboard = Object.values(scoresMap).sort((a, b) => b.score - a.score);

        // Set leaderboard and highest scorer
        setLeaderboardData(sortedLeaderboard.slice(0, 3));  // Top 3 users
        setOtherUsers(sortedLeaderboard.slice(3));  // Other users
        if (sortedLeaderboard.length > 0) {
          setHighestScorer(sortedLeaderboard[0]);  // Highest scorer
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData();
  }, []);

  const colors = ['#B6B6B6', '#E0C55B', '#A56020'];

  // Podium data in order: 2nd, 1st, 3rd (safely handle undefined)
  const podiumData = [
    leaderboardData[1] || { displayName: '', score: 0 },  // 2nd place or empty
    leaderboardData[0] || { displayName: '', score: 0 },  // 1st place or empty
    leaderboardData[2] || { displayName: '', score: 0 },  // 3rd place or empty
  ];

  const chartData = {
    labels: podiumData.map((user) => user.displayName),
    datasets: [
      {
        label: 'Scores',
        data: podiumData.map((user) => user.score),
        backgroundColor: podiumData.map((_, index) => colors[index] || 'rgba(75, 192, 192, 0.8)'),
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
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: true,
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 400, // Set max value for Y-axis based on your requirements
        ticks: {
          stepSize: 100, // Control steps to match the scale
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
          return index === 1 ? 40 : 30; // Thicker bar for 1st place
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
        {/* Bar chart with fixed height */}
        <div className="flex-1 bg-white shadow-md rounded-lg p-4" style={{ height: '600px' }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
        {/* Other users list with the same fixed height and scrollable overflow */}
        <div className="flex-1 bg-white shadow-md rounded-lg p-4" style={{ height: '600px', overflowY: 'auto' }}>
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
    </div>
  );
};

export default GameLeaderboard;
