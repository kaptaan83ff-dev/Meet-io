

// Ambient Background Component based on docs/background.html
export default function AmbientBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#121212]">
            {/* Ambient Background Glows */}

            {/* Glow 1: Top Left - Blue/Purple */}
            <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-drift"
                style={{ background: 'radial-gradient(circle, #4f46e5, #0000)' }}>
            </div>

            {/* Glow 2: Bottom Right - Pink/Rose */}
            <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-drift"
                style={{ background: 'radial-gradient(circle, #ec4899, #0000)' }}>
            </div>

            {/* Glow 3: Center - Cyan */}
            <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-drift"
                style={{ background: 'radial-gradient(circle, #06b6d4, #0000)' }}>
            </div>
        </div>
    );
}
