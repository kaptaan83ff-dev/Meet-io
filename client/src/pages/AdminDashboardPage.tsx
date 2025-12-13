import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/landing/LandingHeader';
import { Trash2, User, Mail, Shield, ShieldAlert, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: string;
}

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            toast.error('Unauthorized Access');
            navigate('/dashboard');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            await api.delete(`/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u._id !== userId));
            toast.success('User deleted successfully');
        } catch (error) {
            console.error('Failed to delete user', error);
            toast.error('Failed to delete user');
        }
    };

    const handlePromoteUser = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'user' ? 'admin' : 'user';
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            // Assuming we might add this endpoint later, for now just a placeholder or if it exists
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole as 'user' | 'admin' } : u));
            toast.success(`User role updated to ${newRole}`);
        } catch (error) {
            console.error('Failed to update role', error);
            toast.error('Failed to update role');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0E14] text-white flex items-center justify-center">
                <Loader className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <ShieldAlert className="text-red-500" size={32} />
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">Manage users and system settings</p>
                    </div>
                    <div className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/20">
                        Total Users: <span className="font-bold text-white ml-2">{users.length}</span>
                    </div>
                </div>

                <div className="bg-[#151a23] rounded-xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="p-4 text-gray-400 font-medium">User</th>
                                    <th className="p-4 text-gray-400 font-medium">Role</th>
                                    <th className="p-4 text-gray-400 font-medium">Joined</th>
                                    <th className="p-4 text-gray-400 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((userData) => (
                                    <tr key={userData._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                                    {userData.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{userData.name}</div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Mail size={12} />
                                                        {userData.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${userData.role === 'admin'
                                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                }`}>
                                                {userData.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                                                {userData.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {new Date(userData.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handlePromoteUser(userData._id, userData.role)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                    title={userData.role === 'user' ? "Promote to Admin" : "Demote to User"}
                                                >
                                                    <Shield size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(userData._id)}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
