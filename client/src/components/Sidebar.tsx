import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();

    // User initial for the bottom avatar
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <aside id="sidebar" className="fixed inset-y-0 left-0 z-50 w-24 bg-black/20 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-6 gap-8 transform -translate-x-full transition-transform duration-300 lg:translate-x-0 lg:static lg:w-20 shadow-2xl lg:shadow-none">

            {/* Mobile Close Button (Hidden on Desktop) */}
            <button className="lg:hidden p-2 text-gray-400 hover:text-white absolute top-2 right-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Logo */}
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-105 transition-transform mt-8 lg:mt-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.94-.94 2.56-.27 2.56 1.06v11.38c0 1.33-1.62 2-2.56 1.06z" />
                </svg>
            </div>

            {/* Nav Items */}
            <nav className="flex flex-col gap-6 w-full items-center">
                <NavLink to="/dashboard" className={({ isActive }) => `p-3 rounded-xl transition-all relative group ${isActive ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    {({ isActive }) => (
                        <>
                            {isActive && <div className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full -translate-x-4 opacity-100 lg:-translate-x-4 lg:-translate-x-6"></div>}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </>
                    )}
                </NavLink>

                <NavLink to="/messages" className={({ isActive }) => `p-3 rounded-xl transition-all relative group ${isActive ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    {({ isActive }) => (
                        <>
                            {isActive && <div className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full -translate-x-4 opacity-100 lg:-translate-x-4 lg:-translate-x-6"></div>}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </>
                    )}
                </NavLink>

                <NavLink to="/calendar" className={({ isActive }) => `p-3 rounded-xl transition-all relative group ${isActive ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    {({ isActive }) => (
                        <>
                            {isActive && <div className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full -translate-x-4 opacity-100 lg:-translate-x-4 lg:-translate-x-6"></div>}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </>
                    )}
                </NavLink>

                {/* History / Clock Icon */}
                <NavLink to="/history" className={({ isActive }) => `p-3 rounded-xl transition-all relative group ${isActive ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                    {({ isActive }) => (
                        <>
                            {isActive && <div className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full -translate-x-4 opacity-100 lg:-translate-x-4 lg:-translate-x-6"></div>}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </>
                    )}
                </NavLink>

                {/* Admin Panel (Admin Only) */}
                {user?.role === 'admin' && (
                    <NavLink to="/admin" className={({ isActive }) => `p-3 rounded-xl transition-all relative group ${isActive ? 'text-purple-500 bg-purple-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 w-1 h-8 bg-purple-500 rounded-r-full -translate-x-4 opacity-100 lg:-translate-x-4 lg:-translate-x-6"></div>}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </>
                        )}
                    </NavLink>
                )}
            </nav>

            <div className="flex-1"></div>

            {/* Logout Button */}
            <button
                onClick={logout}
                className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all relative group mb-2"
                title="Log Out"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>

            {/* User Avatar / Profile - Click to go to Profile */}
            <NavLink
                to="/profile"
                className={({ isActive }) => `h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border transition-colors mb-4 lg:mb-0 ${isActive
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-700 border-white/10 hover:border-blue-500 text-white'
                    }`}
                title="Profile Settings"
            >
                {userInitial}
            </NavLink>
        </aside>
    );
}
