import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AuthCard } from '../components/AuthCard';
import { OAuthButton } from '../components/OAuthButton';
import { Divider } from '../components/Divider';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithOtp({
            email,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Navigate to verify page with email
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/oauth-success`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <AuthCard title="Welcome back" subtitle="Sign in to your account">
            <form className="space-y-6" onSubmit={handleEmailLogin}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-white/90">
                        College Email
                    </label>
                    <div className="mt-2">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 bg-white/5 text-white shadow-sm ring-1 ring-inset ring-white/20 placeholder:text-blue-100/40 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 pl-3"
                            placeholder="you@college.edu"
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
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                </div>
            </form>

            <div className="mt-6">
                <Divider text="Or continue with" />
                <div className="mt-6">
                    <OAuthButton provider="google" onClick={handleGoogleLogin} isLoading={loading} />
                </div>
            </div>

            <p className="mt-10 text-center text-sm text-blue-100/50">
                Not a member?{' '}
                <Link to="/signup" className="font-semibold leading-6 text-indigo-300 hover:text-indigo-200">
                    Sign up now
                </Link>
            </p>
        </AuthCard>
    );
};
