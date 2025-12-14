
import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Camera, Shield, User as UserIcon, LogOut, Trash2, Smartphone, Terminal } from 'lucide-react';
import ImageCropper from '../components/profile/ImageCropper';

export default function ProfilePage() {
    const { user, logout } = useAuth(); // login is effectively 'setUser' for us if we update the user object
    const [activeTab, setActiveTab] = useState<'overview' | 'security'>('overview');

    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [title, setTitle] = useState(user?.title || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [isLoading, setIsLoading] = useState(false);

    // Avatar State
    const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Security State
    const [sessions, setSessions] = useState<any[]>([]);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setTitle(user.title || '');
            setBio(user.bio || '');
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'security') {
            fetchSessions();
        }
    }, [activeTab]);

    const fetchSessions = async () => {
        try {
            const data = await userAPI.getSessions();
            if (data.success) {
                setSessions(data.sessions);
            }
        } catch (error) {
            console.error('Failed to fetch sessions');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setAvatarSrc(reader.result?.toString() || null);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setShowCropper(false);
        const formData = new FormData();
        formData.append('avatar', croppedBlob);

        try {
            const data = await userAPI.uploadAvatar(formData);
            if (data.success) {
                toast.success('Avatar updated!');
                // Update local user context (hacky refresh)
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to upload avatar');
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await userAPI.updateProfile({ name, title, bio });
            if (data.success) {
                toast.success('Profile updated successfully');
                // ideally update context here without reload
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Update failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }

        try {
            const data = await userAPI.updatePassword({ currentPassword, newPassword });
            if (data.success) {
                toast.success('Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to change password');
        }
    };

    const handleLogoutAll = async () => {
        if (!window.confirm("Are you sure you want to log out of all other devices?")) return;
        try {
            await userAPI.logoutAllSessions();
            toast.success('Logged out of all other devices');
            fetchSessions();
        } catch (error: any) {
            toast.error('Failed to logout sessions');
        }
    };

    const handleDeleteAccount = async () => {
        // Double confirmation
        if (!window.confirm("⚠️ WARNING: This will permanently delete your account and all your data. This action cannot be undone. Are you sure?")) {
            return;
        }

        try {
            const data = await userAPI.deleteAccount();
            if (data.success) {
                toast.success('Account deleted successfully');
                // Clear any local state and redirect to login
                window.location.href = '/login';
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete account');
        }
    };

    return (
        <div className="bg-[#0B0E14] text-white h-screen flex overflow-hidden font-['Inter']">
            <Sidebar />

            <main className="flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-900/10 blur-[120px] pointer-events-none"></div>

                <div className="flex-1 px-4 sm:px-8 py-8 overflow-y-auto z-10 custom-scrollbar">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Profile Settings</h1>
                        <p className="text-gray-400 mt-2">Manage your account and security preferences</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Avatar & Basic Info Card */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-[#1a1f2e]/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex flex-col items-center text-center">
                                <div className="relative group cursor-pointer mb-4">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#0B0E14] shadow-xl">
                                        <img
                                            src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Camera className="text-white" size={24} />
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                                <h2 className="text-xl font-bold">{user?.name}</h2>
                                <p className="text-gray-400 text-sm">{user?.email}</p>
                                <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${user?.role === 'admin'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                    {user?.role.toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Information & Security */}
                        <div className="lg:col-span-2">
                            {/* Tabs */}
                            <div className="flex gap-4 border-b border-white/10 mb-6">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'overview' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Overview
                                    {activeTab === 'overview' && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === 'security' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Security
                                    {activeTab === 'security' && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></div>
                                    )}
                                </button>
                            </div>

                            {/* Overview Content */}
                            {activeTab === 'overview' && (
                                <form onSubmit={handleProfileUpdate} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="bg-[#1a1f2e]/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <UserIcon size={20} className="text-blue-400" />
                                            Personal Information
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Job Title</label>
                                                <input
                                                    type="text"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder="Software Engineer"
                                                    className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                                />
                                            </div>
                                            <div className="col-span-1 md:col-span-2 space-y-2">
                                                <label className="text-sm text-gray-400">Bio</label>
                                                <textarea
                                                    value={bio}
                                                    onChange={(e) => setBio(e.target.value)}
                                                    rows={4}
                                                    placeholder="Tell us a little about yourself..."
                                                    className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
                                            >
                                                {isLoading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* Security Content */}
                            {activeTab === 'security' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

                                    {/* Change Password */}
                                    <div className="bg-[#1a1f2e]/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Shield size={20} className="text-green-400" />
                                            Change Password
                                        </h3>
                                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-400">Current Password</label>
                                                <input
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500/50 transition-colors"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm text-gray-400">New Password</label>
                                                    <input
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500/50 transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm text-gray-400">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500/50 transition-colors"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-2 flex justify-end">
                                                <button type="submit" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
                                                    Update Password
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Active Sessions */}
                                    <div className="bg-[#1a1f2e]/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                                <Smartphone size={20} className="text-blue-400" />
                                                Active Sessions
                                            </h3>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to log out?')) {
                                                            logout();
                                                        }
                                                    }}
                                                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
                                                >
                                                    <LogOut size={14} /> Log Out Current Device
                                                </button>
                                                <button
                                                    onClick={handleLogoutAll}
                                                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                                >
                                                    <Shield size={14} /> Log Out All Other Devices
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {sessions.length === 0 ? (
                                                <p className="text-gray-500 text-sm">No active session data found.</p>
                                            ) : (
                                                sessions.map((session, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-[#0B0E14] rounded-xl border border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                                <Terminal size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-white truncate max-w-[200px]">
                                                                    {session.userAgent || 'Unknown Device'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {session.current ? 'Active Now' : new Date(session.lastActive).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {session.current && (
                                                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="bg-red-500/5 backdrop-blur-md rounded-2xl border border-red-500/20 p-6 space-y-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2 text-red-500">
                                            <Trash2 size={20} />
                                            Danger Zone
                                        </h3>
                                        <p className="text-gray-400 text-sm">Deleting your account is irreversible. All your data will be wiped.</p>

                                        <div className="flex gap-4 items-center pt-2">
                                            <input
                                                type="text"
                                                placeholder='Type "DELETE" to confirm'
                                                value={deleteConfirm}
                                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                                className="bg-[#0B0E14] border border-red-500/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-500/50"
                                            />
                                            <button
                                                disabled={deleteConfirm !== 'DELETE'}
                                                onClick={handleDeleteAccount}
                                                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Cropper Modal */}
                {showCropper && avatarSrc && (
                    <ImageCropper
                        imageSrc={avatarSrc}
                        onCancel={() => setShowCropper(false)}
                        onCropComplete={handleCropComplete}
                    />
                )}
            </main>
        </div>
    );
}
