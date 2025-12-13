import Sidebar from '../components/Sidebar';
import DashboardRightSidebar from '../components/DashboardRightSidebar';
import { useAuth } from '../context/AuthContext';
import NewMeetingCard from '../components/dashboard/NewMeetingCard';
import JoinMeetingCard from '../components/dashboard/JoinMeetingCard';
import ScheduleMeetingCard from '../components/dashboard/ScheduleMeetingCard';
import { useState } from 'react';

export default function DashboardPage() {
    const { user } = useAuth();
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();

    // Sidebar toggle logic for mobile (using simple state)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="bg-transparent text-white h-screen flex overflow-hidden selection:bg-orange-500 selection:text-white font-['Inter']">
            {/* MOBILE SIDEBAR BACKDROP */}
            <div
                id="sidebarBackdrop"
                onClick={() => setIsSidebarOpen(false)}
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}
            ></div>

            {/* Injected Sidebar Logic: We need to pass isOpen/close props or handle it via context if we strictly followed the HTML monolithic file. 
                For now, we assume Sidebar.tsx is mounted. 
                Wait, Sidebar.tsx has 'hidden lg:flex' in my previous edit? 
                Let's check if Sidebar.tsx supports mobile toggle. The HTML sidebar has 'fixed inset-y-0... transform -translate-x-full...'.
                The previous Sidebar.tsx I wrote in Step 712 has 'fixed... lg:static'. 
                I need to make sure the sidebar in Sidebar.tsx responds to the toggle.
                But the Sidebar component is self-contained. 
                I will allow the Sidebar to be controlled or just rely on CSS if the classes match.
            */}
            <Sidebar />

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-900/10 blur-[120px] pointer-events-none"></div>

                {/* Header */}
                <header className="flex justify-between items-center px-4 sm:px-8 py-6 z-10">
                    <div className="flex items-center gap-4">
                        {/* Hamburger Menu (Mobile/Tablet Only) */}
                        <button onClick={() => {
                            // Minimal hack to toggle sidebar if not using Context
                            const sidebar = document.getElementById('sidebar');
                            const backdrop = document.getElementById('sidebarBackdrop');
                            if (sidebar) {
                                sidebar.classList.toggle('-translate-x-full');
                                if (backdrop) {
                                    backdrop.classList.toggle('hidden');
                                    setTimeout(() => backdrop.classList.toggle('opacity-0'), 10);
                                }
                            }
                        }} className="lg:hidden p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div>
                            <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1 hidden sm:block">{currentDate}</p>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Good morning, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-400">{user?.name}</span></h1>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex gap-2 sm:gap-4">
                        <button className="p-2.5 text-gray-400 bg-white/5 hover:bg-white/10 rounded-full transition-colors hidden sm:flex">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </button>
                        {/* Show Calendar Toggle on Mobile since Right Sidebar is hidden */}
                        <button className="p-2.5 text-gray-400 bg-white/5 hover:bg-white/10 rounded-full transition-colors xl:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </button>
                        <button className="p-2.5 text-gray-400 bg-white/5 hover:bg-white/10 rounded-full transition-colors hidden sm:flex">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                    </div>
                </header>

                {/* Content Body */}
                <div className="flex-1 px-4 sm:px-8 py-4 overflow-y-auto z-10 custom-scrollbar">

                    {/* RESPONSIVE ACTION CARDS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        <NewMeetingCard />
                        <JoinMeetingCard />
                        <ScheduleMeetingCard />
                    </div>

                    {/* Recent Rooms */}
                    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <h3 className="flex items-center gap-2 text-gray-400 font-semibold mb-4 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Recent Rooms
                        </h3>
                        <div className="w-full h-48 rounded-[2rem] border border-dashed border-gray-700 bg-gray-800/30 flex flex-col items-center justify-center gap-4 text-center px-4">
                            <div className="h-12 w-12 bg-gray-700/50 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21l-3-3m0 0l-3 3m3-3V15" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm">No recent meetings</p>
                            <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Create Your First Meeting
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <DashboardRightSidebar />
        </div>
    );
}
