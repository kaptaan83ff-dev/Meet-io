import Sidebar from '../components/Sidebar';
import DashboardRightSidebar from '../components/DashboardRightSidebar';
import { useAuth } from '../context/AuthContext';
import NewMeetingCard from '../components/dashboard/NewMeetingCard';
import JoinMeetingCard from '../components/dashboard/JoinMeetingCard';
import ScheduleMeetingCard from '../components/dashboard/ScheduleMeetingCard';
import RecentRooms from '../components/dashboard/RecentRooms';
import { useState } from 'react';

export default function DashboardPage() {
    const { user } = useAuth();
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();

    // Sidebar toggle logic for mobile (using simple state)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Dynamic greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        if (hour < 21) return 'Good evening';
        return 'Good night';
    };

    return (
        <div className="bg-transparent text-white h-screen flex overflow-hidden selection:bg-orange-500 selection:text-white font-['Inter']">
            {/* MOBILE SIDEBAR BACKDROP */}
            <div
                id="sidebarBackdrop"
                onClick={() => setIsSidebarOpen(false)}
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}
            ></div>

            {/* Sidebar with state-controlled toggle */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* MAIN CONTENT - Follows scroll best practices */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden h-screen">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-900/10 blur-[120px] pointer-events-none"></div>

                {/* Header */}
                <header className="flex justify-between items-center px-4 sm:px-8 py-6 z-10">
                    <div className="flex items-center gap-4">
                        {/* Hamburger Menu (Mobile/Tablet Only) */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white bg-white/5 rounded-lg"
                            aria-label="Open navigation menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div>
                            <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1 hidden sm:block">{currentDate}</p>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{getGreeting()}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-400">{user?.name}</span></h1>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex gap-2 sm:gap-4">
                        <button
                            className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 bg-white/5 hover:bg-white/10 rounded-full transition-colors hidden sm:flex"
                            aria-label="Search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </button>
                        {/* Show Calendar Toggle on Mobile since Right Sidebar is hidden */}
                        <button
                            onClick={() => window.location.href = '/calendar'}
                            className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 bg-white/5 hover:bg-white/10 rounded-full transition-colors xl:hidden"
                            aria-label="Open calendar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </button>
                        <button
                            className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 bg-white/5 hover:bg-white/10 rounded-full transition-colors hidden sm:flex"
                            aria-label="Notifications"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                    </div>
                </header>

                {/* Content Body */}
                <div className="flex-1 px-4 sm:px-8 py-4 z-10 custom-scrollbar max-w-full">

                    {/* RESPONSIVE ACTION CARDS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        <NewMeetingCard />
                        <JoinMeetingCard />
                        <ScheduleMeetingCard />
                    </div>

                    {/* Recent Rooms - Last 4 */}
                    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <h3 className="flex items-center gap-2 text-gray-400 font-semibold mb-4 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Recent Rooms
                        </h3>
                        <RecentRooms />
                    </div>
                </div>
            </main>

            <DashboardRightSidebar />
        </div>
    );
}
