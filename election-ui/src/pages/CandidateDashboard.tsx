import React, { useEffect, useState } from 'react';
import api, { Notification } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const CandidateDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ rank: 0, voteCount: 0 });
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

    // Forms
    const [profile, setProfile] = useState({ name: user?.name, profileDetails: user?.profileDetails || '' });
    const [manifesto, setManifesto] = useState('');

    useEffect(() => {
        fetchStats();
        fetchNotifications();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/candidate/stats');
            setStats(res.data);
        } catch (err: any) {
            console.error("Not a candidate yet or error", err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/voter/notifications'); // Reusing voter notification endpoint
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/voter/profile', profile); // Reusing voter profile endpoint
            toast.success("Profile Updated");
        } catch (err) {
            toast.error("Failed to update profile");
        }
    };

    const handleUpdateManifesto = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/candidate/manifesto', { manifesto });
            toast.success("Manifesto Updated");
        } catch (err) {
            toast.error("Failed to update manifesto");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Candidate Portal</h1>
                    <p className="text-gray-500">Welcome, {user?.name}</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => navigate('/voter')}
                        className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition shadow-sm flex items-center"
                    >
                        <span className="mr-2">🗳️</span> Cast Vote
                    </button>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Profile & Manifesto
                    </button>
                </div>
            </div>

            {/* Content using Animations */}
            <div className="animate-fadeIn">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Stats Cards */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                                <h3 className="text-lg font-semibold opacity-90">Current Rank</h3>
                                <div className="text-5xl font-bold mt-2">#{stats.rank}</div>
                                <p className="text-sm mt-4 opacity-75">In your position race</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-gray-500 font-semibold uppercase tracking-wider text-sm">Total Votes</h3>
                                <div className="text-4xl font-bold text-gray-800 mt-2">{stats.voteCount}</div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Notifications</h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {notifications.length === 0 ? (
                                    <p className="text-gray-400 italic text-center py-8">No notifications yet.</p>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-gray-800">{n.message}</p>
                                            <p className="text-xs text-gray-500 mt-2">{new Date(n.dateSent).toLocaleString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Profile Settings */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Personal Profile</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                                        value={profile.name}
                                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Profile Details</label>
                                    <textarea
                                        rows={4}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                                        value={profile.profileDetails}
                                        onChange={e => setProfile({ ...profile, profileDetails: e.target.value })}
                                    ></textarea>
                                </div>
                                <button className="w-full bg-gray-800 text-white py-2.5 rounded-lg hover:bg-gray-900 transition">Save Profile</button>
                            </form>
                        </div>

                        {/* Manifesto Settings */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Campaign Manifesto</h2>
                            <form onSubmit={handleUpdateManifesto} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Manifesto</label>
                                    <p className="text-xs text-gray-500 mb-2">This is what voters will see when they view your profile.</p>
                                    <textarea
                                        rows={8}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                                        value={manifesto}
                                        onChange={e => setManifesto(e.target.value)}
                                        placeholder="Write your campaign promises here..."
                                    ></textarea>
                                </div>
                                <button className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-lg">Update Manifesto</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};