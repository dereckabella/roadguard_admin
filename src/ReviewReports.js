import React from 'react';

const ReviewReports = () => {
  // Sample data array for demonstration
  const reports = [
    { id: 1, user: 'John Doe', type: 'Safety Hazard', date: '2023-09-30', status: 'Reviewed' },
    { id: 2, user: 'Jane Smith', type: 'Road Block', date: '2023-09-29', status: 'Pending' },
    { id: 3, user: 'Alice Johnson', type: 'Traffic Issue', date: '2023-09-28', status: 'Closed' },
    // Add more reports as needed
  ];

  return (
    <div className="review-reports">
      <h1>Reviews & Reports</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Type</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.user}</td>
              <td>{report.type}</td>
              <td>{report.date}</td>
              <td>{report.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewReports;