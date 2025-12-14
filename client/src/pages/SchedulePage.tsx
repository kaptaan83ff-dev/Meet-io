import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { meetingAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, Users, FileText, Video, X, Plus, ArrowLeft, Loader2 } from 'lucide-react';

// Email Chip Component
function EmailChip({ email, onRemove }: { email: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-500/30">
            {email}
            <button onClick={onRemove} className="hover:text-red-400 transition-colors ml-1">
                <X size={14} />
            </button>
        </span>
    );
}

export default function SchedulePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });
    const [time, setTime] = useState('10:00');
    const [duration, setDuration] = useState(30);
    const [waitingRoom, setWaitingRoom] = useState(false);
    const [muteOnEntry, setMuteOnEntry] = useState(true);

    // Attendees as array of emails
    const [attendees, setAttendees] = useState<string[]>([]);
    const [emailInput, setEmailInput] = useState('');

    // Validation
    const titleError = title.length > 0 && (title.length < 3 || title.length > 100);
    const isPastDate = new Date(`${date}T${time}`) < new Date();

    const addEmail = () => {
        const email = emailInput.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && emailRegex.test(email) && !attendees.includes(email)) {
            setAttendees([...attendees, email]);
            setEmailInput('');
        } else if (email && !emailRegex.test(email)) {
            toast.error('Invalid email format');
        }
    };

    const removeEmail = (emailToRemove: string) => {
        setAttendees(attendees.filter(e => e !== emailToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addEmail();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || title.length < 3) {
            toast.error('Title must be at least 3 characters');
            return;
        }

        if (isPastDate) {
            toast.error('Cannot schedule a meeting in the past');
            return;
        }

        try {
            setLoading(true);
            const response = await meetingAPI.create({
                title: title.trim(),
                startTime: new Date(`${date}T${time}`).toISOString(),
                description: description.trim(),
                duration,
                settings: { waitingRoom, muteOnEntry },
                attendees: attendees.map(email => ({ email }))
            });

            if (response.success) {
                toast.success('Meeting scheduled successfully!');
                navigate('/meetings');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to schedule meeting');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0B0E14]">
            <Sidebar />

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeft size={18} />
                            <span>Back</span>
                        </button>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <div className="p-3 bg-green-500/20 rounded-xl">
                                <Video className="text-green-400" size={28} />
                            </div>
                            Schedule a Meeting
                        </h1>
                        <p className="text-gray-400 mt-2">Set up a new meeting and invite participants</p>
                    </div>

                    {/* Form Card */}
                    <form onSubmit={handleSubmit} className="bg-[#1a1f2e]/50 backdrop-blur-md rounded-2xl border border-white/10 p-8 space-y-8">

                        {/* Section: Details */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-blue-400" />
                                Meeting Details
                            </h2>
                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Meeting Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="e.g., Weekly Team Standup"
                                        maxLength={100}
                                        className={`w-full px-4 py-3 bg-[#0B0E14] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${titleError ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 focus:ring-blue-500/30 focus:border-blue-500/50'
                                            }`}
                                    />
                                    <div className="flex justify-between mt-1">
                                        {titleError && <span className="text-red-400 text-xs">Title must be 3-100 characters</span>}
                                        <span className="text-gray-500 text-xs ml-auto">{title.length}/100</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="What's this meeting about?"
                                        rows={3}
                                        maxLength={500}
                                        className="w-full px-4 py-3 bg-[#0B0E14] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all resize-none"
                                    />
                                    <span className="text-gray-500 text-xs float-right">{description.length}/500</span>
                                </div>
                            </div>
                        </section>

                        {/* Section: Date & Time */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Calendar size={20} className="text-purple-400" />
                                Date & Time
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`w-full px-4 py-3 bg-[#0B0E14] border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all ${isPastDate ? 'border-red-500/50' : 'border-white/10'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Time */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={e => setTime(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-[#0B0E14] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                                    <select
                                        value={duration}
                                        onChange={e => setDuration(Number(e.target.value))}
                                        className="w-full px-4 py-3 bg-[#0B0E14] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value={15}>15 minutes</option>
                                        <option value={30}>30 minutes</option>
                                        <option value={45}>45 minutes</option>
                                        <option value={60}>1 hour</option>
                                        <option value={90}>1.5 hours</option>
                                        <option value={120}>2 hours</option>
                                    </select>
                                </div>
                            </div>
                            {isPastDate && (
                                <p className="text-red-400 text-sm mt-2">⚠️ Selected time is in the past</p>
                            )}
                        </section>

                        {/* Section: Participants */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Users size={20} className="text-cyan-400" />
                                Invite Participants
                            </h2>
                            <div>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="email"
                                        value={emailInput}
                                        onChange={e => setEmailInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Enter email and press Enter"
                                        className="flex-1 px-4 py-3 bg-[#0B0E14] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={addEmail}
                                        className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={18} />
                                        Add
                                    </button>
                                </div>
                                {attendees.length > 0 && (
                                    <div className="flex flex-wrap gap-2 p-4 bg-[#0B0E14] rounded-xl border border-white/5">
                                        {attendees.map(email => (
                                            <EmailChip key={email} email={email} onRemove={() => removeEmail(email)} />
                                        ))}
                                    </div>
                                )}
                                <p className="text-gray-500 text-xs mt-2">Participants will receive an email invitation with meeting details</p>
                            </div>
                        </section>

                        {/* Section: Settings */}
                        <section>
                            <h2 className="text-lg font-semibold text-white mb-4">Meeting Settings</h2>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 bg-[#0B0E14] rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={waitingRoom}
                                        onChange={e => setWaitingRoom(e.target.checked)}
                                        className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                                    />
                                    <div>
                                        <span className="text-white font-medium">Enable Waiting Room</span>
                                        <p className="text-gray-500 text-sm">Participants must be admitted by the host</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 bg-[#0B0E14] rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={muteOnEntry}
                                        onChange={e => setMuteOnEntry(e.target.checked)}
                                        className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                                    />
                                    <div>
                                        <span className="text-white font-medium">Mute on Entry</span>
                                        <p className="text-gray-500 text-sm">Participants join with microphone muted</p>
                                    </div>
                                </label>
                            </div>
                        </section>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-white/10">
                            <button
                                type="submit"
                                disabled={loading || titleError || isPastDate || !title.trim()}
                                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Scheduling...
                                    </>
                                ) : (
                                    <>
                                        <Calendar size={20} />
                                        Schedule Meeting
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
