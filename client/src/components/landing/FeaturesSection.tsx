export default function FeaturesSection() {
    return (
        <section id="features" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need to <br />collaborate remotely.</h2>
                    <p className="text-gray-400">Our dashboard is designed to get you into meetings faster, with less friction and more focus.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="group bg-[#13151b] border border-white/10 p-8 rounded-3xl hover:border-orange-500/50 transition-colors">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Instant Meetings</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">Launch a room in one click. No waiting rooms, no software updates. Just pure connection.</p>
                    </div>

                    {/* Feature 2 */}
                    <div className="group bg-[#13151b] border border-white/10 p-8 rounded-3xl hover:border-blue-500/50 transition-colors">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Smart Scheduling</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">Plan ahead with built-in calendar syncing. Send invites that actually get accepted.</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="group bg-[#13151b] border border-white/10 p-8 rounded-3xl hover:border-green-500/50 transition-colors">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold mb-3">Secure by Design</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">End-to-end encryption and generated meeting codes ensure your conversations stay private.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
