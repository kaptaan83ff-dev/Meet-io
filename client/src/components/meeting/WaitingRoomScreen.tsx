import { useEffect } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { getSocket } from '../../services/socket';

interface WaitingRoomScreenProps {
    meetingTitle: string;
    onAdmitted: (token: string) => void;
    onDenied: () => void;
}

export default function WaitingRoomScreen({
    meetingTitle,
    onAdmitted,
    onDenied,
}: WaitingRoomScreenProps) {
    useEffect(() => {
        const socket = getSocket();

        const handleAdmitted = (data: { token: string }) => {
            onAdmitted(data.token);
        };

        const handleDenied = () => {
            onDenied();
        };

        socket.on('admitted', handleAdmitted);
        socket.on('denied', handleDenied);

        return () => {
            socket.off('admitted', handleAdmitted);
            socket.off('denied', handleDenied);
        };
    }, [onAdmitted, onDenied]);

    return (
        <div className="flex h-screen items-center justify-center bg-[#0B0E14]">
            <div className="text-center max-w-md px-6">
                {/* Animated Clock Icon */}
                <div className="relative mx-auto w-24 h-24 mb-8">
                    <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <Clock size={40} className="text-white" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">
                    Waiting Room
                </h1>
                <p className="text-gray-400 mb-6">
                    You're trying to join <span className="text-white font-medium">{meetingTitle}</span>
                </p>

                <div className="flex items-center justify-center gap-2 text-orange-400 mb-8">
                    <Loader2 size={20} className="animate-spin" />
                    <span>Waiting for the host to let you in...</span>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-gray-500">
                        The meeting host has been notified. Please wait while they review your request.
                    </p>
                </div>
            </div>
        </div>
    );
}
