import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from './firebaseConfig'; // Import Firestore from firebaseConfig.js
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Import Chart.js
import './GameLeaderboard.css'; // Import the CSS file

const GameLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [highestScorer, setHighestScorer] = useState(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const leaderboard = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          displayName: doc.data().displayName,
          score: doc.data().score
        }));
        console.log('Fetched leaderboard data:', leaderboard); // Debug log
        setLeaderboardData(leaderboard);

        // Find the user with the highest score
        if (leaderboard.length > 0) {
          const highest = leaderboard.reduce((prev, current) => (prev.score > current.score) ? prev : current);
          console.log('Highest scorer:', highest); // Debug log
          setHighestScorer(highest);
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData();
  }, []);

  // Sort leaderboard data by score in descending order
  const sortedLeaderboardData = leaderboardData.sort((a, b) => b.score - a.score);
  console.log('Sorted leaderboard data:', sortedLeaderboardData); // Debug log

  // Prepare data for the bar chart
  const chartData = {
    labels: sortedLeaderboardData.map(user => user.displayName),
    datasets: [
      {
        label: 'Scores',
        data: sortedLeaderboardData.map(user => user.score),
        backgroundColor: sortedLeaderboardData.map(user => 
          user.id === (highestScorer && highestScorer.id) ? 'rgba(255, 99, 132, 0.8)' : 'rgba(75, 192, 192, 0.8)'
        ),
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
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
      <div className="button-container">
        <button className="view-rewards-button">View Rewards</button>
      </div>
    </div>
  );
};

export default GameLeaderboard;