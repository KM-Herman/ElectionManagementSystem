import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : "text-gray-600 hover:bg-gray-50";

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r fixed h-full z-10 hidden md:block">
                <div className="h-16 flex items-center justify-center border-b">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        E-VOTE ADMIN
                    </h1>
                </div>
                <nav className="mt-6">
                    <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Main</div>
                    {user?.permissions.includes('Permissions.CanViewAdminStats') && (
                        <a onClick={() => navigate('/admin')} className={`block px-6 py-3 cursor-pointer flex items-center ${isActive('/admin')}`}>
                            <span className="mr-3">📊</span> Dashboard
                        </a>
                    )}
                    {user?.permissions.includes('Permissions.CanVote') && (
                        <a onClick={() => navigate('/voter')} className={`block px-6 py-3 cursor-pointer flex items-center ${isActive('/voter')}`}>
                            <span className="mr-3">🗳️</span> Voter Area
                        </a>
                    )}
                    <a onClick={() => navigate('/candidate')} className={`block px-6 py-3 cursor-pointer flex items-center ${isActive('/candidate')}`}>
                        <span className="mr-3">👤</span> Candidate Profile
                    </a>

                    <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">System</div>
                    <a onClick={handleLogout} className="block px-6 py-3 cursor-pointer text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center">
                        <span className="mr-3">🚪</span> Logout
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Topbar */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
                    <div className="text-gray-500">
                        Welcome, <span className="text-gray-800 font-semibold">{user?.email}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};
