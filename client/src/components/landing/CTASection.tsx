export default function CTASection() {
    return (
        <section id="CTASection" className="py-24 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">Ready to clear the clutter?</h2>
                <p className="text-xl text-gray-400 mb-10">Join thousands of users who have switched to a faster, cleaner meeting experience.</p>

                <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                    >
                        Get Started Free
                    </button>
                </form>
                {/*
                <p className="text-xs text-gray-500 mt-4">No credit card required. Cancel anytime.</p>                
                  */}
            </div>

            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] z-0 pointer-events-none" />
        </section>
    );
}
