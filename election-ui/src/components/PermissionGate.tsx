import React from 'react';
import { usePermission } from '../hooks/usePermission';

interface PermissionGateProps {
    permission: string;
    children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ permission, children }) => {
    const hasPermission = usePermission(permission);
    if (!hasPermission) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600 max-w-md">
                    You do not have permission to view this page. ({permission})
                    <br />
                    Please contact your administrator if you believe this is an error.
                </p>
                <div className="mt-6">
                    <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Return to Login</a>
                </div>
            </div>
        );
    }
    return <>{children}</>;
};
