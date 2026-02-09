'use client'

import { useEffect } from 'react'

export default function VerifyRedirect() {
    useEffect(() => {
        // Redirect to Vite frontend for OTP verification
        window.location.href = 'http://localhost:5173'
    }, [])

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="fixed inset-0 -z-10 bg-[#0a0f1a]">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-[#0a0f1a]" />
            </div>
            <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p>Redirecting to login...</p>
            </div>
        </div>
    )
}
