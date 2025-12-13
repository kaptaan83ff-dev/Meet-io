import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingAPI } from '../../services/api';
import { Clock, Video, Users } from 'lucide-react';

interface Meeting {
    _id: string;
    code: string;
    title: string;
    startTime: string;
    duration: number;
    participantCount: number;
    status: string;
}

export default function RecentRooms() {
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentMeetings = async () => {
            try {
                // Fetch meeting history and take only the first 4
                const data = await meetingAPI.getMeetingHistory(1);
                if (data.success) {
                    setMeetings(data.meetings.slice(0, 4));
                }
            } catch (error) {
                console.error('Failed to fetch recent meetings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecentMeetings();
    }, []);

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="w-full h-48 rounded-[2rem] border border-dashed border-gray-700 bg-gray-800/30 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (meetings.length === 0) {
        return (
            <div className="w-full h-48 rounded-[2rem] border border-dashed border-gray-700 bg-gray-800/30 flex flex-col items-center justify-center gap-4 text-center px-4">
                <div className="h-12 w-12 bg-gray-700/50 rounded-full flex items-center justify-center">
                    <Video className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-gray-500 text-sm">No recent meetings</p>
                <button
                    onClick={() => navigate('/schedule')}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Create Your First Meeting
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {meetings.map((meeting) => (
                <div
                    key={meeting._id}
                    className="bg-[#1a1f2e]/50 hover:bg-[#1a1f2e]/80 border border-white/5 hover:border-white/10 rounded-2xl p-4 cursor-pointer transition-all duration-200 group"
                    onClick={() => navigate(`/meeting/${meeting.code}`)}
                >
                    <div className="flex items-start justify-between mb-3">
                        <h4 className="text-white font-medium text-sm truncate flex-1 pr-2 group-hover:text-blue-400 transition-colors">
                            {meeting.title}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${meeting.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                meeting.status === 'ended' ? 'bg-gray-500/20 text-gray-400' :
                                    'bg-blue-500/20 text-blue-400'
                            }`}>
                            {meeting.status === 'active' ? 'Live' : meeting.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(meeting.startTime)} • {formatTime(meeting.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users size={12} />
                            {meeting.participantCount || 1}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
