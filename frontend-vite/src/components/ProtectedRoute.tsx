import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
    const { session, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!session) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};
