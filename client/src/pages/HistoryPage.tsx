import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { meetingAPI } from '../services/api';
import { Clock, Users, Calendar, ChevronLeft, ChevronRight, History, Video } from 'lucide-react';

interface Meeting {
    _id: string;
    code: string;
    title: string;
    startTime: string;
    duration: number;
    status: string;
    participantCount: number;
    createdAt: string;
    host?: {
        name: string;
        email: string;
        avatar?: string;
    };
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export default function HistoryPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchHistory = async (page: number) => {
        setLoading(true);
        try {
            const data = await meetingAPI.getMeetingHistory(page);
            if (data.success) {
                setMeetings(data.meetings);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch meeting history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(currentPage);
    }, [currentPage]);

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDuration = (minutes: number) => {
        if (!minutes || isNaN(minutes)) return '0m';
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ended':
            case 'completed':
                return 'bg-gray-500/20 text-gray-400';
            case 'active':
                return 'bg-green-500/20 text-green-400';
            case 'scheduled':
                return 'bg-blue-500/20 text-blue-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0B0E14]">
            <Sidebar />

            <main className="flex-1 overflow-y-auto overflow-x-hidden h-screen p-6 max-w-full">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                <History className="text-blue-400" size={28} />
                                Meeting History
                            </h1>
                            <p className="text-gray-400 mt-2">
                                View your past meetings and call history
                            </p>
                        </div>
                        <button
                            onClick={async () => {
                                if (confirm('Are you sure you want to delete meetings older than 15 days?')) {
                                    try {
                                        const res = await meetingAPI.deleteOldMeetings(15);
                                        if (res.success) {
                                            alert(`Deleted ${res.deletedCount} old meetings`);
                                            // Refresh current page
                                            fetchHistory(currentPage);
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        alert('Failed to delete meetings');
                                    }
                                }
                            }}
                            className="text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 border border-red-400/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Clean Up Old (&gt;15 days)
                        </button>
                    </div>

                    {/* Table Container */}
                    <div className="bg-[#1a1f2e]/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
                            </div>
                        ) : meetings.length === 0 ? (
                            <div className="text-center py-20">
                                <Video size={48} className="mx-auto text-gray-600 mb-4" />
                                <p className="text-gray-400 text-lg">No meeting history yet</p>
                                <p className="text-gray-500 text-sm mt-2">
                                    Your past meetings will appear here
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#0B0E14]/50 border-b border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <div className="col-span-5">Meeting</div>
                                    <div className="col-span-2">Date</div>
                                    <div className="col-span-2">Duration</div>
                                    <div className="col-span-2">Participants</div>
                                    <div className="col-span-1">Status</div>
                                </div>

                                {/* Table Body */}
                                <div className="divide-y divide-white/5">
                                    {meetings.map((meeting) => (
                                        <div
                                            key={meeting._id}
                                            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-white/5 transition-colors items-center"
                                        >
                                            {/* Meeting Title */}
                                            <div className="col-span-5">
                                                <h4 className="text-white font-medium truncate">
                                                    {meeting.title}
                                                </h4>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {meeting.host?.name || 'Unknown Host'}
                                                </p>
                                            </div>

                                            {/* Date */}
                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2 text-gray-300 text-sm">
                                                    <Calendar size={14} className="text-gray-500" />
                                                    {formatDate(meeting.startTime)}
                                                </div>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {formatTime(meeting.startTime)}
                                                </p>
                                            </div>

                                            {/* Duration */}
                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2 text-gray-300 text-sm">
                                                    <Clock size={14} className="text-gray-500" />
                                                    {formatDuration(meeting.duration)}
                                                </div>
                                            </div>

                                            {/* Participants */}
                                            <div className="col-span-2">
                                                <div className="flex items-center gap-2 text-gray-300 text-sm">
                                                    <Users size={14} className="text-gray-500" />
                                                    {meeting.participantCount}
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="col-span-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                                                    {meeting.status || 'Past'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6">
                            <p className="text-gray-500 text-sm">
                                Page {pagination.currentPage} of {pagination.totalPages}
                                <span className="ml-2 text-gray-600">
                                    ({pagination.totalCount} total meetings)
                                </span>
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    disabled={!pagination.hasPrevPage}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
