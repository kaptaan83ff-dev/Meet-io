
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: string;
}

export default function AdminPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getAllUsers();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
            return;
        }

        try {
            const data = await adminAPI.deleteUser(userId);
            if (data.success) {
                toast.success('User deleted successfully');
                setUsers(prev => prev.filter(u => u._id !== userId));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete user');
        }
    };

    const handleUpdateRole = async (userId: string, currentRole: 'user' | 'admin') => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';

        // Optimistic UI update could be risky here, let's wait for server
        try {
            const data = await adminAPI.updateUserRole(userId, newRole);
            if (data.success) {
                toast.success(`User updated to ${newRole}`);
                setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update role');
        }
    };

    return (
        <div className="bg-[#0B0E14] text-white h-screen flex overflow-hidden font-['Inter']">
            <Sidebar />

            <main className="flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-900/10 blur-[120px] pointer-events-none"></div>

                <div className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto z-10 custom-scrollbar">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="text-gray-400 mt-2">Manage users and system settings</p>
                        </div>
                        <div className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl border border-blue-500/20 text-sm font-medium">
                            {users.length} Total Users
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="bg-[#1a1f2e]/50 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 bg-white/5">
                                            <th className="p-4 pl-6 font-semibold text-gray-300">Name</th>
                                            <th className="p-4 font-semibold text-gray-300">Email</th>
                                            <th className="p-4 font-semibold text-gray-300">Role</th>
                                            <th className="p-4 font-semibold text-gray-300">Joined Date</th>
                                            <th className="p-4 pr-6 font-semibold text-gray-300 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                <td className="p-4 pl-6">
                                                    <div className="font-medium text-white">{user.name}</div>
                                                </td>
                                                <td className="p-4 text-gray-400">{user.email}</td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${user.role === 'admin'
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        }`}>
                                                        {user.role === 'admin' ? 'Admin' : 'User'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-500 text-sm">
                                                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="p-4 pr-6 text-right flex items-center justify-end gap-2">
                                                    {user._id !== currentUser?._id && (
                                                        <>
                                                            {/* Promote/Demote Button */}
                                                            <button
                                                                onClick={() => handleUpdateRole(user._id, user.role)}
                                                                title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                                                className={`p-2 rounded-lg transition-colors border ${user.role === 'admin'
                                                                    ? 'text-orange-400 border-orange-500/20 hover:bg-orange-500/10'
                                                                    : 'text-purple-400 border-purple-500/20 hover:bg-purple-500/10'
                                                                    }`}
                                                            >
                                                                {user.role === 'admin' ? (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                                                                ) : (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>
                                                                )}
                                                            </button>

                                                            {/* Delete Button */}
                                                            <button
                                                                onClick={() => handleDeleteUser(user._id, user.name)}
                                                                title="Delete User"
                                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-transparent hover:border-red-500/20 rounded-lg transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M3 6h18" />
                                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                                    No users found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
