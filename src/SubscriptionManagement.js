import React, { useState, useEffect } from 'react';
import { ref, get, child } from 'firebase/database';
import { database } from './firebaseConfig'; // Your Firebase configuration file
import './SubscriptionManagement.css'; // Optional: Add CSS for styling

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [selectedImage, setSelectedImage] = useState(''); // State to store the selected image URL

  // Fetch subscriptions from Firebase
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, 'subscriptions'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const formattedData = Object.entries(data).map(([key, value]) => ({
            id: key, // Store the subscription ID for updating purposes
            ...value,
          }));
          setSubscriptions(formattedData);
        } else {
          console.log('No data available');
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
      setLoading(false);
    };

    fetchSubscriptions();
  }, []);

  // Function to check if the subscription is expired
  const checkIfExpired = (endDate) => {
    const currentDate = new Date();
    const expirationDate = new Date(endDate);
    return expirationDate < currentDate;
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage('');
  };

  return (
    <div className="subscription-management">
      <h1>Subscription Management</h1>
      {loading ? (
        <p>Loading subscriptions...</p>
      ) : (
        <table className="subscription-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Amount</th>
              <th>Duration</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <td>{subscription.email}</td>
                <td>{subscription.amount}</td>
                <td>{subscription.duration}</td>
                <td>{subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'N/A'}</td>
                <td>{subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}</td>
                <td>
                  {subscription.active ? (
                    checkIfExpired(subscription.endDate) ? (
                      <span className="expired-status">Expired</span>
                    ) : (
                      <span className="approved-status">Active</span>
                    )
                  ) : (
                    <span className="expired-status">Inactive</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Component for viewing proof image */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={closeModal}>
              &times;
            </span>
            <img src={selectedImage} alt="Proof" className="modal-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
