import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, defs, linearGradient, stop } from 'recharts';
import { firestore } from './firebaseConfig'; // Adjust the path as needed

const DailyAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const usersCollection = collection(firestore, 'users');
                const usersSnapshot = await getDocs(usersCollection);
                const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const today = new Date();
                const startOfDay = new Date(today.setHours(0, 0, 0, 0));
                const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const startOfYear = new Date(today.getFullYear(), 0, 1);

                // Utility to handle both Firestore Timestamp and ISO 8601 date strings
                const parseCreatedAt = (createdAt) => {
                    if (!createdAt) return null;
                    // If createdAt is a Firestore Timestamp
                    if (createdAt.seconds) {
                        return new Date(createdAt.seconds * 1000);
                    }
                    // If createdAt is an ISO 8601 string
                    return new Date(createdAt);
                };

                // Filter users created today, this week, this month, this year
                const dailyData = users.filter(user => {
                    const createdAt = parseCreatedAt(user.createdAt);
                    return createdAt && createdAt >= startOfDay;
                }).length;

                const weeklyData = users.filter(user => {
                    const createdAt = parseCreatedAt(user.createdAt);
                    return createdAt && createdAt >= startOfWeek;
                }).length;

                const monthlyData = users.filter(user => {
                    const createdAt = parseCreatedAt(user.createdAt);
                    return createdAt && createdAt >= startOfMonth;
                }).length;

                const yearlyData = users.filter(user => {
                    const createdAt = parseCreatedAt(user.createdAt);
                    return createdAt && createdAt >= startOfYear;
                }).length;

                const data = [
                    { name: 'Daily', value: dailyData },
                    { name: 'Weekly', value: weeklyData },
                    { name: 'Monthly', value: monthlyData },
                    { name: 'Yearly', value: yearlyData },
                ];

                setAnalyticsData(data);
                setLoading(false); // Stop loading after fetching data
            } catch (error) {
                console.error('Error fetching analytics data:', error);
                setLoading(false); // Stop loading in case of an error
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return <div>Loading data...</div>; // Loading message while fetching data
    }

    return (
        <div>
            <h2>User Registration Analytics</h2>
            {analyticsData.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={analyticsData}
                        margin={{
                            top: 20, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#FAFF00" />
                                <stop offset="100%" stopColor="#E0C55B" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="url(#barGradient)" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div>No registration data available</div> // Message if no users have registered
            )}
        </div>
    );
};

export default DailyAnalytics;
