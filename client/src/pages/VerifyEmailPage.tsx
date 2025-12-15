
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';


export default function VerifyEmailPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        const verify = async () => {
            try {
                await authAPI.verifyEmail(token);
                setStatus('success');
                setMessage('Email verified successfully! You are being redirected...');
                setTimeout(() => navigate('/dashboard'), 3000);
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Verification failed. Token may be invalid or expired.');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white flex items-center justify-center p-4 font-['Inter']">
            <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="mb-6 flex justify-center">
                    {status === 'loading' && (
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                    )}
                </div>

                <h2 className="text-2xl font-bold mb-2">
                    {status === 'loading' && 'Verifying Email...'}
                    {status === 'success' && 'Verified!'}
                    {status === 'error' && 'Verification Failed'}
                </h2>

                <p className="text-gray-400 mb-8">
                    {status === 'loading' && 'Please wait while we verify your email address.'}
                    {message}
                </p>

                {status === 'error' && (
                    <Link
                        to="/login"
                        className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                    >
                        Back to Login
                    </Link>
                )}
                {status === 'success' && (
                    <Link
                        to="/dashboard"
                        className="inline-block bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                )}
            </div>
        </div>
    );
}
