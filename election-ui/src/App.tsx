import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VoterDashboard } from './pages/VoterDashboard';
import { PermissionGate } from './components/PermissionGate';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AdminDashboard } from './pages/AdminDashboard';
import { CandidateDashboard } from './pages/CandidateDashboar';
import { DashboardLayout } from './layouts/DashboardLayout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSignalR } from './context/SignalRContext';
import { useAuthStore } from './store/authStore';
import api from './services/api';

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <DashboardLayout>{children}</DashboardLayout>
);

const App: React.FC = () => {
    const { connection } = useSignalR();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!connection || !user) return;

        connection.on("CandidateApproved", async (approvedUserId: number) => {
            if (user && user.id === approvedUserId) {
                await refreshAndRedirect("/candidate", "Congratulations! Your application has been approved!");
            } else {
                toast.info("A new candidate has been approved!");
            }
        });

        connection.on("RoleUpdated", async (targetUserId: number, newRole: string) => {
            if (user && user.id === targetUserId) {
                let path = "/voter";
                if (newRole === "Admin") path = "/admin";
                else if (newRole === "Candidate") path = "/candidate";

                await refreshAndRedirect(path, `Your role has been updated to ${newRole}!`);
            }
        });

        return () => {
            connection.off("CandidateApproved");
            connection.off("RoleUpdated");
        }
    }, [connection, user]);

    const refreshAndRedirect = async (path: string, message: string) => {
        toast.success(message + " Redirecting...");
        try {
            const res = await api.post('/auth/refresh-token', {});
            if (res.data && res.data.token) {
                const newToken = res.data.token;
                const base64Url = newToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                const payload = JSON.parse(jsonPayload);

                let permissions = [];
                if (Array.isArray(payload.permissions)) permissions = payload.permissions;
                else if (payload.permissions) permissions = [payload.permissions];

                const userId = payload.id ? parseInt(payload.id) : (user?.id || 0);

                const updatedUser = {
                    ...user!,
                    id: userId,
                    permissions: permissions
                };

                useAuthStore.getState().setAuth(newToken, updatedUser);

                setTimeout(() => window.location.href = path, 1000);
            }
        } catch (e) {
            console.error("Auto-refresh failed", e);
            toast.warning("Role updated. Please login again.");
        }
    };

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes */}
                <Route path="/voter" element={
                    <PermissionGate permission="Permissions.CanViewDashboard">
                        <LayoutWrapper>
                            <VoterDashboard />
                        </LayoutWrapper>
                    </PermissionGate>
                } />

                <Route path="/admin" element={
                    <PermissionGate permission="Permissions.CanViewAdminStats">
                        <LayoutWrapper>
                            <AdminDashboard />
                        </LayoutWrapper>
                    </PermissionGate>
                } />

                <Route path="/candidate" element={
                    <PermissionGate permission="Permissions.CanAccessCandidateDashboard">
                        <LayoutWrapper>
                            <CandidateDashboard />
                        </LayoutWrapper>
                    </PermissionGate>
                } />

                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
            <ToastContainer position="bottom-right" />
        </BrowserRouter>
    );
};

export default App;