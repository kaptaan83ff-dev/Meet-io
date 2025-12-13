export default function HowItWorks() {
    return (
        <section id="HowItWorks" className="py-24 border-y border-white/5 bg-white/[0.01]">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6">Create for later, <br />or start right now.</h2>
                        <p className="text-gray-400 mb-8 text-lg">Whether you're planning a quarterly review or a quick sync, our "Split Action" interface puts the control in your hands.</p>

                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mt-1">1</div>
                                <div>
                                    <h4 className="font-bold">Generate a Link</h4>
                                    <p className="text-gray-500 text-sm mt-1">One click copies a unique, secure URL to your clipboard.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mt-1">2</div>
                                <div>
                                    <h4 className="font-bold">Share with Teammates</h4>
                                    <p className="text-gray-500 text-sm mt-1">Paste it in Slack, Email, or SMS. Anyone can join via browser.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mt-1">3</div>
                                <div>
                                    <h4 className="font-bold">Collaborate</h4>
                                    <p className="text-gray-500 text-sm mt-1">Screen sharing, whiteboard, and recording included.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="lg:w-1/2 relative">
                        {/* Abstract representation of the "Create for Later" modal */}
                        <div className="absolute inset-0 bg-blue-500/20 blur-[80px]" />
                        <div className="relative bg-[#1e2028] border border-white/10 rounded-2xl p-8 max-w-md mx-auto shadow-2xl">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-semibold text-white">Here's your joining info</h3>
                                <div className="text-gray-400">✕</div>
                            </div>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Send this to people you want to meet with. Be sure to save it so you can use it later, too.
                            </p>
                            <div className="bg-[#13151b] rounded-xl flex items-center justify-between p-3 pl-4 border border-white/5">
                                <span className="text-sm text-gray-300">meet.ui/abc-def-ghi</span>
                                <div className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
