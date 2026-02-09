import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const OAuthSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();

            console.log('🔍 OAuth Callback - Session:', session?.user?.id);

            if (session?.user) {
                // Check if user has a profile
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .single();

                console.log('🔍 Profile check result:', { profile, error });

                // Helper to construct URL with session
                const getRedirectUrl = (baseUrl: string) => {
                    const hash = `access_token=${session.access_token}&refresh_token=${session.refresh_token}&expires_in=${session.expires_in}&token_type=bearer&type=recovery`;
                    return `${baseUrl}#${hash}`;
                };

                if (profile) {
                    // Existing user with profile → go to Next.js landing page
                    console.log('✅ Profile exists, redirecting to landing page');
                    window.location.href = getRedirectUrl('http://localhost:3000');
                } else {
                    // New user without profile → go to Next.js onboarding
                    console.log('❌ No profile found, redirecting to onboarding');
                    window.location.href = getRedirectUrl('http://localhost:3000/onboarding/profile');
                }
            } else {
                console.log('⏳ No session yet, waiting for auth state change...');
                // If no session found immediately, wait for auth state change
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                    console.log('🔍 Auth state changed:', event, session?.user?.id);

                    if (event === 'SIGNED_IN' && session?.user) {
                        // Check profile for this user
                        const { data: profile, error } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('user_id', session.user.id)
                            .single();

                        console.log('🔍 Profile check result (from listener):', { profile, error });

                        const getRedirectUrl = (baseUrl: string) => {
                            const hash = `access_token=${session.access_token}&refresh_token=${session.refresh_token}&expires_in=${session.expires_in}&token_type=bearer&type=recovery`;
                            return `${baseUrl}#${hash}`;
                        };

                        if (profile) {
                            console.log('✅ Profile exists, redirecting to landing page');
                            window.location.href = getRedirectUrl('http://localhost:3000');
                        } else {
                            console.log('❌ No profile found, redirecting to onboarding');
                            window.location.href = getRedirectUrl('http://localhost:3000/onboarding/profile');
                        }
                    }
                });
                return () => subscription.unsubscribe();
            }
        };

        handleOAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
};
