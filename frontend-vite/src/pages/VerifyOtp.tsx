import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthCard } from '../components/AuthCard';

export const VerifyOtp = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Email not found. Please try logging in again.");
            return;
        }

        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Success! Check if user has a profile
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Check if profile exists in database
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                // We need to get the session first
                const { data: { session } } = await supabase.auth.getSession();

                const getRedirectUrlWithSession = (baseUrl: string) => {
                    if (!session) return baseUrl;
                    const hash = `access_token=${session.access_token}&refresh_token=${session.refresh_token}&expires_in=${session.expires_in}&token_type=bearer&type=recovery`;
                    return `${baseUrl}#${hash}`;
                };

                if (profile) {
                    // Existing user with profile → go to Next.js landing page
                    window.location.href = getRedirectUrlWithSession('http://localhost:3000');
                } else {
                    // New user limits → go to Next.js onboarding
                    window.location.href = getRedirectUrlWithSession('http://localhost:3000/onboarding/profile');
                }
            }
        }
    };

    if (!email) {
        return (
            <AuthCard title="Error">
                <p className="text-center text-red-600">No email provided. Return to <a href="/login" className="underline">Login</a>.</p>
            </AuthCard>
        )
    }

    return (
        <AuthCard title="Check your email" subtitle={`We sent a code to ${email}`}>
            <form className="space-y-6" onSubmit={handleVerify}>
                <div>
                    <label htmlFor="otp" className="block text-sm font-medium leading-6 text-white/90">
                        Enter 6-digit code
                    </label>
                    <div className="mt-2">
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 text-center text-2xl tracking-widest bg-white/5 text-white shadow-sm ring-1 ring-inset ring-white/20 placeholder:text-blue-100/40 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                            maxLength={6}
                        />
                    </div>
                </div>

                {error && <div className="text-red-400 text-sm">{error}</div>}

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 hover:shadow-xl hover:shadow-indigo-500/25 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                </div>
            </form>
            <div className="text-center">
                <button onClick={() => navigate('/login')} className="text-sm text-blue-100/50 hover:text-white">
                    Use a different email
                </button>
            </div>
        </AuthCard>
    );
};
