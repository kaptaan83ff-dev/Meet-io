import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function NewMeetingCard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [meetingData, setMeetingData] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const handleInstantStart = async () => {
        setIsCreating(true);
        try {
            const response = await meetingAPI.create({ title: `${user?.name}'s Meeting` });
            if (response.success) {
                toast.success('Meeting created!');
                navigate(`/meeting/${response.meeting.code}`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to create meeting');
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreateForLater = async () => {
        setIsCreating(true);
        try {
            const response = await meetingAPI.create({ title: `${user?.name}'s Meeting` });
            if (response.success) {
                setMeetingData(response.meeting);
                setShowModal(true);
                toast.success('Meeting created!');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to create meeting');
        } finally {
            setIsCreating(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const meetingLink = meetingData ? `${window.location.origin}/meeting/${meetingData.code}` : '';

    return (
        <>
            {/* Orange Card Matches HTML */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-1 group relative w-full h-auto min-h-[240px] rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_-12px_rgba(255,100,50,0.4)] hover:-translate-y-1 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF4D00] via-[#FF6A00] to-[#E63600] transition-all duration-500 group-hover:scale-110"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full blur-3xl opacity-40 mix-blend-overlay animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-30 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-noise opacity-30 mix-blend-soft-light"></div>

                <div className="relative h-full flex flex-col p-1.5">
                    {/* Top Zone */}
                    <div onClick={handleInstantStart} className={`flex-1 relative flex flex-col justify-between p-5 rounded-t-[28px] rounded-b-xl hover:bg-white/10 transition-colors duration-300 border border-white/10 group-hover:border-white/20 min-h-[140px] ${isCreating ? 'opacity-70 pointer-events-none' : ''}`}>
                        <div className="absolute inset-0 backdrop-blur-sm rounded-[28px] -z-10"></div>
                        <div className="flex justify-between items-start">
                            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner border border-white/10">
                                {isCreating ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                )}
                            </div>
                            <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 bg-white/20 p-1.5 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">New Meeting</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                <p className="text-orange-50 text-xs font-medium opacity-90">Instant Start</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-1.5"></div>

                    {/* Bottom Zone */}
                    <button onClick={(e) => { e.stopPropagation(); handleCreateForLater(); }} disabled={isCreating} className="h-[72px] relative w-full flex items-center justify-between px-5 rounded-b-[28px] rounded-t-xl border border-white/10 hover:bg-white/20 active:scale-[0.98] transition-all duration-200 group/btn">
                        <div className="absolute inset-0 backdrop-blur-md rounded-b-[28px] rounded-t-xl -z-10 bg-black/10"></div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            </div>
                            <div className="text-left">
                                <span className="block text-white text-sm font-bold tracking-wide">Create for later</span>
                                <span className="block text-white/70 text-[11px]">Get a shareable link</span>
                            </div>
                        </div>
                        <div className="bg-white/10 p-2 rounded-lg group-hover/btn:bg-white group-hover/btn:text-orange-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        </div>
                    </button>
                </div>
            </div>

            {/* Modal - Matching HTML logic but mapped to React State */}
            {showModal && meetingData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-[#1e2028] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-fade-in">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold text-white">Here's your joining info</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">Send this to people you want to meet with. Be sure to save it so you can use it later, too.</p>
                        <div className="bg-[#13151b] rounded-xl flex items-center justify-between p-1.5 pl-4 border border-white/5">
                            <span className="text-sm text-gray-300 truncate select-all">{meetingLink}</span>
                            <button onClick={() => copyToClipboard(meetingLink)} className={`p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all ml-2 flex-shrink-0 ${copied ? 'text-green-500' : ''}`}>
                                {copied ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
