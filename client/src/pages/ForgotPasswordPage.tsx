
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authAPI.forgotPassword(email);
            setIsSent(true);
            toast.success('Reset link sent to your email');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <div className="min-h-screen bg-[#0B0E14] text-white flex items-center justify-center p-4 font-['Inter']">
                <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Check your mail</h2>
                    <p className="text-gray-400 mb-8">
                        We have sent a password recover instructions to your email.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => window.open('https://gmail.com', '_blank')}
                            className="block w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
                        >
                            Open Email App
                        </button>
                        <button
                            onClick={() => setIsSent(false)}
                            className="text-gray-400 hover:text-white text-sm"
                        >
                            Skip, I'll confirm later
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white flex items-center justify-center p-4 font-['Inter']">
            <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-8 max-w-md w-full shadow-xl">
                <div className="mb-8">
                    <Link to="/login" className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 transition-colors">
                        <ArrowLeft size={18} /> Back to Login
                    </Link>
                    <h1 className="text-3xl font-bold">Forgot Password?</h1>
                    <p className="text-gray-400 mt-2">
                        Don't worry! It happens. Please enter the email associated with your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0B0E14] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
}
