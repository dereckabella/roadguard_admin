import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, getUser, deleteUser } from 'firebase/auth'; // Import Firebase Auth
import { firestore } from './firebaseConfig'; // Import Firestore from firebaseConfig.js
import './Users.css'; // Import the CSS file

const Users = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            const auth = getAuth(); // Initialize Firebase Auth
            const usersCollection = collection(firestore, 'users');
            const usersSnapshot = await getDocs(usersCollection);

            const usersData = await Promise.all(
                usersSnapshot.docs.map(async (userDoc) => {
                    const userData = userDoc.data();
                    const userId = userDoc.id; // Document ID as email

                    try {
                        // Fetch user metadata from Firebase Authentication
                        const userAuth = await auth.getUserByEmail(userId);
                        return {
                            id: userId,
                            ...userData,
                            created: userAuth.metadata.creationTime, // Use creationTime from metadata and rename to 'created'
                        };
                    } catch (error) {
                        console.error('Error fetching user from Auth:', error);
                        return { id: userId, ...userData, created: 'N/A' }; // Handle if user not found
                    }
                })
            );

            console.log('Fetched users with metadata:', usersData);
            setUsers(usersData);
        };

        fetchUsers().catch(error => {
            console.error('Error fetching users:', error);
        });
    }, []);

    const deleteUser = async (userId) => {
        const userDoc = doc(firestore, 'users', userId);
        const auth = getAuth();

        try {
            await deleteDoc(userDoc); // Delete from Firestore
            const userAuth = await auth.getUserByEmail(userId);
            await deleteUser(userAuth); // Delete from Authentication
            console.log('User deleted successfully');
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const confirmDeleteUser = (userId) => {
        const confirmed = window.confirm('Are you sure you want to delete this user?');
        if (confirmed) {
            deleteUser(userId);
        }
    };

    const editUser = async (userId) => {
        const newEmail = prompt('Enter new email:');
        const userDoc = doc(firestore, 'users', userId);

        try {
            await updateDoc(userDoc, { email: newEmail });
            console.log('User updated successfully');
            setUsers(users.map(user => user.id === userId ? { ...user, email: newEmail } : user));
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredUsers = users.filter(user =>
        (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.id && user.id.toLowerCase().includes(searchQuery.toLowerCase())) // Search by document ID
    );

    return (
        <div className="container">
            <h1>Users</h1>
            <input
                type="text"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
            />
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Created</th> {/* Update the header label */}
                            <th>Actions</th>
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
                                                marginRight: '10px'
                                            }}
                                        />
                                        {user.displayName}
                                    </div>
                                </td>
                                <td>{user.id}</td> {/* Use document ID as email */}
                                <td>
                                    {user.created}
                                       
                                </td>
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
