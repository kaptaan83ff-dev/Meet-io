import { Link } from 'react-router-dom';

export default function LandingHeader() {
    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0f1014]/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.94-.94 2.56-.27 2.56 1.06v11.38c0 1.33-1.62 2-2.56 1.06z" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight">Meet.io</span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#HowItWorks" className="hover:text-white transition-colors">How it Works</a>
                         <a href="#CTASection" className="hover:text-white transition-colors">Contact Us</a>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-4">
                    <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Sign in
                    </Link>
                    <Link to="/login" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
}
