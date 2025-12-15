export default function LandingFooter() {
    return (
        <footer className="border-t border-white/5 bg-[#0f1014] py-12">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.94-.94 2.56-.27 2.56 1.06v11.38c0 1.33-1.62 2-2.56 1.06z" />
                        </svg>
                    </div>
                    <span className="font-bold text-gray-300">Meet-io</span>
                </div>

                <div className="flex gap-8 text-sm text-gray-500">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-white transition-colors">Figma</a>
                    <a href="#" className="hover:text-white transition-colors">GitHub</a>
                </div>

                <p className="text-gray-600 text-sm">© 2025 Meet-io Inc.</p>
            </div>
        </footer>
    );
}
