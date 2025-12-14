import { Wand2 } from 'lucide-react';

interface MediaSettingsProps {
    isNoiseFilterEnabled: boolean;
    onToggleNoiseFilter: (enabled: boolean) => void;
    isProcessorSupported: boolean;
}

export default function MediaSettings({
    isNoiseFilterEnabled,
    onToggleNoiseFilter,
    isProcessorSupported
}: MediaSettingsProps) {
    if (!isProcessorSupported) return null;

    return (
        <div className="absolute top-4 right-4 z-50 bg-[#1a1f2e]/90 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-xl">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isNoiseFilterEnabled ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400'}`}>
                    <Wand2 size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">Enhanced Audio</span>
                    <span className="text-xs text-gray-400">Krisp Noice Cancellation</span>
                </div>
                <button
                    onClick={() => onToggleNoiseFilter(!isNoiseFilterEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1a1f2e] ${isNoiseFilterEnabled ? 'bg-purple-600' : 'bg-gray-600'
                        }`}
                >
                    <span
                        className={`${isNoiseFilterEnabled ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                </button>
            </div>
        </div>
    );
}
