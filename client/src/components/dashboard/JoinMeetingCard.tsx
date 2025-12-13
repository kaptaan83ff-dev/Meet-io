import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function JoinMeetingCard() {
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const handleJoinMeeting = async (e?: FormEvent) => {
        e?.preventDefault();
        const codeToJoin = joinCode.trim().toLowerCase();
        if (!codeToJoin) return toast.error('Enter code');

        setIsJoining(true);
        try {
            const response = await meetingAPI.join({ code: codeToJoin });
            if (response.success) {
                toast.success('Joining...');
                navigate(`/meeting/${response.meeting.code}`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="relative w-full h-[240px] rounded-[2rem] overflow-hidden group bg-gradient-to-br from-blue-600 to-cyan-500 p-6 flex flex-col justify-between hover:shadow-[0_20px_50px_-12px_rgba(50,150,255,0.4)] transition-all duration-300">
            <div className="absolute inset-0 bg-noise opacity-20 mix-blend-soft-light"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Join Meeting</h2>
                <p className="text-blue-50/70 text-sm mt-1">Connect via code or link</p>
            </div>

            <div className="relative z-10">
                <form onSubmit={handleJoinMeeting} className="flex flex-wrap gap-2">
                    <input
                        type="text"
                        placeholder="# Enter code"
                        value={joinCode}
                        onChange={(e) => {
                            const val = e.target.value;
                            // Check for full URL regex (e.g. .../meeting/ABC-DEF-GHI)
                            const urlMatch = val.match(/\/meeting\/([a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3})/i);

                            if (urlMatch && urlMatch[1]) {
                                // Extract, trim, and lowercase the code
                                setJoinCode(urlMatch[1].trim().toLowerCase());
                                toast.success('Meeting code extracted!');
                            } else {
                                // Normal input
                                setJoinCode(val.toLowerCase());
                            }
                        }}
                        className="flex-1 min-w-0 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-blue-100/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    // Removed maxLength to allow pasting full URLs
                    />
                    <button
                        type="submit"
                        disabled={isJoining}
                        className="bg-white text-blue-600 font-bold px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-70 flex items-center justify-center flex-shrink-0"
                    >
                        {isJoining ? (
                            <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                        ) : (
                            'Join'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
