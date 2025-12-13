import { useEffect } from 'react';
// Clock, Loader2 removed
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
        <div className="flex h-screen w-full items-center justify-center bg-[#0B0E14] overflow-hidden">
            <div className="relative w-full max-w-lg px-8">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />

                <div className="relative z-10 flex flex-col items-start space-y-8">
                    {/* Header Text */}
                    <div className="space-y-3 animate-fade-in-up">
                        <h1 className="text-4xl font-extralight text-white tracking-tight">
                            One moment...
                        </h1>
                        <p className="text-gray-400 text-sm font-light">
                            Waiting for the host to let you into <span className="text-blue-400 font-medium">{meetingTitle}</span>.
                        </p>
                    </div>

                    {/* Ease Out Loader Bar */}
                    <div className="w-full">
                        <div className="flex items-center justify-between text-xs text-blue-400 mb-2 font-mono uppercase tracking-widest opacity-80">
                            <span>Status</span>
                            <span className="animate-pulse">Pending...</span>
                        </div>

                        {/* Progress Track */}
                        <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                            {/* Progress Indicator - Ease Out Animation */}
                            <div className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-transparent w-full origin-left animate-progress-ease-out" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Minimal Footer */}
            <div className="absolute bottom-12 text-center w-full">
                <p className="text-gray-600 text-[10px] font-mono uppercase tracking-[0.2em] animate-pulse">
                    Secure Connection Enforced
                </p>
            </div>

            {/* Global Styles for Custom Animation */}
            <style>{`
                @keyframes progress-ease-out {
                    0% { transform: scaleX(0); }
                    15% { transform: scaleX(0.5); }
                    100% { transform: scaleX(0.98); }
                }
                .animate-progress-ease-out {
                    animation: progress-ease-out 4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 1s ease-out forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
