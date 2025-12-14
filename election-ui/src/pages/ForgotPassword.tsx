import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            toast.success("Password reset successfully! Please login.");
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
                    {step === 1 ? 'Forgot Password' : 'Reset Password'}
                </h2>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-gray-700">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex justify-center"
                        >
                            {loading ? <span className="loader"></span> : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4">
                            OTP sent to <strong>{email}</strong>
                        </div>
                        <div>
                            <label className="block text-gray-700">Enter OTP</label>
                            <input
                                type="text"
                                required
                                className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">New Password</label>
                            <input
                                type="password"
                                required
                                className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <button
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition flex justify-center"
                        >
                            {loading ? <span className="loader"></span> : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="mt-4 text-center">
                    <Link to="/login" className="text-sm text-gray-500 hover:text-blue-600">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};
