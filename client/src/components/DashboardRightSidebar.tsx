import { useState, useEffect, useCallback } from 'react';
import { meetingAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, Users, RefreshCw, Plus } from 'lucide-react';

interface Meeting {
    _id: string;
    code: string;
    title: string;
    startTime: string;
    duration: number;
    description?: string;
    status: string;
    attendees?: { email: string }[];
}

export default function DashboardRightSidebar() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Fetch Meetings
    const fetchMeetings = useCallback(async (showLoader = false) => {
        if (showLoader) setLoading(true);
        try {
            const data = await meetingAPI.getMyMeetings();
            if (data.success) {
                // Deduplicate by _id
                const uniqueMeetings = Array.from(
                    new Map(data.meetings.map((m: Meeting) => [m._id, m])).values()
                ) as Meeting[];
                setMeetings(uniqueMeetings);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Failed to fetch meetings for sidebar", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial Fetch
    useEffect(() => {
        fetchMeetings(true);
    }, [fetchMeetings]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchMeetings(false);
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchMeetings]);

    // Helper: Format time
    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Helper: Format date
    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Filter Logic
    const now = new Date();
    const todayStr = now.toDateString();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const filteredMeetings = meetings
        .filter(m => {
            const mDate = new Date(m.startTime);
            const mDateStr = mDate.toDateString();
            const endTime = new Date(mDate.getTime() + m.duration * 60000);

            if (activeTab === 'today') {
                return mDateStr === todayStr && endTime > now;
            } else {
                // Upcoming: future meetings not today
                return mDate > now && mDateStr !== todayStr && mDate <= nextWeek;
            }
        })
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Helper: Check if meeting is joinable (10 mins before to duration after)
    const getJoinStatus = (meeting: Meeting) => {
        const now = new Date().getTime();
        const startTime = new Date(meeting.startTime).getTime();
        const endTime = startTime + meeting.duration * 60000;
        const diffMinutes = (startTime - now) / 60000;

        if (now > endTime) return { joinable: false, label: 'Ended', variant: 'ended' };
        if (diffMinutes <= 10) return { joinable: true, label: 'Join Now', variant: 'active' };
        if (diffMinutes <= 60) return { joinable: false, label: `${Math.round(diffMinutes)}m`, variant: 'soon' };
        return { joinable: false, label: formatTime(meeting.startTime), variant: 'scheduled' };
    };

    return (
        <aside className="hidden xl:flex w-[435px] bg-gradient-to-b from-[#13161f]/95 to-[#0B0E14]/95 backdrop-blur-xl border-l border-white/5 flex-col z-20 h-full overflow-hidden">

            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Calendar size={22} className="text-blue-400" />
                        Schedule
                    </h2>
                    <button
                        onClick={() => fetchMeetings(true)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={`text-gray-400 group-hover:text-white ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#0B0E14] rounded-xl p-1 text-sm font-medium">
                    <button
                        onClick={() => setActiveTab('today')}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all ${activeTab === 'today'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 px-4 py-2 rounded-lg transition-all ${activeTab === 'upcoming'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Upcoming
                    </button>
                </div>
            </div>

            {/* Meeting List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {loading && meetings.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
                    </div>
                ) : filteredMeetings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                            <Video size={28} className="text-gray-600" />
                        </div>
                        <p className="text-gray-400 text-center mb-4">
                            No {activeTab === 'today' ? "more meetings today" : "upcoming meetings"}
                        </p>
                        <button
                            onClick={() => navigate('/schedule')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-colors text-sm font-medium"
                        >
                            <Plus size={16} />
                            Schedule Meeting
                        </button>
                    </div>
                ) : (
                    filteredMeetings.map((meeting) => {
                        const joinStatus = getJoinStatus(meeting);

                        return (
                            <div
                                key={meeting._id}
                                className="group bg-[#1a1f2e]/50 hover:bg-[#1a1f2e] rounded-xl border border-white/5 hover:border-white/10 p-4 transition-all duration-200"
                            >
                                {/* Time Badge */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-semibold text-blue-400">
                                        {formatTime(meeting.startTime)}
                                    </span>
                                    {activeTab === 'upcoming' && (
                                        <span className="text-xs text-gray-500">
                                            {formatDate(meeting.startTime)}
                                        </span>
                                    )}
                                    {joinStatus.variant === 'active' && (
                                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full animate-pulse">
                                            LIVE
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h4 className="font-semibold text-white text-sm mb-2 line-clamp-1 group-hover:text-blue-100 transition-colors">
                                    {meeting.title}
                                </h4>

                                {/* Meta */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {meeting.duration}m
                                        </span>
                                        {meeting.attendees && meeting.attendees.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Users size={12} />
                                                {meeting.attendees.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Join Button */}
                                    <button
                                        onClick={() => joinStatus.joinable && navigate(`/meeting/${meeting.code}`)}
                                        disabled={!joinStatus.joinable}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${joinStatus.joinable
                                            ? 'bg-green-500 hover:bg-green-400 text-white shadow-lg shadow-green-500/20'
                                            : joinStatus.variant === 'ended'
                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                : 'bg-white/5 text-gray-400 cursor-default'
                                            }`}
                                    >
                                        {joinStatus.label}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5">
                <p className="text-xs text-gray-600 text-center">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
            </div>
        </aside>
    );
}
