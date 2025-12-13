import { useMemo } from 'react';
import { Clock, Video, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface CalendarGridProps {
    meetings: Meeting[];
    currentDate: Date;
    selectedDate: Date;
    serverToday: Date;
    onDateSelect: (date: Date) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onGoToToday: () => void;
    loading: boolean;
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({
    meetings,
    currentDate,
    selectedDate,
    serverToday,
    onDateSelect,
    onPrevMonth,
    onNextMonth,
    onGoToToday,
    loading
}: CalendarGridProps) {
    const navigate = useNavigate();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    // Map meetings to dates
    const meetingsByDate = useMemo(() => {
        const map: Record<string, Meeting[]> = {};
        meetings.forEach(m => {
            const dateKey = new Date(m.startTime).toDateString();
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(m);
        });
        return map;
    }, [meetings]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        // Previous month padding
        for (let i = 0; i < startingDayOfWeek; i++) {
            const date = new Date(year, month, -startingDayOfWeek + i + 1);
            days.push({ date, isCurrentMonth: false });
        }

        // Current month
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            days.push({ date, isCurrentMonth: true });
        }

        // Next month padding
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            const date = new Date(year, month + 1, i);
            days.push({ date, isCurrentMonth: false });
        }

        return days;
    }, [year, month, startingDayOfWeek, daysInMonth]);

    // Use SERVER time for today comparison
    const isToday = (date: Date) => date.toDateString() === serverToday.toDateString();
    const isSelected = (date: Date) => selectedDate.toDateString() === date.toDateString();

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Selected date meetings
    const selectedDateMeetings = meetingsByDate[selectedDate.toDateString()] || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Grid */}
            <div className="lg:col-span-2 bg-[#1a1f2e]/50 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white">
                            {monthNames[month]} {year}
                        </h2>
                        <button
                            onClick={onGoToToday}
                            className="px-3 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                        >
                            Today
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onPrevMonth}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={onNextMonth}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                        <div key={day} className="text-center text-xs text-gray-500 font-medium py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                            const dateKey = date.toDateString();
                            const dayMeetings = meetingsByDate[dateKey] || [];
                            const hasMeetings = dayMeetings.length > 0;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => onDateSelect(date)}
                                    className={`
                                        relative aspect-square p-2 rounded-xl transition-all text-sm
                                        ${!isCurrentMonth ? 'text-gray-600' : 'text-white'}
                                        ${isToday(date) ? 'ring-2 ring-blue-500' : ''}
                                        ${isSelected(date) ? 'bg-blue-600 text-white' : 'hover:bg-white/5'}
                                    `}
                                >
                                    <span className="font-medium">{date.getDate()}</span>
                                    {hasMeetings && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                            {dayMeetings.slice(0, 3).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1.5 h-1.5 rounded-full ${isSelected(date) ? 'bg-white' : 'bg-blue-500'}`}
                                                />
                                            ))}
                                            {dayMeetings.length > 3 && (
                                                <span className="text-[8px] text-blue-400">+{dayMeetings.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Selected Day Meetings Panel */}
            <div className="bg-[#1a1f2e]/50 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    {selectedDate.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>

                {selectedDateMeetings.length === 0 ? (
                    <div className="text-center py-12">
                        <Video size={40} className="mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-400 mb-4">No meetings scheduled</p>
                        <button
                            onClick={() => navigate('/schedule')}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                            + Schedule a meeting
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {selectedDateMeetings
                            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                            .map(meeting => (
                                <div
                                    key={meeting._id}
                                    className="bg-[#0B0E14] rounded-xl p-4 border border-white/5 hover:border-blue-500/30 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/meeting/${meeting.code}`)}
                                >
                                    <div className="flex items-center gap-2 text-blue-400 text-xs font-medium mb-2">
                                        <Clock size={12} />
                                        {formatTime(meeting.startTime)}
                                        <span className="text-gray-500">• {meeting.duration}m</span>
                                    </div>
                                    <h4 className="text-white font-medium text-sm mb-1">{meeting.title}</h4>
                                    {meeting.attendees && meeting.attendees.length > 0 && (
                                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                                            <Users size={12} />
                                            {meeting.attendees.length} attendee{meeting.attendees.length > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
        </div>
    );
}
