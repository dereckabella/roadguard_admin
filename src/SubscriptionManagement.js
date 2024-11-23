import React, { useState, useEffect } from 'react';
import { ref, get, child, update, set, push } from 'firebase/database';
import { database } from './firebaseConfig'; // Your Firebase configuration file
import './SubscriptionManagement.css'; // Optional: Add CSS for styling

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);  // Initialize subscriptions as an empty array
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Add state for modal visibility
  const [selectedInvoice, setSelectedInvoice] = useState(null); // Add state for selected invoice details
  const [activating, setActivating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
  const [plans, setPlans] = useState([]); // State for subscription plans
  const [newPlan, setNewPlan] = useState({ name: '', price: '', duration: '' }); // State for new plan

  // Fetch subscriptions from Firebase
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, 'subscriptions'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const formattedData = Object.entries(data).map(([key, value]) => ({
            id: key,
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

  // Function to activate subscription
  const activateSubscription = async (subscriptionId) => {
    try {
      const dbRef = ref(database, `subscriptions/${subscriptionId}`);
      await update(dbRef, { active: true }); // Set subscription as active
      const subscription = subscriptions.find((sub) => sub.id === subscriptionId);
      const invoice = generateInvoice(subscription);
      console.log('Generated Invoice:', invoice); // You can log it or save it to your database
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === subscriptionId ? { ...sub, active: true } : sub
        )
      );
      alert('Subscription activated and invoice generated!');
    } catch (error) {
      console.error('Error activating subscription:', error);
      alert('Failed to activate subscription. Please try again.');
    }
  };
  
  // Function to deactivate subscription
  const deactivateSubscription = async (subscriptionId) => {
    try {
      const dbRef = ref(database, `subscriptions/${subscriptionId}`);
      await update(dbRef, { active: false });
      alert('Subscription deactivated successfully!');
      setSubscriptions((prev) =>
        prev.map((subscription) =>
          subscription.id === subscriptionId ? { ...subscription, active: false } : subscription
        )
      );
    } catch (error) {
      console.error('Error deactivating subscription:', error);
      alert('Failed to deactivate subscription. Please try again.');
    }
  };

  // Function to fix active status for expired subscriptions
  const fixActiveStatus = async () => {
    const dbRef = ref(database, 'subscriptions');
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.entries(data).forEach(([id, subscription]) => {
        if (subscription.active && checkIfExpired(subscription.endDate)) {
          update(ref(database, `subscriptions/${id}`), { active: false });
        }
      });
    }
  };

  useEffect(() => {
    fixActiveStatus(); // Only run once on component mount
  }, []);

  const createSubscription = async (subscriptionData) => {
    const newSubscription = {
      ...subscriptionData,
      active: false, // Ensure the subscription is inactive by default
    };
  
    const newRef = ref(database, 'subscriptions');
    const newSubscriptionRef = push(newRef);
    await set(newSubscriptionRef, newSubscription); // Set the new subscription data
  };

  const generateInvoice = (subscription) => {
    const invoice = {
      email: subscription.email,
      plan: subscription.plan,
      amount: subscription.amount,
      startDate: new Date(subscription.startDate).toLocaleDateString(),
      endDate: new Date(subscription.endDate).toLocaleDateString(),
      invoiceDate: new Date().toLocaleDateString(), // Date of invoice generation
      invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`, // Generate a unique invoice number
    };
  
    return invoice;
  };

  const viewInvoice = (subscriptionId) => {
    const subscription = subscriptions.find((sub) => sub.id === subscriptionId);
    if (subscription) {
      const invoice = generateInvoice(subscription);
      setSelectedInvoice(invoice); // Set the invoice to be shown in the modal or new page
      setIsModalOpen(true); // Show the modal with invoice details
    }
  };

  const fetchPlans = async () => {
    try {
      const dbRef = ref(database, 'plans'); // Assuming "plans" node in Firebase
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedPlans = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setPlans(formattedPlans);
      } else {
        console.log('No plans available');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  // Add a new subscription plan
  const addNewPlan = async () => {
    try {
      const newPlanRef = push(ref(database, 'plans'));
      await set(newPlanRef, newPlan);
      setPlans([...plans, { id: newPlanRef.key, ...newPlan }]); // Update local state
      setNewPlan({ name: '', price: '', duration: '' }); // Reset form
      alert('Plan added successfully!');
    } catch (error) {
      console.error('Error adding plan:', error);
      alert('Failed to add plan. Please try again.');
    }

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
            {subscriptions.map((subscription) => {
              const isExpired = checkIfExpired(subscription.endDate); // Check if expired
              return (
                <tr key={subscription.id}>
                  <td>{subscription.email}</td>
                  <td>{subscription.amount}</td>
                  <td>{subscription.duration}</td>
                  <td>{subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {isExpired ? (
                      <span className="expired-status">Expired</span>
                    ) : subscription.active ? (
                      <span className="approved-status">Active</span>
                    ) : (
                      <span className="inactive-status">Inactive</span>
                    )}

                    {/* View Invoice button for all subscriptions (active or expired) */}
                    <button
                      className="view-invoice-button"
                      onClick={() => viewInvoice(subscription.id)}
                    >
                      View Invoice
                    </button>

                    {/* Show Deactivate button only for active subscriptions */}
                    {!isExpired && subscription.active && (
                      <button
                        className="deactivate-button"
                        onClick={() => deactivateSubscription(subscription.id)}
                      >
                        Deactivate
                      </button>
                    )}

                    {/* Show Activate button only for inactive subscriptions */}
                    {!isExpired && !subscription.active && (
                      <button
                        className="activate-button"
                        onClick={() => activateSubscription(subscription.id)}
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {isModalOpen && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={() => setIsModalOpen(false)}>
              &times;
            </span>
            <h2>Invoice</h2>
            <p><strong>Invoice Number:</strong> {selectedInvoice.invoiceNumber}</p>
            <p><strong>Email:</strong> {selectedInvoice.email}</p>
            <p><strong>Plan:</strong> {selectedInvoice.plan}</p>
            <p><strong>Amount:</strong> ${selectedInvoice.amount}</p>
            <p><strong>Start Date:</strong> {selectedInvoice.startDate}</p>
            <p><strong>End Date:</strong> {selectedInvoice.endDate}</p>
            <p><strong>Invoice Date:</strong> {selectedInvoice.invoiceDate}</p>
          </div>
        </div>
      )}

      {/* Button to manage subscription plans */}
      <button onClick={() => setIsPlanModalOpen(true)}>Manage Plans</button>

      {/* Plan Modal */}
      {isPlanModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPlanModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Subscription Plans</h2>
            <ul>
              {plans.map((plan) => (
                <li key={plan.id}>
                  {plan.name} - ${plan.price} for {plan.duration} days
                </li>
              ))}
            </ul>
            <h3>Add New Plan</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addNewPlan();
              }}
            >
              <input
                type="text"
                placeholder="Plan Name"
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newPlan.price}
                onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Duration (days)"
                value={newPlan.duration}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, duration: e.target.value })
                }
                required
              />
              <button type="submit">Add Plan</button>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
