import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkProfileAndRedirect = async () => {
            if (!user) return;

            console.log('🔍 Dashboard - Checking profile for user:', user.id);

            // Check if user has a profile
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            console.log('🔍 Profile check result:', { profile, error });

            if (profile) {
                // Existing user with profile → go to Next.js landing page
                console.log('✅ Profile exists, redirecting to Next.js landing page');
                window.location.href = 'http://localhost:3000';
            } else {
                // New user without profile → go to Next.js onboarding
                console.log('❌ No profile found, redirecting to Next.js onboarding');
                window.location.href = 'http://localhost:3000/onboarding/profile';
            }
        };

        checkProfileAndRedirect();
    }, [user]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white">
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <button
                        onClick={handleSignOut}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        Sign out
                    </button>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-base font-semibold leading-6 text-gray-900">Welcome, {user?.email}</h3>
                            <div className="mt-2 max-w-xl text-sm text-gray-500">
                                <p>You have successfully authenticated with Supabase.</p>
                                <p className="mt-2">User ID: {user?.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
