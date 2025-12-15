/**
 * Auth Context - Simple and Clean
 * 
 * Provides authentication state to the entire app.
 * Uses React Context to share user data across components.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';

// API base URL
// API base URL
// Remove trailing slash and optional /api suffix to get clean root
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '').replace(/\/api$/, '');
const API_URL = `${BASE}/api`;

// User type
interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    title?: string;
    bio?: string;
}

// Context type
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to use auth context
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * Auth Provider Component
 * Wrap your app with this to provide auth state everywhere.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on app load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers: any = { credentials: 'include' };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                    credentials: 'include', // Send cookies
                });
                const data = await res.json();

                if (data.success) {
                    setUser(data.user);
                } else {
                    localStorage.removeItem('token'); // Invalid token
                }
            } catch (error) {
                // User not logged in, that's okay
                console.log('Not authenticated');
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    /**
     * Register a new user
     */
    const register = async (name: string, email: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || 'Registration failed');
            throw new Error(data.error);
        }

        if (data.token) {
            localStorage.setItem('token', data.token);
        }

        setUser(data.user);
        toast.success(`Welcome, ${data.user.name}!`);
    };

    /**
     * Login user
     */
    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            toast.error(data.error || 'Login failed');
            throw new Error(data.error);
        }

        if (data.token) {
            localStorage.setItem('token', data.token);
        }

        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            // ignore
        }

        localStorage.removeItem('token');
        setUser(null);
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
