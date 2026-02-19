'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
    const router = useRouter()

    useEffect(() => {
        const handleCallback = async () => {
            // Get current session (Supabase auto-handles the OAuth hash)
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
                await redirectBasedOnProfile(session.user.id)
            } else {
                // Wait for auth state change
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                    if (event === 'SIGNED_IN' && session?.user) {
                        subscription.unsubscribe()
                        await redirectBasedOnProfile(session.user.id)
                    }
                })

                // Timeout: if no auth after 10s, redirect to login
                setTimeout(() => {
                    subscription.unsubscribe()
                    router.push('/auth/login')
                }, 10000)
            }
        }

        const redirectBasedOnProfile = async (userId: string) => {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single()

            if (profile) {
                router.push('/')
            } else {
                router.push('/onboarding/profile')
            }
        }

        handleCallback()
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0f1a' }}>
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4" />
                <p className="text-white/60">Completing sign in...</p>
            </div>
        </div>
    )
}
