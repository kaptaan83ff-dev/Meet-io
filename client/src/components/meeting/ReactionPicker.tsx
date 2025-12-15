/**
 * ReactionPicker - Emoji reaction popup
 * 
 * Quick emoji reactions: 👍 ❤️ 😂 👏 🎉
 */

import { useState } from 'react';
import { Smile } from 'lucide-react';

interface ReactionPickerProps {
    onReaction: (emoji: string) => void;
}

const REACTIONS = ['👍', '❤️', '😂', '👏', '🎉', '🔥', '😮', '🙌'];

export default function ReactionPicker({ onReaction }: ReactionPickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleReaction = (emoji: string) => {
        onReaction(emoji);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-full transition-all ${isOpen
                        ? 'bg-yellow-500 text-white'
                        : 'bg-[#1a1f2e] hover:bg-[#252b3d] text-white'
                    }`}
                title="Reactions"
            >
                <Smile size={20} />
            </button>

            {/* Emoji Popup */}
            {isOpen && (
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#1a1f2e] border border-white/10 rounded-2xl p-2 flex gap-1 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {REACTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-white/10 rounded-xl transition-transform hover:scale-125"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
