import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen bg-[#0B0E14]">
            <Sidebar />

            <main className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

                    {/* User Profile Section */}
                    <div className="rounded-2xl bg-[#151921] border border-white/10 p-8 mb-6">
                        <h2 className="text-xl font-bold text-white mb-6">Profile</h2>
                        <div className="flex items-center gap-6 mb-6">
                            <img
                                src={user?.avatar}
                                alt={user?.name}
                                className="w-20 h-20 rounded-full border-2 border-blue-500/30"
                            />
                            <div>
                                <p className="text-lg font-semibold text-white">{user?.name}</p>
                                <p className="text-slate-400">{user?.email}</p>
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm">Profile editing coming soon</p>
                    </div>

                    {/* Settings Sections (Placeholder) */}
                    <div className="space-y-6">
                        {['Notifications', 'Privacy & Security', 'Video & Audio', 'Integrations'].map((section) => (
                            <div key={section} className="rounded-2xl bg-[#151921] border border-white/10 p-8">
                                <h2 className="text-xl font-bold text-white mb-2">{section}</h2>
                                <p className="text-slate-400">Configure your {section.toLowerCase()} preferences</p>
                                <p className="text-slate-500 text-sm mt-4">Coming Soon</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
