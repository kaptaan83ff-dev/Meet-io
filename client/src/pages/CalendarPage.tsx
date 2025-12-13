import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CalendarGrid from '../components/calendar/CalendarGrid';
import { meetingAPI, serverAPI } from '../services/api';
import { Plus } from 'lucide-react';

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

export default function CalendarPage() {
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);

    // Server-provided "today" for accurate date handling
    const [serverToday, setServerToday] = useState<Date>(new Date());
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Helper to normalize date (midnight)
    const getDateOnly = useCallback((date: Date): Date => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }, []);

    // Fetch server time on mount
    useEffect(() => {
        const fetchServerTime = async () => {
            try {
                const data = await serverAPI.getTime();
                if (data.success && data.serverTime) {
                    const serverDate = new Date(data.serverTime);
                    const normalizedServerToday = getDateOnly(serverDate);
                    setServerToday(normalizedServerToday);
                    setCurrentDate(serverDate);
                    setSelectedDate(normalizedServerToday);
                }
            } catch (error) {
                console.error('Failed to fetch server time, using local time:', error);
                // Fallback to local time
                const now = new Date();
                setServerToday(getDateOnly(now));
                setCurrentDate(now);
                setSelectedDate(getDateOnly(now));
            }
        };
        fetchServerTime();
    }, [getDateOnly]);

    // Fetch meetings
    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const data = await meetingAPI.getMyMeetings();
                if (data.success) {
                    setMeetings(data.meetings);
                }
            } catch (error) {
                console.error('Failed to fetch meetings', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMeetings();
    }, []);

    // Navigation handlers
    const handlePrevMonth = useCallback(() => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }, []);

    const handleNextMonth = useCallback(() => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }, []);

    const handleGoToToday = useCallback(() => {
        // Use server today for accurate "Today" navigation
        setCurrentDate(new Date(serverToday));
        setSelectedDate(getDateOnly(serverToday));
    }, [serverToday, getDateOnly]);

    const handleDateSelect = useCallback((date: Date) => {
        setSelectedDate(getDateOnly(date));
    }, [getDateOnly]);

    return (
        <div className="flex min-h-screen bg-[#0B0E14]">
            <Sidebar />

            <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Calendar</h1>
                            <p className="text-gray-400 text-sm">View and manage your scheduled meetings</p>
                        </div>
                        <button
                            onClick={() => navigate('/schedule')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors"
                        >
                            <Plus size={18} />
                            Schedule Meeting
                        </button>
                    </div>

                    {/* Calendar Grid Component */}
                    <CalendarGrid
                        meetings={meetings}
                        currentDate={currentDate}
                        selectedDate={selectedDate}
                        serverToday={serverToday}
                        onDateSelect={handleDateSelect}
                        onPrevMonth={handlePrevMonth}
                        onNextMonth={handleNextMonth}
                        onGoToToday={handleGoToToday}
                        loading={loading}
                    />
                </div>
            </main>
        </div>
    );
}
