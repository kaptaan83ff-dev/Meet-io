export default function LogoCloud() {
    return (
        <div className="border-y border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">
                    Powering modern teams at
                </p>
                <div className="flex flex-wrap justify-center gap-12 lg:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Simple SVG Placeholders for Logos matching HTML */}
                    <svg className="h-8" viewBox="0 0 100 30" fill="currentColor">
                        <path d="M10,15 L20,5 L30,15 L40,5 L50,15 L60,5 L70,15 L80,5 L90,15" stroke="white" strokeWidth="3" fill="none" />
                    </svg>
                    <svg className="h-8" viewBox="0 0 100 30" fill="currentColor">
                        <circle cx="15" cy="15" r="10" fill="white" />
                        <rect x="35" y="10" width="50" height="10" fill="white" />
                    </svg>
                    <svg className="h-8" viewBox="0 0 100 30" fill="currentColor">
                        <rect x="10" y="5" width="20" height="20" fill="white" />
                        <rect x="40" y="5" width="20" height="20" fill="white" />
                        <rect x="70" y="5" width="20" height="20" fill="white" />
                    </svg>
                    <svg className="h-8" viewBox="0 0 100 30" fill="currentColor">
                        <path d="M10,25 Q25,5 40,25 T70,25 T100,25" stroke="white" strokeWidth="3" fill="none" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
