'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { AuthCard } from '@/components/auth-card'
import { OAuthButton } from '@/components/oauth-button'
import { Divider } from '@/components/divider'

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
        }
    }

    const handleGoogleSignup = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <AuthCard title="Create an account" subtitle="Join CoForge today">
            <form className="space-y-6" onSubmit={handleEmailSignup}>
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
                        {loading ? 'Signing up...' : 'Sign up'}
                    </button>
                </div>
            </form>

            <div className="mt-6">
                <Divider text="Or sign up with" />
                <div className="mt-6">
                    <OAuthButton provider="google" onClick={handleGoogleSignup} isLoading={loading} />
                </div>
            </div>

            <p className="mt-10 text-center text-sm text-blue-100/50">
                Already a member?{' '}
                <Link href="/auth/login" className="font-semibold leading-6 text-indigo-300 hover:text-indigo-200">
                    Sign in
                </Link>
            </p>
        </AuthCard>
    )
}
