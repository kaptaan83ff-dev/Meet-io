import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { meetingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Meeting {
    _id: string;
    title: string;
    code: string;
    startTime: string;
    duration: number;
    status: 'scheduled' | 'active' | 'ended';
    hostId: {
        _id: string;
        name: string;
    };
}

export default function MeetingsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            const data = await meetingAPI.getMyMeetings();
            if (data.success) {
                setMeetings(data.meetings);
            }
        } catch (error: any) {
            console.error('Failed to fetch meetings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = (meeting: Meeting) => {
        navigate(`/meeting/${meeting.code}`);
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex min-h-screen bg-[#0B0E14]">
            <Sidebar />

            <main className="flex-1 overflow-auto p-6 text-white">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">My Meetings</h1>
                            <p className="text-gray-400 mt-2">Upcoming and past video conferences</p>
                        </div>
                        <button
                            onClick={() => navigate('/schedule')}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Schedule New
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : meetings.length === 0 ? (
                        <div className="rounded-2xl bg-[#151921] border border-white/10 p-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <h2 className="text-xl font-bold mb-2">No meetings found</h2>
                            <p className="text-gray-400 mb-6">You don't have any scheduled meetings yet.</p>
                            <button onClick={() => navigate('/schedule')} className="text-blue-400 hover:text-blue-300 font-medium">Schedule one now &rarr;</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {meetings.map((meeting) => (
                                <div key={meeting._id} className="bg-[#1a1f2e]/50 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/10 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold title-font">{meeting.title}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${meeting.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    meeting.status === 'ended' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="text-gray-400 text-sm flex items-center gap-6">
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {formatTime(meeting.startTime)}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {meeting.duration} min
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                By {meeting.hostId._id === user?._id ? 'You' : meeting.hostId.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/meeting/${meeting.code}`);
                                                toast.success('Meeting link copied');
                                            }}
                                            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            title="Copy Invitation Link"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                        </button>

                                        {meeting.status !== 'ended' && (
                                            <button
                                                onClick={() => handleJoin(meeting)}
                                                className={`px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg ${meeting.hostId._id === user?._id && meeting.status === 'scheduled'
                                                        ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-500/25'
                                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
                                                    }`}
                                            >
                                                {meeting.hostId._id === user?._id && meeting.status === 'scheduled' ? 'Start Meeting' : 'Join'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
