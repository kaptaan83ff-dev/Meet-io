import Sidebar from '../components/Sidebar';

export default function RecordingsPage() {
    return (
        <div className="flex min-h-screen bg-[#0B0E14]">
            <Sidebar />

            <main className="flex-1 overflow-auto p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-6">Recordings</h1>

                    <div className="rounded-2xl bg-[#151921] border border-white/10 p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Meeting Recordings</h2>
                            <p className="text-slate-400">
                                Access and manage your recorded meetings
                            </p>
                            <p className="text-slate-500 text-sm mt-4">Coming Soon</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
