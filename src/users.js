import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { getAuth, deleteUser } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from './firebaseConfig';
import { Player } from '@lottiefiles/react-lottie-player';
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
                // Simulate a loading delay (5 seconds)
                setTimeout(() => {
                    setLoading(false); // Stop loading once data is fetched
                }, 2000); // 5-second delay
            }
        };

        fetchUsers();
    }, []);

    const handleImageClick = async (userId) => {
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
            } catch (error) {
                console.error('Error uploading image or updating Firestore:', error);
            }
        };

        fileInput.click();
    };

    // Function to edit document ID and displayName
    const editUser = async (userId) => {
        const user = users.find(user => user.id === userId);

        const newId = prompt('Enter new document ID (should match email):', userId);
        const newDisplayName = prompt('Enter new display name:', user.displayName);

        if (!newId || !newDisplayName) {
            alert("Document ID and display name are required!");
            return;
        }

        try {
            // Check if the new document ID already exists
            const existingUserDoc = await getDocs(collection(firestore, 'users'));
            const existingUserIds = existingUserDoc.docs.map(doc => doc.id);
            
            if (existingUserIds.includes(newId) && newId !== userId) {
                alert("Document ID already exists. Please use a different ID.");
                return;
            }

            if (newId === userId) {
                // If the ID has not changed, update the display name only
                const userDoc = doc(firestore, 'users', userId);
                await updateDoc(userDoc, { displayName: newDisplayName });
                setUsers(users.map(user => user.id === userId ? { ...user, displayName: newDisplayName } : user));
                console.log('User displayName updated successfully');
            } else {
                // If the ID has changed, create a new document and delete the old one
                const newUserDoc = doc(firestore, 'users', newId);
                await setDoc(newUserDoc, {
                    ...user,
                    id: newId,
                    displayName: newDisplayName,
                    email: user.email // Keep the email unchanged
                });

                // Delete the old document
                const oldUserDoc = doc(firestore, 'users', userId);
                await deleteDoc(oldUserDoc);

                // Update the UI
                setUsers(users.map(user => user.id === userId ? { ...user, id: newId, displayName: newDisplayName } : user));
                console.log('User updated and Document ID changed successfully');
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const deleteUserFromFirestoreAndAuth = async (userId) => {
        const userDoc = doc(firestore, 'users', userId);
        const auth = getAuth();

        try {
            await deleteDoc(userDoc);
            const userAuth = auth.currentUser;
            if (userAuth && userAuth.email === userId) {
                await deleteUser(userAuth);
            }

            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const confirmDeleteUser = (userId) => {
        const confirmed = window.confirm('Are you sure you want to delete this user?');
        if (confirmed) {
            deleteUserFromFirestoreAndAuth(userId);
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
                                <td>
                                    <button onClick={() => editUser(user.id)}>Edit</button>
                                    <button onClick={() => confirmDeleteUser(user.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
