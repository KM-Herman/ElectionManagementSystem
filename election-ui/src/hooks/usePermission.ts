import { useAuthStore } from '../store/authStore';

export const usePermission = (permission: string): boolean => {
    const { user } = useAuthStore();
    return user?.permissions?.includes(permission) ?? false;
};