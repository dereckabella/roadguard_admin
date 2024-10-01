import React, { useState, useEffect } from 'react';
import { ref, get, child, update } from 'firebase/database';
import { database } from './firebaseConfig'; // Replace with your Firebase configuration file
import './SubscriptionManagement.css'; // Optional: Add CSS for styling

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
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

  // Function to calculate the end date based on the subscription plan
  const calculateEndDate = (startDate, plan) => {
    const start = new Date(startDate);
    let end = new Date(start);

    if (plan === '1 month') {
      end.setMonth(start.getMonth() + 1);
    } else if (plan === '3 months') {
      end.setMonth(start.getMonth() + 3);
    } else if (plan === '6 months') {
      end.setMonth(start.getMonth() + 6);
    } else if (plan === '1 year') {
      end.setFullYear(start.getFullYear() + 1);
    }

    return end.toISOString(); // Return in ISO string format to store in Firebase
  };

  // Function to update the subscription status and set start and end dates
  const handleStatusUpdate = async (id, newStatus, plan) => {
    const startDate = new Date().toISOString(); // Current date as start date
    const endDate = calculateEndDate(startDate, plan); // Calculate end date based on plan

    try {
      await update(ref(database, `subscriptions/${id}`), {
        status: newStatus,
        startDate: startDate,
        endDate: endDate,
      });

      setSubscriptions((prevSubscriptions) =>
        prevSubscriptions.map((subscription) =>
          subscription.id === id
            ? { ...subscription, status: newStatus, startDate, endDate }
            : subscription
        )
      );
      console.log('Subscription status updated successfully');
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }
  };

  // Open the modal with the selected image
  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage('');
  };

  // Check if subscription is expired
  const checkIfExpired = (endDate) => {
    const currentDate = new Date();
    const expirationDate = new Date(endDate);
    return expirationDate < currentDate;
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
              <th>Name</th>
              <th>Email</th>
              <th>Mobile Number</th>
              <th>Subscription Plan</th>
              <th>Payment Method</th>
              <th>Proof Image</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <td>{subscription.name}</td>
                <td>{subscription.userEmail}</td>
                <td>{subscription.mobileNumber}</td>
                <td>{subscription.subscriptionPlan}</td>
                <td>{subscription.paymentMethod}</td>
                <td>
                  <button
                    onClick={() => openModal(subscription.proofImage)}
                    className="view-proof-button"
                  >
                    View Proof
                  </button>
                </td>
                <td>
                  {checkIfExpired(subscription.endDate) ? (
                    <span className="expired-status">Expired</span>
                  ) : (
                    subscription.status
                  )}
                </td>
                <td>{subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'N/A'}</td>
                <td>{subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}</td>
                <td>
                  {subscription.status === 'Awaiting Approval' ? (
                    <button
                      onClick={() => handleStatusUpdate(subscription.id, 'Approved', subscription.subscriptionPlan)}
                      className="approve-button"
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="approved-status">
                      {checkIfExpired(subscription.endDate) ? 'Expired' : 'Approved'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal Component */}
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