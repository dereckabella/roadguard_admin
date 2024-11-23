import React, { useState, useEffect } from 'react';
import { ref, get, child, update, set, push,  remove } from 'firebase/database';
import { database } from './firebaseConfig'; // Your Firebase configuration file
import './SubscriptionManagement.css'; // Optional: Add CSS for styling
import CircularProgress from '@mui/material/CircularProgress';


const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Generic modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({ name: '', price: '', duration: '' });
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [showAddPlanForm, setShowAddPlanForm] = useState(false);
  const [notification] = useState({ type: '', message: '' });
  const [planToDelete, setPlanToDelete] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(false); // Track if invoice is being viewed
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
const [activationMessage, setActivationMessage] = useState('');
const [isDeactivationModalOpen, setIsDeactivationModalOpen] = useState(false);
const [deactivationMessage, setDeactivationMessage] = useState('');
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [ setDeleteMessage] = useState('');
const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
const [addPlanMessage, setAddPlanMessage] = useState('');
const [deleteFeedbackModalOpen, setDeleteFeedbackModalOpen] = useState(false);
const [deleteFeedbackMessage, setDeleteFeedbackMessage] = useState('');
const [isButtonDisabled, setIsButtonDisabled] = useState(false); // State to track button disable

  useEffect(() => {
    if (isActivationModalOpen) {
        const timer = setTimeout(() => {
            setIsActivationModalOpen(false); // Automatically close the modal after 3 seconds
        }, 3000); // 3 seconds

        return () => clearTimeout(timer); // Clean up the timer on unmount
    }
}, [isActivationModalOpen]);

