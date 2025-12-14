import React, { useEffect, useState } from 'react';
import api, { PositionDto, CandidateDto, Notification, CandidateApplicationRequest } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { LiveChart } from '../components/LiveChart';

interface DashboardData {
    positions: PositionDto[];
    candidatesByPosition: Record<number, CandidateDto[]>;
}

export const VoterDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState<DashboardData>({ positions: [], candidatesByPosition: {} });
    const [votedPositions, setVotedPositions] = useState<Set<number>>(new Set());
    const [activeTab, setActiveTab] = useState<'home' | 'apply' | 'profile' | 'notifications'>('home');
    const [notifications, setNotifications] = useState<Notification[]>([]);


    const [application, setApplication] = useState<CandidateApplicationRequest>({
        positionId: 0,
        manifesto: '',
        degree: '',
        hasBeenInJail: false,
        maritalStatus: 'Single',
        nationalId: ''
    });

    const [profile, setProfile] = useState({ name: user?.name || '', profileDetails: user?.profileDetails || '' });

    useEffect(() => {
        fetchDashboard();
        fetchNotifications();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/voter/dashboard');
            // Ensure data structure matches expected type
            if (res.data) {
                setData(res.data);
                if (res.data.userVotedPositionIds) {
                    setVotedPositions(new Set(res.data.userVotedPositionIds));
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/voter/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleVote = async (candidateId: number, positionId: number) => {
        try {
            await api.post('/voter/vote', { candidateId, positionId });
            toast.success("Vote Cast Successfully!");

            // Optimistic Update
            setVotedPositions(prev => new Set(prev).add(positionId));

            fetchDashboard(); // Refresh counts from server
        } catch (err: any) {
            toast.error(err.response?.data || "Voting failed");
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/candidate/apply', application);
            toast.success(res.data); // "Pending Admin Approval"
            setApplication({ ...application, manifesto: '', degree: '', nationalId: '' });
        } catch (err: any) {
            toast.error(err.response?.data || "Application failed");
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/voter/profile', profile);
            toast.success("Profile Updated");
        } catch (err) {
            toast.error("Failed to update profile");
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            {/* Header / Tabs */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}</h1>
                <div className="flex space-x-2 overflow-x-auto w-full md:w-auto">
                    {['home', 'apply', 'profile', 'notifications'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="animate-fadeIn min-h-[60vh]">
                {activeTab === 'home' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {data.positions.map(pos => (
                                <div key={pos.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-gray-100">
                                        <h2 className="text-xl font-bold text-blue-900">{pos.title}</h2>
                                        <p className="text-gray-500 text-sm mt-1">{pos.description}</p>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Candidates</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {data.candidatesByPosition[pos.id]?.map(cand => (
                                                <div key={cand.id} className="group relative bg-gray-50 rounded-lg p-4 transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-xl">
                                                            {cand.name.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-gray-800">{cand.name}</h4>
                                                            <p className="text-xs text-gray-500 line-clamp-1">{cand.manifesto}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex justify-between items-center">
                                                        <span className="text-xs font-semibold text-gray-500">{cand.voteCount} Votes</span>
                                                        {votedPositions.has(pos.id) ? (
                                                            <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-1 rounded">Voted</span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleVote(cand.id, pos.id)}
                                                                className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 transition"
                                                            >
                                                                Vote Now
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!data.candidatesByPosition[pos.id] || data.candidatesByPosition[pos.id].length === 0) && (
                                                <p className="text-gray-400 text-sm italic col-span-2 text-center py-4">No candidates yet for this position.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {data.positions.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Loading elections or no active positions found...</p>
                                </div>
                            )}
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Live Trends</h3>
                                <LiveChart />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'apply' && (
                    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Candidate Application</h2>
                        <form onSubmit={handleApply} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                <select
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                                    value={application.positionId}
                                    onChange={e => setApplication({ ...application, positionId: Number(e.target.value) })}
                                    required
                                >
                                    <option value={0}>Select a Position</option>
                                    {data.positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree / Qualification</label>
                                    <input
                                        type="text"
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                                        value={application.degree}
                                        onChange={e => setApplication({ ...application, degree: e.target.value })}
                                        required
                                        placeholder="e.g. BSc Computer Science"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">National ID / Passport</label>
                                    <input
                                        type="text"
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                                        value={application.nationalId}
                                        onChange={e => setApplication({ ...application, nationalId: e.target.value })}
                                        required
                                        placeholder="ID Number"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                                    <select
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                                        value={application.maritalStatus}
                                        onChange={e => setApplication({ ...application, maritalStatus: e.target.value })}
                                    >
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Divorced">Divorced</option>
                                        <option value="Widowed">Widowed</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-3 pt-6">
                                    <input
                                        type="checkbox"
                                        id="jail"
                                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        checked={application.hasBeenInJail}
                                        onChange={e => setApplication({ ...application, hasBeenInJail: e.target.checked })}
                                    />
                                    <label htmlFor="jail" className="text-sm font-medium text-gray-700">I have a criminal record.</label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Manifesto</label>
                                <textarea
                                    rows={5}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                                    value={application.manifesto}
                                    onChange={e => setApplication({ ...application, manifesto: e.target.value })}
                                    required
                                    placeholder="Tell voters why they should choose you..."
                                ></textarea>
                            </div>

                            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                Submit Application
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border p-8">
                        <div className="text-center mb-6">
                            <div className="h-24 w-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-blue-600 text-3xl font-bold mb-3">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                            <p className="text-gray-500">{user?.email}</p>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                                    value={profile.name}
                                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Details</label>
                                <textarea
                                    rows={3}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"
                                    value={profile.profileDetails}
                                    onChange={e => setProfile({ ...profile, profileDetails: e.target.value })}
                                ></textarea>
                            </div>
                            <button className="w-full bg-gray-800 text-white py-2.5 rounded-lg hover:bg-gray-900 transition">Save Changes</button>
                        </form>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="max-w-3xl mx-auto space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h2>
                        {notifications.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No new notifications</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${notif.isRead ? 'border-gray-200 opacity-60' : 'border-blue-500'}`}>
                                    <p className="text-gray-800 font-medium">{notif.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">{new Date(notif.dateSent).toLocaleString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};