import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getDatabase, ref, onValue } from 'firebase/database';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { firestore } from './firebaseConfig';
import './DailyAnalytics.css';

const COLORS = [
    { start: '#FFDB58', end: '#FFC700' },
    { start: '#8884d8', end: '#6670c8' },
    { start: '#82ca9d', end: '#68b38a' },
    { start: '#FF8042', end: '#e5703c' },
    { start: '#00C49F', end: '#00a583' }
];

const RADIAN = Math.PI / 180;

// Custom label for the PieChart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="#333"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize="12px"
            fontWeight="bold"
        >
            {`${name}: ${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const DailyAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState([]); // For users data
    const [postAnalyticsData, setPostAnalyticsData] = useState([]); // For all posts data
    const [hazardData, setHazardData] = useState([]); // For hazard posts data (upvotes >= 2)
    const [loading, setLoading] = useState(true);
    const [chartType, setChartType] = useState('Area');  // Default chart type is Area
    const [dataType, setDataType] = useState('users');  // Default data type is users
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    // Fetch user analytics from Firestore
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const usersCollection = collection(firestore, 'users');
                const usersSnapshot = await getDocs(usersCollection);
                const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const parseCreatedAt = (createdAt) => {
                    if (!createdAt) return null;
                    if (createdAt.seconds) {
                        return new Date(createdAt.seconds * 1000);
                    }
                    return new Date(createdAt);
                };

                const startOfSelectedDate = new Date(startDate.setHours(0, 0, 0, 0));
                const endOfSelectedDate = new Date(endDate.setHours(23, 59, 59, 999));

                const filteredUsers = users.filter(user => {
                    const createdAt = parseCreatedAt(user.createdAt);
                    return createdAt && createdAt >= startOfSelectedDate && createdAt <= endOfSelectedDate;
                });

                const dateMap = {};
                filteredUsers.forEach(user => {
                    const dateKey = parseCreatedAt(user.createdAt).toISOString().split('T')[0];
                    if (dateMap[dateKey]) {
                        dateMap[dateKey] += 1;
                    } else {
                        dateMap[dateKey] = 1;
                    }
                });

                const data = Object.keys(dateMap).map(date => ({
                    name: date,
                    value: dateMap[date]
                }));

                setAnalyticsData(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [startDate, endDate]);

    // Fetch post and hazard analytics from Realtime Database
    useEffect(() => {
        const fetchPostAnalytics = async () => {
            try {
                const db = getDatabase();
                const postsRef = ref(db, 'posts');
                onValue(postsRef, (snapshot) => {
                    const posts = snapshot.val();
                    const postsArray = Object.values(posts);

                    const parseCreatedAt = (createdAt) => {
                        if (!createdAt) return null;
                        return new Date(createdAt);
                    };

                    const startOfSelectedDate = new Date(startDate.setHours(0, 0, 0, 0));
                    const endOfSelectedDate = new Date(endDate.setHours(23, 59, 59, 999));

                    // Separate all posts and hazard posts (with upvotes >= 2)
                    const allPosts = [];
                    const hazards = [];

                    postsArray.forEach(post => {
                        const createdAt = parseCreatedAt(post.createdAt);
                        if (createdAt && createdAt >= startOfSelectedDate && createdAt <= endOfSelectedDate) {
                            // Add to all posts data
                            const dateKey = createdAt.toISOString().split('T')[0];
                            allPosts.push({ dateKey, post });

                            // If the post has upvotes >= 2, add it to hazards
                            if (post.upvotes >= 2) {
                                hazards.push({ dateKey, post });
                            }
                        }
                    });

                    // Create post data map for chart (all posts)
                    const postDateMap = {};
                    allPosts.forEach(({ dateKey }) => {
                        if (postDateMap[dateKey]) {
                            postDateMap[dateKey] += 1;
                        } else {
                            postDateMap[dateKey] = 1;
                        }
                    });

                    const postData = Object.keys(postDateMap).map(date => ({
                        name: date,
                        value: postDateMap[date] // Number of all posts on that date
                    }));

                    // Create hazard data map for chart (hazards)
                    const hazardDateMap = {};
                    hazards.forEach(({ dateKey }) => {
                        if (hazardDateMap[dateKey]) {
                            hazardDateMap[dateKey] += 1;
                        } else {
                            hazardDateMap[dateKey] = 1;
                        }
                    });

                    const hazardChartData = Object.keys(hazardDateMap).map(date => ({
                        name: date,
                        value: hazardDateMap[date] // Number of hazards on that date
                    }));

                    setPostAnalyticsData(postData); // All posts
                    setHazardData(hazardChartData); // Only hazards
                });
            } catch (error) {
                console.error('Error fetching post analytics data:', error);
            }
        };

        fetchPostAnalytics();
    }, [startDate, endDate]);

    const handleStartDateChange = (event) => {
        setStartDate(new Date(event.target.value));
    };

    const handleEndDateChange = (event) => {
        setEndDate(new Date(event.target.value));
    };

    const renderChart = () => {
        // Choose data to display based on dataType ('users', 'posts', or 'hazards')
        const data = dataType === 'users' ? analyticsData : dataType === 'posts' ? postAnalyticsData : hazardData;
        switch (chartType) {
            case 'Area':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FFDB58" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#FFDB58" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 'dataMax + 5']} allowDecimals={false} />
                            <Tooltip />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#FFDB58" 
                                fill="url(#colorUv)" 
                                animationDuration={1000} 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                );
            case 'Bar':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 'dataMax + 5']} allowDecimals={false} />
                            <Tooltip />
                            <Bar 
                                dataKey="value" 
                                fill="#FFDB58" 
                                animationDuration={1000}  
                            />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'Pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                fill="#8884d8"
                                label={renderCustomizedLabel}
                                labelLine={false}
                                animationDuration={1000}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`url(#gradient${index})`}
                                        stroke="#fff"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <defs>
                                {data.map((_, index) => (
                                    <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={COLORS[index % COLORS.length].start} />
                                        <stop offset="100%" stopColor={COLORS[index % COLORS.length].end} />
                                    </linearGradient>
                                ))}
                            </defs>
                        </PieChart>
                    </ResponsiveContainer>
                );
            default:
                return null;
        }
    };

    return (
        <div className="analytics-container">
            {/* Date Picker and Controls */}
            <div className="date-picker-container">
                <div className="date-picker">
                    <label htmlFor="start-date">Start Date:</label>
                    <input type="date" id="start-date" value={startDate.toISOString().split('T')[0]} onChange={handleStartDateChange} />
                </div>
                <div className="date-picker">
                    <label htmlFor="end-date">End Date:</label>
                    <input type="date" id="end-date" value={endDate.toISOString().split('T')[0]} onChange={handleEndDateChange} />
                </div>

                <div className="chart-controls">
                    <div className="chart-type-selector">
                        <label>Select Chart Type:</label>
                        <select onChange={(e) => setChartType(e.target.value)} value={chartType}>
                            <option value="Area">Area Chart</option>
                            <option value="Bar">Bar Chart</option>
                            <option value="Pie">Pie Chart</option>
                        </select>
                    </div>
                    <div className="data-type-selector">
                        <label>View Data for:</label>
                        <select onChange={(e) => setDataType(e.target.value)} value={dataType}>
                            <option value="users">Users</option>
                            <option value="posts">Posts</option>
                            <option value="hazards">Hazards</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="chart-box">
                <h3>{chartType} Chart for {dataType === 'users' ? 'Users' : dataType === 'posts' ? 'Posts' : 'Hazards'} from {startDate.toDateString()} to {endDate.toDateString()}</h3>
                {renderChart()}
            </div>
        </div>
    );
};

export default DailyAnalytics;