useEffect(() => {
  if (isDeactivationModalOpen) {
    const timer = setTimeout(() => {
      setIsDeactivationModalOpen(false); // Automatically close the modal after 3 seconds
    }, 3000); // 3 seconds

    return () => clearTimeout(timer); // Clean up the timer on unmount
  }
}, [isDeactivationModalOpen]);

  
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

  const checkIfExpired = (endDate) => {
    const currentDate = new Date();
    const expirationDate = new Date(endDate);
    return expirationDate < currentDate;
  };
  
  const activateSubscription = async (subscriptionId) => {
    if (!subscriptionId) {
      setActivationMessage('Invalid subscription ID.');
      setIsActivationModalOpen(true);
      return;
    }
  
    setIsButtonDisabled(true); // Disable buttons
    try {
      const dbRef = ref(database, `subscriptions/${subscriptionId}`);
      await update(dbRef, { active: true });
  
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === subscriptionId ? { ...sub, active: true } : sub
        )
      );
  
      setActivationMessage('Subscription activated successfully!');
      setIsActivationModalOpen(true);
    } catch (error) {
      console.error('Error activating subscription:', error);
      setActivationMessage('Failed to activate subscription. Please try again.');
      setIsActivationModalOpen(true);
    } finally {
      setTimeout(() => setIsButtonDisabled(false), 3000); // Re-enable buttons after timeout
    }
  };
  
  

  const deactivateSubscription = async (subscriptionId) => {
    if (!subscriptionId) {
      setDeactivationMessage('Invalid subscription ID.');
      setIsDeactivationModalOpen(true);
      return;
    }
  
    setIsButtonDisabled(true); // Disable buttons
    try {
      const dbRef = ref(database, `subscriptions/${subscriptionId}`);
      await update(dbRef, { active: false });
  
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === subscriptionId ? { ...sub, active: false } : sub
        )
      );
  
      setDeactivationMessage('Subscription deactivated successfully!');
      setIsDeactivationModalOpen(true);
    } catch (error) {
      console.error('Error deactivating subscription:', error);
      setDeactivationMessage('Failed to deactivate subscription. Please try again.');
      setIsDeactivationModalOpen(true);
    } finally {
      setTimeout(() => setIsButtonDisabled(false), 3000); // Re-enable buttons after timeout
    }
  };

  

  const generateInvoice = (subscription) => ({
    email: subscription.email,
    plan: subscription.plan,
    amount: subscription.amount,
    startDate: new Date(subscription.startDate).toLocaleDateString(),
    endDate: new Date(subscription.endDate).toLocaleDateString(),
    invoiceDate: new Date().toLocaleDateString(),
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
  });

  const viewInvoice = (subscriptionId) => {
    const subscription = subscriptions.find((sub) => sub.id === subscriptionId);
    if (subscription) {
      const invoice = generateInvoice(subscription);
      setSelectedInvoice(invoice);
      setIsModalOpen(true); // Open the invoice modal
      setViewingInvoice(true); // Track that the invoice modal is open
    }
  };
  const fetchPlans = async () => {
    try {
      const dbRef = ref(database, 'plans');
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

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDeletePlan = async (planId) => {
    try {
      const planRef = ref(database, `plans/${planId}`);
      await remove(planRef); // Delete plan from the database
      setPlans((prev) => prev.filter((plan) => plan.id !== planId)); // Update local state
  
      // Show success feedback
      setDeleteFeedbackMessage('Plan deleted successfully!');
      setDeleteFeedbackModalOpen(true);
    } catch (error) {
      console.error('Error deleting plan:', error);
  
      // Show error feedback
      setDeleteFeedbackMessage('Failed to delete the plan. Please try again.');
      setDeleteFeedbackModalOpen(true);
    } finally {
      setIsDeleteModalOpen(false); // Close delete modal
      setPlanToDelete(null); // Reset the selected plan
    }
  };
  
  const openDeleteModal = (planId) => {
    setPlanToDelete(planId); // Set plan to delete
    setIsDeleteModalOpen(true); // Open the confirmation modal
  };
  
  const confirmDelete = async () => {
    if (!planToDelete) return; // Prevent execution if no plan is selected
    await handleDeletePlan(planToDelete);
  };
  
  
  
  
  useEffect(() => {
    if (deleteFeedbackModalOpen) {
      const timer = setTimeout(() => {
        setDeleteFeedbackModalOpen(false); // Close feedback modal
        setDeleteFeedbackMessage(''); // Clear message
      }, 3000); // 3 seconds delay
  
      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [deleteFeedbackModalOpen]);
  
const handleButtonClick = (e) => {
  if (isDeleteModalOpen) {
    e.preventDefault(); // Prevent any button clicks when the modal is open
  }
};

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPlanToDelete(null); // Clear the selected plan ID
  };

  const openModal = () => {
    setIsPlanModalOpen(true);
    fetchPlans(); // Fetch the current plans when the modal is opened
  };

  // Close Modal
  const closeModal = () => {
    setIsPlanModalOpen(false);
    setShowAddPlanForm(false); // Reset to show the list of plans
    setIsModalOpen(false); // Close the modal
  setViewingInvoice(false); // Reset viewing invoice flag
  };

  

const openConfirmationModal = (planId) => {
  if (viewingInvoice) return; // Prevent opening confirmation modal if viewing invoice

  setPlanToDelete(planId);
  setDeleteMessage("Are you sure you want to delete this plan?"); // Set the confirmation message
  setIsDeleteModalOpen(true); // Open the confirmation modal
};


  const handleNewPlanInput = (e) => {
    const { name, value } = e.target;
    setNewPlan({
      ...newPlan,
      [name]: value
    });
  
    // Example validation (you can adjust based on your requirements)
    if (value === "") {
      e.target.classList.add("error"); // Adds the error class
    } else {
      e.target.classList.remove("error"); // Removes the error class
    }
  };
  

  const addNewPlan = async (e) => {
    e.preventDefault();
  
    // Validate required fields
    if (!newPlan.name || !newPlan.price || !newPlan.duration) {
      setAddPlanMessage('All fields are required.');
      setIsAddPlanModalOpen(true);
      return;
    }
  
    try {
      // Generate unique ID using Firebase push
      const dbRef = ref(database, 'plans');
      const newPlanRef = push(dbRef); // Creates a new entry with a unique key
      const newPlanData = { ...newPlan, id: newPlanRef.key };
  
      // Save new plan to Firebase
      await set(newPlanRef, newPlanData);
  
      // Update local state
      setPlans((prev) => [...prev, newPlanData]);
  
      // Reset the form and close the add plan form
      setNewPlan({ name: '', price: '', duration: '' });
      setShowAddPlanForm(false);
  
      // Show success modal
      setAddPlanMessage('Plan added successfully!');
      setIsAddPlanModalOpen(true);
    } catch (error) {
      console.error('Error adding plan:', error);
  
      // Show error modal
      setAddPlanMessage('Failed to add the plan. Please try again.');
      setIsAddPlanModalOpen(true);
    }
  };
  
  useEffect(() => {
    if (isAddPlanModalOpen) {
      const timer = setTimeout(() => {
        setIsAddPlanModalOpen(false); // Automatically close the modal after 3 seconds
      }, 3000);
  
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [isAddPlanModalOpen]);
  
 
  
  return (
    <div className="subscription-management">
{/* Manage Plans Button */}
<button className="manage-plans-button" onClick={openModal}>
  Manage Plans
</button>

{loading ? (
    <CircularProgress />
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => {
              const isExpired = checkIfExpired(subscription.endDate);
              return (
                <tr key={subscription.id}>
                  <td>{subscription.email}</td>
                  <td>{subscription.amount}</td>
                  <td>{subscription.duration}</td>
                  <td>
                    {subscription.startDate
                      ? new Date(subscription.startDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    {subscription.endDate
                      ? new Date(subscription.endDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    {isExpired ? (
                      <span className="expired-status">Expired</span>
                    ) : subscription.active ? (
                      <span className="approved-status">Active</span>
                    ) : (
                      <span className="inactive-status">Inactive</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="view-invoice-button"
                      onClick={() => viewInvoice(subscription.id)}
                    >
                      View Invoice
                    </button>
                    {!isExpired && subscription.active && (
                      <button
                      className="deactivate-button"
                      onClick={() => deactivateSubscription(subscription.id)}
                      disabled={isButtonDisabled} // Disable button when isButtonDisabled is true
                    >
                      Deactivate
                    </button>
                    )}
                    {!isExpired && !subscription.active && (
                      <button
                      className="activate-button"
                      onClick={() => activateSubscription(subscription.id)}
                      disabled={isButtonDisabled} // Disable button when isButtonDisabled is true
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

     {/* Invoice Modal */}
     {isModalOpen && selectedInvoice && viewingInvoice && (
        <div className="invoice-modal" onClick={closeModal}>
          <div className="invoice-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={closeModal}>
              &times;
            </span>
            <p><strong>Invoice Number:</strong> {selectedInvoice.invoiceNumber}</p>
            <p><strong>Email:</strong> {selectedInvoice.email}</p>
            <p><strong>Plan:</strong> {selectedInvoice.plan}</p>
            <p><strong>Amount:</strong> {selectedInvoice.amount}</p>
            <p><strong>Start Date:</strong> {selectedInvoice.startDate}</p>
            <p><strong>End Date:</strong> {selectedInvoice.endDate}</p>
          </div>
        </div>
      )}

{/*Plan Modal */}
{isPlanModalOpen && (
 <div className="plan-modal" onClick={closeModal}>
 <div className="plan-modal-content" onClick={(e) => e.stopPropagation()}>


   {showAddPlanForm ? (
     <form onSubmit={addNewPlan}>
       <input
         type="text"
         name="name"
         value={newPlan.name}
         onChange={handleNewPlanInput}
         placeholder="Plan Name"
         className="input-field"
         required
       />
       <input
         type="number"
         name="price"
         value={newPlan.price}
         onChange={handleNewPlanInput}
         placeholder="Price"
         className="input-field"
         required
       />
       <input
         type="number"
         name="duration"
         value={newPlan.duration}
         onChange={handleNewPlanInput}
         placeholder="Duration (month(s))"
         className="input-field"
         required
       />
       <div style={{ textAlign: 'center' }}>
       <button type="submit" class="add-plan">Add Plan</button>
         <button
           type="add-plan-button"
           onClick={() => setShowAddPlanForm(false)}
         >
           Cancel
         </button>
       </div>
     </form>
   ) : (
        <>
          {/* Plans List */}
          <ul className="plans-list">
          <span className="plan-close-button" onClick={closeModal}>
     &times;
   </span>
  {plans.map((plan) => (
    <li key={plan.id} className="plan-item">
      <span className="plan-details">
        {plan.name} - ₱{plan.price} ({plan.duration} months)
      </span>
      <button
  className="delete-button"
  onClick={() => openDeleteModal(plan.id)} // Open confirmation modal
>
  Delete
</button>

    </li>
  ))}
</ul>

          {/* Add New Plan Button */}
          <div className="add-plan-container">
  <button className="add-new-plan" onClick={() => setShowAddPlanForm(true)}>
    Add New Plan
  </button>
</div>
        </>
      )}
    </div>
  </div>
)}

       {deleteFeedbackModalOpen && (
  <div className="feedback-modal">
    <p>{deleteFeedbackMessage}</p>
  </div>
)}


{isActivationModalOpen && (
    <div className="activation-modal">
        <p>{activationMessage}</p>
    </div>
)}

{isDeactivationModalOpen && (
  <div className="deactivation-modal">
    <p>{deactivationMessage}</p>
  </div>
)}
{isDeleteModalOpen && (
  <>
    {/* Full-screen overlay to block interaction */}
    <div className="overlay"></div>
    <div className="delete-modal">
      <p>Are you sure you want to delete this plan?</p>
      <div>
        <button onClick={confirmDelete}>Confirm Delete</button>
        <button onClick={cancelDelete}>Cancel</button>
      </div>
    </div>
  </>
)}


{deleteFeedbackModalOpen && (
  <div className="feedback-modal">
    <p>{deleteFeedbackMessage}</p>
  </div>
)}

 {isAddPlanModalOpen && (
      <div className="add-plan-modal">
        <p>{addPlanMessage}</p>
      </div>
    )}

    </div>
  );
};

export default SubscriptionManagement;
