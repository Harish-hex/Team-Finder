import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { VerifyOtp } from '../pages/VerifyOtp';
import { OAuthSuccess } from '../pages/OAuthSuccess';
import { Dashboard } from '../pages/Dashboard';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Redirect root to dashboard if logged in, otherwise login logic handles it */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};
