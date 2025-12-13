import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { getSocket } from '../../services/socket';
import type { ChatMessage } from '../../services/socket';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    roomId: string;
    userId: string;
    userName: string;
    messages: ChatMessage[];
}

export default function ChatPanel({
    isOpen,
    onClose,
    roomId,
    userId,
    userName,
    messages
}: ChatPanelProps) {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const socket = getSocket();
        socket.emit('chat-message', {
            roomId,
            userId,
            userName,
            message: newMessage.trim(),
            timestamp: new Date().toISOString(),
        });

        setNewMessage('');
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="absolute right-4 top-4 bottom-4 w-80 bg-[#1a1f2e]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <MessageSquare size={20} className="text-blue-400" />
                    <span className="font-semibold text-white">Chat</span>
                    <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                        {messages.length}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X size={18} className="text-gray-400" />
                </button>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                        No messages yet. Say hello! 👋
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex flex-col ${msg.userId === userId ? 'items-end' : 'items-start'
                                }`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.userId === userId
                                        ? 'bg-blue-600 text-white rounded-br-md'
                                        : 'bg-white/10 text-white rounded-bl-md'
                                    }`}
                            >
                                {msg.userId !== userId && (
                                    <p className="text-xs text-blue-300 font-medium mb-1">
                                        {msg.userName}
                                    </p>
                                )}
                                <p className="text-sm break-words">{msg.message}</p>
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1 px-1">
                                {formatTime(msg.timestamp)}
                            </span>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition-colors"
                    >
                        <Send size={18} className="text-white" />
                    </button>
                </div>
            </form>
        </div>
    );
}
