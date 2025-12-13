import Sidebar from '../components/Sidebar';

export default function MessagesPage() {
    return (
        <div className="flex min-h-screen bg-[#0B0E14]">
            <Sidebar />
            <main className="flex-1 p-8 text-white flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold mb-2">Messages</h1>
                <p className="text-gray-400 max-w-md text-center">
                    The messaging system is currently under development. Check back soon for real-time chat and team collaboration features.
                </p>
                <div className="mt-8 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium border border-blue-500/20">
                    Coming Soon
                </div>
            </main>
        </div>
    );
}
