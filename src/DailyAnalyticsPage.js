import React, { useEffect, useState } from 'react';

const DailyAnalyticsPage = () => {
    const [analyticsData, setAnalyticsData] = useState([]);

    useEffect(() => {
        // Fetch analytics data from the server
        const fetchData = async () => {
            try {
                const response = await fetch('/api/analytics');
                const data = await response.json();
                setAnalyticsData(data);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>Daily Analytics</h1>
            {analyticsData.length > 0 ? (
                <ul>
                    {analyticsData.map((item) => (
                        <li key={item.id}>{item.title}</li>
                    ))}
                </ul>
            ) : (
                <p>No analytics data available.</p>
            )}
        </div>
    );
};

export default DailyAnalyticsPage;