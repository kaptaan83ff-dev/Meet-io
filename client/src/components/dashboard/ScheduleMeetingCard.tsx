import { useNavigate } from 'react-router-dom';

export default function ScheduleMeetingCard() {
    const navigate = useNavigate();

    const handleSchedule = () => {
        navigate('/schedule');
    };

    return (
        <div className="relative w-full h-[240px] rounded-[2rem] overflow-hidden group bg-gradient-to-br from-emerald-500 to-green-600 p-6 flex flex-col justify-between hover:shadow-[0_20px_50px_-12px_rgba(50,255,100,0.3)] transition-all duration-300 cursor-pointer" onClick={handleSchedule}>
            <div className="absolute inset-0 bg-noise opacity-20 mix-blend-soft-light"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Schedule Meeting</h2>
                <p className="text-green-50/80 text-sm mt-1 max-w-[180px]">Plan a meeting for later.</p>
            </div>
            <div className="relative z-10 self-end">
                <span className="bg-black/20 backdrop-blur-md text-white/90 text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10">Plan Ahead</span>
            </div>
        </div>
    );
}
