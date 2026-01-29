import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const OAuthSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase handles the hash parsing automatically in onAuthStateChange
        // We just need to check if we have a session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                // Redirect to Next.js landing page
                window.location.href = 'http://localhost:3000';
            } else {
                // If no session found immediately, wait for the listener in AuthContext or just redirect to login if it fails
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN' || session) {
                        window.location.href = 'http://localhost:3000';
                    }
                });
                return () => subscription.unsubscribe();
            }
        });
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
};
