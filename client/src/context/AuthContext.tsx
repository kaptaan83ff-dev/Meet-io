import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

interface User {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'user' | 'admin';
    bio?: string;
    title?: string;
    createdAt: string;
    updatedAt: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch current user on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await authAPI.getMe();
                if (data.success) {
                    setUser(data.user);
                }
            } catch (error: any) {
                // User not authenticated, that's okay
                console.log('Not authenticated');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const data = await authAPI.login({ email, password });
            if (data.success) {
                setUser(data.user);
                toast.success(`Welcome back, ${data.user.name}!`);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Login failed';
            toast.error(errorMessage);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const data = await authAPI.register({ name, email, password });
            if (data.success) {
                setUser(data.user);
                toast.success(`Welcome, ${data.user.name}!`);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Registration failed';
            toast.error(errorMessage);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
            setUser(null);
            toast.success('Logged out successfully');
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Logout failed';
            toast.error(errorMessage);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
