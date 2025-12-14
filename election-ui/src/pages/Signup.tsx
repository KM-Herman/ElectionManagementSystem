import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

export const Signup: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { name, email, password });
            toast.success("Registration Successful! Please Login.");
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Registration Failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center auth-bg p-4 text-white">
            <div className="glass p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 text-center">
                <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                <p className="text-blue-100 mb-8">Join the platform today</p>

                <form onSubmit={handleSignup} className="space-y-6 text-left">
                    <div>
                        <label className="block text-sm font-medium mb-1 pl-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 pl-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 pl-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all transform hover:-translate-y-0.5"
                    >
                        Sign Up
                    </button>
                </form>

                <div className="mt-6 text-sm text-blue-100">
                    Already have an account? <span className="underline cursor-pointer hover:text-white" onClick={() => navigate('/login')}>Sign In</span>
                </div>
            </div>
        </div>
    );
};
