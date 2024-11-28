import React, { useState, useEffect } from 'react';
import { ref, get, child, update, set, push,  remove } from 'firebase/database';
import { database } from './firebaseConfig'; // Your Firebase configuration file
import './SubscriptionManagement.css'; // Optional: Add CSS for styling
import CircularProgress from '@mui/material/CircularProgress';
import { Player } from '@lottiefiles/react-lottie-player';
import loadingAnimation from './lottie/loading.json';
import {  Slide } from 'react-toastify';
import jsPDF from 'jspdf'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  PieController,
} from 'chart.js';  


Chart.register(PieController, ArcElement, Tooltip, Legend);

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setLoading] = useState(true);
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

      // Fetch current subscriptions
      const subscriptionsSnapshot = await get(child(dbRef, 'subscriptions'));
      const subscriptionsData = subscriptionsSnapshot.exists()
        ? Object.entries(subscriptionsSnapshot.val()).map(([key, value]) => ({
            id: key,
            type: 'Current', // Label for current subscriptions
            ...value,
          }))
        : [];

      // Fetch subscription history
      const historySnapshot = await get(child(dbRef, 'subscriptions_history'));
      const historyData = historySnapshot.exists()
        ? Object.entries(historySnapshot.val()).flatMap(([userId, history]) =>
            Object.entries(history).map(([key, value]) => ({
              id: key,
              userId,
              type: 'History', // Label for subscription history
              ...value,
            }))
          )
        : [];

      // Combine current subscriptions and history
      const combinedData = [...subscriptionsData, ...historyData];
      setSubscriptions(combinedData);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchSubscriptions();
}, []);



