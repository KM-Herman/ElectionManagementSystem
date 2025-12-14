import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSignalR } from '../context/SignalRContext';
import api from '../services/api';

interface ChartData {
    id: number;
    name: string; // Candidate Name
    votes: number;
}

// Mock initial data or pass as props
const initialData: ChartData[] = [
    { id: 1, name: 'Candidate A', votes: 0 },
    { id: 2, name: 'Candidate B', votes: 0 },
];

export const LiveChart: React.FC = () => {
    const { connection } = useSignalR();
    const [data, setData] = useState<ChartData[]>(initialData);

    useEffect(() => {
        fetchTrends();

        if (connection) {
            connection.on("ReceiveVoteUpdate", (candidateId: number, newCount: number) => {
                setData(prevData => {
                    const exists = prevData.find(d => d.id === candidateId);
                    if (exists) {
                        return prevData.map(d => d.id === candidateId ? { ...d, votes: newCount } : d);
                    }
                    // Optional: If new candidate (not in top 10 originally) gets votes, we might want to re-fetch
                    // For now, simple update
                    return prevData;
                });
            });

            connection.on("UpdateDashboard", () => {
                fetchTrends();
            });
        }

        return () => {
            if (connection) {
                connection.off("ReceiveVoteUpdate");
                connection.off("UpdateDashboard");
            }
        };
    }, [connection]);

    const fetchTrends = async () => {
        try {
            const res = await api.get('/voter/trends');
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch trends", err);
        }
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="votes" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
