import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AmbientBackground from './Bg-UI/AmbientBackground';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            {/* Ambient Background - Start */}
            <AmbientBackground />
            {/* Ambient Background - End */}
            {children}
        </>
    );
}
