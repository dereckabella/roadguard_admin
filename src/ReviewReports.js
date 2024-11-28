import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from './firebaseConfig'; // Import the initialized database from firebase.js
import './ReviewReports.css'; // Optional: Add CSS for styling
import { Player } from '@lottiefiles/react-lottie-player';
import loadingAnimation from './lottie/loading.json';
import { jsPDF } from 'jspdf'; // Import jsPDF
import 'jspdf-autotable'; // Import jsPDF autoTable plugin

const ReviewReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // Reference to the reports collection in Realtime Database
    const reportsRef = ref(database, 'reports');

    // Listen for real-time updates from Firebase
    onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      const reportsArray = [];

      if (data) {
        Object.keys(data).forEach((key) => {
          reportsArray.push({
            id: key,
            userEmail: data[key].userEmail,
            issueDescription: data[key].issueDescription,
            timestamp: data[key].timestamp,
          });
        });
      }

      setReports(reportsArray);
      setTimeout(() => {
        setLoading(false); // Stop loading once data is fetched
      }, 2000); // 2-second delay
    });
  }, []);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const headers = ['ID', 'User Email', 'Issue Description', 'Date'];
    const rows = reports.map((report) => [
      report.id,
      report.userEmail,
      report.issueDescription,
      new Date(report.timestamp).toLocaleDateString(),
    ]);

    doc.setFontSize(18);
    doc.text('Review Reports', 14, 20);
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 30,
    });

    doc.save('Reports.pdf');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Player
          autoplay
          loop
          src={loadingAnimation}
          style={{ height: '150px', width: '150px' }}
        />
      </div>
    );
  }

  return (
    <div className="review-reports">
      <div className="export-buttons">
        <button onClick={exportToPDF} className="export-button">
          Export to PDF
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User Email</th>
            <th>Issue Description</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.userEmail}</td>
              <td>{report.issueDescription}</td>
              <td>{new Date(report.timestamp).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewReports;
