import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await register(formData.name, formData.email, formData.password);
            }
            // Redirect to dashboard on success
            navigate('/dashboard');
        } catch (error) {
            // Error toast already shown in AuthContext
            console.error('Auth error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({ name: '', email: '', password: '' });
    };

    return (
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-orange-500/30 selection:text-orange-200">

            {/* Background Ambience */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '7s' }} />
            </div>

            <div className="w-full max-w-[1100px] bg-[#151921] rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col lg:flex-row relative z-10 min-h-[700px]">

                {/* LEFT SIDE: Visual Brand Area */}
                <div className="lg:w-1/2 relative bg-[#0F1218] p-12 flex flex-col justify-between overflow-hidden">
                    {/* Decorative Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>

                    <div className="relative z-10">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <div className="w-5 h-3 border-2 border-white rounded-sm" />
                            </div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                Meet.io<span className="text-blue-500">.</span>
                            </span>
                        </div>

                        {/* Hero Text */}
                        <div className="space-y-6 mb-12">
                            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                                Connect with your team, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                                    instantly.
                                </span>
                            </h1>
                            <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
                                Experience crystal clear video conferencing with zero lag. Join millions of users connecting daily.
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 gap-4 max-w-sm">
                            <div className="group relative w-full h-auto min-h-[120px] rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer bg-gradient-to-br from-orange-500 to-red-600 p-6">
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-white mb-2">New Meeting</h3>
                                    <p className="text-orange-50/80 text-sm">Start an instant meeting</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-6">
                                    <h3 className="text-lg font-bold text-white">Join</h3>
                                    <p className="text-blue-50/70 text-xs mt-1">Via code</p>
                                </div>
                                <div className="w-16 rounded-2xl bg-[#1E2330] border border-white/5"></div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12 text-xs text-slate-500 font-medium">
                        © 2025 Meet.io Inc. All rights reserved.
                    </div>
                </div>

                {/* RIGHT SIDE: Authentication Form */}
                <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-[#151921]">
                    <div className="max-w-md w-full mx-auto">

                        {/* Header */}
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {isLogin ? 'Welcome back' : 'Create account'}
                            </h2>
                            <p className="text-slate-400">
                                {isLogin
                                    ? 'Enter your details to access your workspace.'
                                    : 'Get started with your free account today.'}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {!isLogin && (
                                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                        Full Name
                                    </label>
                                    <div className="relative flex items-center bg-[#1E2330] rounded-xl border border-white/5 hover:border-white/10 focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all mt-2">
                                        <div className="pl-4 text-slate-500">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="e.g. Sarah Smith"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required={!isLogin}
                                            className="w-full bg-transparent border-none text-white placeholder-slate-600 px-4 py-3.5 focus:outline-none text-sm font-medium"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                    Email Address
                                </label>
                                <div className="relative flex items-center bg-[#1E2330] rounded-xl border border-white/5 hover:border-white/10 focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all mt-2">
                                    <div className="pl-4 text-slate-500">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full bg-transparent border-none text-white placeholder-slate-600 px-4 py-3.5 focus:outline-none text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">
                                    Password
                                </label>
                                <div className="relative flex items-center bg-[#1E2330] rounded-xl border border-white/5 hover:border-white/10 focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all">
                                    <div className="pl-4 text-slate-500">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={8}
                                        className="w-full bg-transparent border-none text-white placeholder-slate-600 px-4 py-3.5 focus:outline-none text-sm font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="pr-4 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {isLogin && (
                                    <div className="flex justify-end">
                                        <a href="#" className="text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors">
                                            Forgot password?
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-base shadow-lg shadow-blue-500/25 transform transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Toggle Mode */}
                        <div className="mt-8 text-center">
                            <p className="text-slate-400 text-sm">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={toggleMode}
                                    className="text-orange-500 hover:text-orange-400 font-bold transition-colors ml-1 focus:outline-none"
                                >
                                    {isLogin ? 'Sign up for free' : 'Log in'}
                                </button>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
