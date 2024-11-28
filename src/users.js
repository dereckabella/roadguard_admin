import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from './firebaseConfig';
import { Player } from '@lottiefiles/react-lottie-player';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loadingAnimation from './lottie/loading.json';
import './Users.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(firestore, 'users');
                const usersSnapshot = await getDocs(usersCollection);

                const usersData = usersSnapshot.docs.map((userDoc) => {
                    const userData = userDoc.data();
                    const userId = userDoc.id;

                    let created = '';

                    if (userData.createdAt) {
                        if (userData.createdAt.seconds) {
                            created = new Date(userData.createdAt.seconds * 1000).toLocaleString();
                        } else {
                            created = userData.createdAt.toString();
                        }
                    }

                    return {
                        id: userId,
                        ...userData,
                        created: created,
                    };
                });

                setUsers(usersData);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 2000);
            }
        };

        fetchUsers();
    }, []);

    const handleImageClick = async (userId) => {
        toast.dismiss(); // Dismiss any existing toasts
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const user = users.find(user => user.id === userId);
            const imageRef = ref(storage, `users/${userId}/${file.name}`);

            try {
                await uploadBytes(imageRef, file);
                const newPhotoURL = await getDownloadURL(imageRef);
                const userDoc = doc(firestore, 'users', userId);
                await updateDoc(userDoc, { photoURL: newPhotoURL });

                setUsers(users.map(user => user.id === userId ? { ...user, photoURL: newPhotoURL } : user));
                toast.success('Profile picture updated successfully!', { autoClose: 500 });
            } catch (error) {
                console.error('Error uploading image or updating Firestore:', error);
                toast.error('Failed to update profile picture!', { autoClose: 500 });
            }
        };

        fileInput.click();
    };

    const editUser = async (userId) => {
        toast.dismiss(); // Dismiss any existing toasts
        const user = users.find(user => user.id === userId);
    
        const newDisplayName = prompt('Enter new Display Name:', user.displayName);
        // Document ID (email) should not be editable
        // const newDocumentId = prompt('Enter new Document ID (email):', userId); 
    
        // Validation checks
        if (!newDisplayName || newDisplayName.trim() === '') {
            toast.error('Display Name cannot be empty!', { autoClose: 500 });
            return;
        }
    
        try {
            if (newDisplayName !== user.displayName) {
                const userDoc = doc(firestore, 'users', userId);
                await updateDoc(userDoc, { displayName: newDisplayName });
    
                setUsers(users.map(user =>
                    user.id === userId
                        ? { ...user, displayName: newDisplayName }
                        : user
                ));
                toast.success('Display Name updated successfully!', { autoClose: 500 });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user!', { autoClose: 500 });
        }
    };
    
    const disableUser = async (userId, currentDisabledStatus) => {
        toast.dismiss(); // Dismiss any existing toasts
        const userDoc = doc(firestore, 'users', userId);
        const newStatus = !currentDisabledStatus;

        try {
            await updateDoc(userDoc, { disabled: newStatus });
            setUsers(users.map(user => user.id === userId ? { ...user, disabled: newStatus } : user));
            toast.success(`User ${newStatus ? 'disabled' : 'enabled'} successfully!`, { autoClose: 500 });
        } catch (error) {
            console.error('Error updating user disabled status:', error);
            toast.error('Failed to update user status!', { autoClose: 500 });
        }
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredUsers = users.filter(user =>
        (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.id && user.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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
        <div className="container">
            <h1>Users</h1>
            <input
                type="text"
                placeholder="Search by name or document ID"
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
            />
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>NAME</th>
                            <th>DOCUMENT ID</th>
                            <th>CREATED AT</th>
                            <th>DISABLED</th>
                            <th style={{ textAlign: 'center' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <img
                                            src={user.photoURL}
                                            alt="User Photo"
                                            style={{
                                                width: '30px',
                                                height: '30px',
                                                borderRadius: '50%',
                                                marginRight: '10px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleImageClick(user.id)}
                                        />
                                        {user.displayName}
                                    </div>
                                </td>
                                <td>{user.id}</td>
                                <td>{user.created}</td>
                                <td>{user.disabled ? 'Yes' : 'No'}</td>
                                <td>
                                    <button
                                        className="edit-btn"
                                        onClick={() => editUser(user.id)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={`disable-btn ${user.disabled ? 'enable' : 'disable'}`}
                                        onClick={() => disableUser(user.id, user.disabled)}
                                    >
                                        {user.disabled ? 'Enable' : 'Disable'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ToastContainer
                position="top-center"
                autoClose={500} // 0.5 seconds
                hideProgressBar
                closeOnClick
                transition={Slide}
            />
        </div>
    );
};

export default Users;
