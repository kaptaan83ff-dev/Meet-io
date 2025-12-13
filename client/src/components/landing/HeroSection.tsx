import { Link } from 'react-router-dom';

export default function HeroSection() {
    return (
        // HERO HEIGHT: Adjust pt-XX (top padding) and pb-XX (bottom padding) to change height
        // Current: pt-32 pb-24 (mobile), lg:pt-52 lg:pb-40 (desktop) - increased ~1.2cm
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Hero Background Gradient - Smooth Blue Glow */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0B0E14] to-[#0B0E14]" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />

            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                {/* Hero Content */}
                <div className="max-w-2xl">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-300 mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                        Meet.io
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                        Meetings that <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 animate-gradient">
                            actually flow.
                        </span>
                    </h1>

                    <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-lg">
                        Experience crystal clear video, instant sharing, and a dashboard designed for focus. No downloads required.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/login"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold text-lg transition-all shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2"
                        >
                            Start a Meeting
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                        <a
                            href="#features"
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Watch Demo
                        </a>
                    </div>
                    {/* Trusted By section */}
                    <div className="mt-10 flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full border border-white/10 bg-transparent"></div>
                            <div className="w-10 h-10 rounded-full border border-white/10 bg-transparent"></div>
                            <div className="w-10 h-10 rounded-full border border-white/10 bg-transparent"></div>
                        </div>
                        <p>. . .</p>
                    </div>

                </div>

                {/* Hero Visual - 3D Dashboard Mockup */}
                <div className="hidden lg:block hero-perspective">
                    <div className="hero-dashboard relative bg-[#13151b] border border-white/10 rounded-3xl p-4 w-full aspect-[16/10]">
                        {/* Mockup Header */}
                        <div className="flex items-center gap-4 mb-6 px-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <div className="h-2 w-32 bg-white/10 rounded-full ml-4" />
                        </div>

                        {/* Mockup Grid */}
                        <div className="grid grid-cols-3 gap-4 h-[calc(100%-3rem)]">
                            {/* Orange Card */}
                            <div className="bg-gradient-to-br from-[#FF4D00] to-[#E63600] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                                <div className="w-12 h-12 bg-white/20 rounded-xl mb-4" />
                                <div className="h-4 w-24 bg-white/40 rounded mb-2" />
                                <div className="h-2 w-16 bg-white/20 rounded" />
                            </div>
                            {/* Blue Card */}
                            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                                <div className="w-12 h-12 bg-white/20 rounded-xl mb-4" />
                                <div className="h-4 w-24 bg-white/40 rounded mb-2" />
                                <div className="h-10 w-full bg-black/20 rounded mt-4" />
                            </div>
                            {/* Sidebar Mockup */}
                            <div className="bg-[#1e2028] rounded-2xl p-4 flex flex-col gap-4">
                                <div className="h-20 bg-blue-500/10 border-l-2 border-blue-500 rounded p-2" />
                                <div className="h-20 bg-white/5 rounded p-2" />
                                <div className="h-20 bg-white/5 rounded p-2" />
                            </div>
                        </div>

                        {/* Reflection Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none rounded-3xl" />
                    </div>
                </div>
            </div>
        </section>
    );
}
