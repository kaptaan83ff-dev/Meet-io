/**
 * MeetingTopBar - Top information bar for meeting room
 * 
 * Displays:
 * - Meeting title
 * - Meeting code
 * - Current time
 * - Grid/fullscreen controls
 */

import { useState, useEffect } from 'react';
import { Grid3x3, Maximize, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface MeetingTopBarProps {
    meetingTitle: string;
    meetingCode: string;
    onToggleFullscreen?: () => void;
    onToggleGrid?: () => void;
}

export default function MeetingTopBar({
    meetingTitle,
    meetingCode,
    onToggleFullscreen,
    onToggleGrid,
}: MeetingTopBarProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const copyMeetingCode = () => {
        const meetingUrl = `${window.location.origin}/meeting/${meetingCode}`;
        navigator.clipboard.writeText(meetingUrl);
        toast.success('Meeting link copied!');
    };

    // Get first letter of meeting title for icon
    const meetingIcon = meetingTitle.charAt(0).toUpperCase();

    return (
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-[#1e2a3a]">
            {/* Left side - Meeting info */}
            <div className="flex items-center gap-3">
                {/* Meeting Icon */}
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {meetingIcon}
                </div>

                {/* Meeting Details */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <h1 className="text-white font-semibold text-base">{meetingTitle}</h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <button
                            onClick={copyMeetingCode}
                            className="font-mono hover:text-white transition-colors flex items-center gap-1"
                            title="Click to copy code"
                        >
                            {meetingCode}
                            <Copy size={12} className="opacity-0 hover:opacity-100" />
                        </button>
                        <span>•</span>
                        <span>{formatTime(currentTime)}</span>
                    </div>
                </div>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleGrid}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                    title="Toggle grid view"
                >
                    <Grid3x3 size={20} />
                </button>
                <button
                    onClick={onToggleFullscreen}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                    title="Toggle fullscreen"
                >
                    <Maximize size={20} />
                </button>
            </div>
        </div>
    );
}
