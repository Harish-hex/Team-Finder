'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthCard } from '@/components/auth-card'

function VerifyOtpForm() {
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email')

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            setError("Email not found. Please try logging in again.")
            return
        }

        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email',
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            // Check if user has a profile
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single()

                if (profile) {
                    router.push('/')
                } else {
                    router.push('/onboarding/profile')
                }
            }
        }
    }

    if (!email) {
        return (
            <AuthCard title="Error">
                <p className="text-center text-red-600">
                    No email provided. Return to{' '}
                    <a href="/auth/login" className="underline">Login</a>.
                </p>
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
                <a href="/auth/login" className="text-sm text-blue-100/50 hover:text-white">
                    Use a different email
                </a>
            </div>
        </AuthCard>
    )
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0f1a' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
            </div>
        }>
            <VerifyOtpForm />
        </Suspense>
    )
}
