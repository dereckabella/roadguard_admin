import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from './firebaseConfig'; // Import Firestore from firebaseConfig.js
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Import Chart.js
import './GameLeaderboard.css'; // Import the CSS file

const GameLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [highestScorer, setHighestScorer] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]); // State for other users

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // Reference to 'users' collection in Firestore
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        console.log('Users snapshot:', usersSnapshot);

        // Aggregate scores by user
        const scoresMap = {};
        
        for (const doc of usersSnapshot.docs) {
          const userId = doc.id;
          const userDoc = doc.data();
          const scoresArray = userDoc.scores || []; // Get scores array, default to empty array

          let totalScore = 0;
          // Aggregate scores from the scores array
          scoresArray.forEach(scoreEntry => {
            totalScore += scoreEntry.score || 0;
          });

          // Initialize user if not already in the map
          if (!scoresMap[userId]) {
            scoresMap[userId] = {
              displayName: userDoc.displayName || 'Anonymous',
              score: 0,
              photoURL: userDoc.photoURL || 'default-image-url.jpg' // Default image if none provided
            };
          }

          // Set total score for the user
          scoresMap[userId].score = totalScore;
        }

        // Log the aggregated scores
        console.log('Aggregated scores per user:', scoresMap);

        // Convert map to array
        const leaderboard = Object.values(scoresMap);

        // Log the leaderboard data
        console.log('Leaderboard data before sorting:', leaderboard);

        // Sort leaderboard data by score in descending order
        const sortedLeaderboard = leaderboard.sort((a, b) => b.score - a.score);

        // Limit to top 3
        const top3Leaderboard = sortedLeaderboard.slice(0, 3);

        // Log the top 3 leaderboard data
        console.log('Top 3 leaderboard data:', top3Leaderboard);

        // Set top 3 data
        setLeaderboardData(top3Leaderboard);

        // Find the user with the highest score
        if (top3Leaderboard.length > 0) {
          const highest = top3Leaderboard[0]; // Highest scorer is now the first in the sorted array
          console.log('Highest scorer:', highest); // Log highest scorer
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

  // Define colors
  const colors = ['#B6B6B6', '#E0C55B', '#A56020'];

  const podiumData = [leaderboardData[1], leaderboardData[0], leaderboardData[2]];

  // Prepare data for the bar chart
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

  // Update chart options to adjust the bar thickness and positioning
  const chartOptions = {
    indexAxis: 'x', // Vertical bars
    responsive: true,
    maintainAspectRatio: false, // Ensure the chart respects the set dimensions
    scales: {
      x: {
        grid: {
          display: false, // Remove the gridlines for the x-axis
        },
        ticks: {
          display: true, // Display x-axis labels
          maxRotation: 0, // Prevent label rotation
          minRotation: 0,
          font: {
            size: 12, // Smaller font size for labels
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10, // Customize based on score range
          font: {
            size: 12, // Smaller font size for labels
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Disable the legend
      },
      tooltip: {
        enabled: true, // Show tooltips for each bar
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
        borderRadius: 10, // Rounded edges for bars
        borderWidth: 1,
        barThickness: (context) => {
          const index = context.dataIndex;
          return index === 1 ? 40 : 30; // Adjusted thickness for smaller bars
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
      <div className="button-container mt-8">
        <button className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300">
          View Rewards
        </button>
      </div>
    </div>
  );
};

export default GameLeaderboard;