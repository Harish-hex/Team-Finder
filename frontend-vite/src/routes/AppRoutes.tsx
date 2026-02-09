import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Signup } from '../pages/Signup';
import { VerifyOtp } from '../pages/VerifyOtp';
import { OAuthSuccess } from '../pages/OAuthSuccess';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};