const exportToPDF = async () => {
  const doc = new jsPDF('p', 'mm', 'a4'); // Portrait orientation, mm units, A4 size

  // Add Title Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Subscription Management Report', 15, 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Generated On: ${new Date().toLocaleString()}`, 15, 22);

  // Add Summary Section
  const summaryX = 15;
  let summaryY = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Summary', summaryX, summaryY);

  const summaryData = [
    ['Total Sales', `₱ ${totalSales.toLocaleString()}`],
    ['Total Users', totalEmails],
    ['Active Subscriptions', totalActive],
    ['Inactive Subscriptions', totalInactive],
    ['Expired Subscriptions', totalExpired],
  ];

  doc.setFontSize(12);
  summaryData.forEach(([key, value], index) => {
    doc.text(`${key}:`, summaryX, summaryY + 8 + index * 6);
    doc.text(value.toString(), summaryX + 60, summaryY + 8 + index * 6);
  });

  // Add Subscription Table
  const headers = [['Email', 'Amount', 'Duration', 'Start Date', 'End Date', 'Status']];
  const rows = subscriptions.map((sub) => [
    sub.email,
    sub.amount,
    sub.duration,
    sub.startDate ? new Date(sub.startDate).toLocaleDateString() : 'N/A',
    sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A',
    sub.active
      ? 'Active'
      : checkIfExpired(sub.endDate)
      ? 'Expired'
      : 'Inactive',
  ]);

  doc.autoTable({
    startY: summaryY + 40,
    head: headers,
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [33, 150, 243], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: 50 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Add Chart Section
  const chartYPosition = doc.lastAutoTable.finalY + 10;

  // Create Canvas for Charts
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 150;

  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Active', 'Inactive', 'Expired'],
      datasets: [
        {
          data: [totalActive, totalInactive, totalExpired],
          backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c'],
        },
      ],
    },
    options: { responsive: false },
  });

  await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for chart rendering

  const chartDataURL = canvas.toDataURL('image/png');
  doc.addImage(chartDataURL, 'PNG', 15, chartYPosition, 180, 90);

  // Save the PDF
  doc.save('subscription_report.pdf');
};

  const checkIfExpired = (endDate) => {
    const currentDate = new Date();
    const expirationDate = new Date(endDate);
    return expirationDate < currentDate;
  };
  
 // Ensure 'amount' values are numbers and sum them up
 const totalSales = subscriptions.reduce((sum, sub) => {
  const rawAmount = sub.amount || "0"; // Default to "0" if amount is missing
  const numericAmount = parseFloat(rawAmount.replace(/[^0-9.]/g, "")); // Remove non-numeric characters
  return sum + (isNaN(numericAmount) ? 0 : numericAmount); // Add only valid numbers
}, 0);

  const totalEmails = new Set(subscriptions.map((sub) => sub.email)).size;
  const totalActive = subscriptions.filter((sub) => sub.active).length;
  const totalInactive = subscriptions.filter((sub) => !sub.active && !checkIfExpired(sub.endDate)).length;
  const totalExpired = subscriptions.filter((sub) => checkIfExpired(sub.endDate)).length;

  const activateSubscription = async (subscriptionId) => {
    if (!subscriptionId) {
      toast.error('Invalid subscription ID.', { autoClose: 1500 });
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

      toast.success('Subscription activated successfully!', { autoClose: 1500 });
    } catch (error) {
      console.error('Error activating subscription:', error);
      toast.error('Failed to activate subscription. Please try again.', { autoClose: 1500 });
    } finally {
      setTimeout(() => setIsButtonDisabled(false), 3000); // Re-enable buttons after timeout
    }
  };

  const deactivateSubscription = async (subscriptionId) => {
    if (!subscriptionId) {
      toast.error('Invalid subscription ID.', { autoClose: 1500 });
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

      toast.success('Subscription deactivated successfully!', { autoClose: 1500 });
    } catch (error) {
      console.error('Error deactivating subscription:', error);
      toast.error('Failed to deactivate subscription. Please try again.', { autoClose: 1500 });
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
  
      toast.success('Plan deleted successfully!', { autoClose: 1500 });
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete the plan. Please try again.', { autoClose: 1500 });
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
      toast.error('All fields are required.', { autoClose: 1500 });
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
  
      // Show success toast
      toast.success('Plan added successfully!', { autoClose: 1500 });
    } catch (error) {
      console.error('Error adding plan:', error);
      toast.error('Failed to add the plan. Please try again.', { autoClose: 1500 });
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

<ToastContainer
                position="top-center"
                autoClose={500} // 0.5 seconds
                hideProgressBar
                closeOnClick
                transition={Slide}
                closeButton={true}
            />

{/* Manage Plans Button */}
<div className="top-content">
  <div className="top-buttons">
    <button className="manage-plans-button" onClick={openModal}>
      Manage Plans
    </button>
    <button className="export-pdf-button" onClick={exportToPDF}>
      Export to PDF
    </button>
  </div>
    {/* Summary Container */}
  <div className="summary-container">
    <div className="summary-item">
      <h3>Total Sales</h3>
      <p>₱{totalSales.toLocaleString()}</p> {/* Formats the number with commas */}
    </div>
      <div className="summary-item">
        <h3>Total Users</h3>
        <p>{totalEmails}</p>
      </div>
      <div className="summary-item">
        <h3>Active</h3>
        <p>{totalActive}</p>
      </div>
      <div className="summary-item">
        <h3>Inactive</h3>
        <p>{totalInactive}</p>
      </div>
      <div className="summary-item">
        <h3>Expired</h3>
        <p>{totalExpired}</p>
      </div>
  </div>
</div>

{isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Player
            autoplay
            loop
            src={loadingAnimation}
            style={{ height: '150px', width: '150px' }}
          />
        </div>
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
      <th style={{ textAlign: 'center' }}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {subscriptions.map((subscription) => {
      const isExpired = subscription.endDate && new Date(subscription.endDate) < new Date();
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
              <span className="inactive-status">Cancelled</span>
            )}
          </td>
          <td>
            <button
              className="view-invoice-button"
              onClick={() => viewInvoice(subscription.id)}
            >
              View Invoice
            </button>
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
