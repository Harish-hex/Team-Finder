'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, ArrowLeft, Clock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { AuthService } from '@/lib/auth-service'
import { toast } from 'sonner'
import Link from 'next/link'

export default function VerifyPage() {
    const router = useRouter()
    const [email, setEmail] = useState<string | null>(null)
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
    const [canResend, setCanResend] = useState(false)

    useEffect(() => {
        // Client-side only access to sessionStorage
        const storedEmail = sessionStorage.getItem('auth_email')
        if (!storedEmail) {
            toast.error('No email found. Please login again.')
            router.push('/auth')
            return
        }
        setEmail(storedEmail)
    }, [router])

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
            return () => clearInterval(timer)
        } else {
            setCanResend(true)
        }
    }, [timeLeft])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleVerify = async (code: string) => {
        if (!email) return
        setLoading(true)

        // If complete 6 digits
        if (code.length === 6) {
            try {
                const result = await AuthService.verifyOTP(email, code)

                if (result.success) {
                    toast.success('Verified successfully!')
                    router.push('/onboarding/profile')
                } else {
                    toast.error(result.error || 'Verification failed')
                    setOtp('') // Clear on error
                }
            } catch (error) {
                toast.error('Something went wrong. Please try again.')
                setOtp('')
            } finally {
                setLoading(false)
            }
        } else {
            setLoading(false)
        }
    }

    // Trigger verify automatically when 6 digits are filled
    useEffect(() => {
        if (otp.length === 6) {
            handleVerify(otp)
        }
    }, [otp])


    const handleResend = async () => {
        if (!email) return
        setCanResend(false)
        setTimeLeft(300)

        try {
            const result = await AuthService.sendOTP(email)
            if (result.success) {
                toast.success('New code sent!')
            } else {
                toast.error(result.error)
                setCanResend(true) // Allow retry if failed
            }
        } catch (error) {
            toast.error('Failed to resend code')
            setCanResend(true)
        }
    }

    if (!email) return null // or a loading spinner

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4">
            {/* Background elements */}
            <div className="fixed inset-0 -z-10 bg-[#0a0f1a]">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-[#0a0f1a]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <Card className="border-white/10 bg-[#0d1320]/80 backdrop-blur-md shadow-2xl">
                    <CardHeader className="space-y-3 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">Check your inbox</CardTitle>
                        <CardDescription className="text-blue-100/60 text-base">
                            We sent a code to <span className="text-indigo-300 font-medium">{email}</span>.
                            <br />Enter it below to verify.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-6">
                        <div className="flex justify-center w-full">
                            <InputOTP
                                maxLength={6}
                                value={otp}
                                onChange={setOtp}
                                disabled={loading}
                                className="gap-2"
                                containerClassName="gap-2 justify-center"
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} className="h-12 w-10 sm:h-14 sm:w-12 bg-white/5 border-white/10 text-lg text-white" />
                                    <InputOTPSlot index={1} className="h-12 w-10 sm:h-14 sm:w-12 bg-white/5 border-white/10 text-lg text-white" />
                                    <InputOTPSlot index={2} className="h-12 w-10 sm:h-14 sm:w-12 bg-white/5 border-white/10 text-lg text-white" />
                                </InputOTPGroup>
                                <div className="w-2" /> {/* Spacer */}
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} className="h-12 w-10 sm:h-14 sm:w-12 bg-white/5 border-white/10 text-lg text-white" />
                                    <InputOTPSlot index={4} className="h-12 w-10 sm:h-14 sm:w-12 bg-white/5 border-white/10 text-lg text-white" />
                                    <InputOTPSlot index={5} className="h-12 w-10 sm:h-14 sm:w-12 bg-white/5 border-white/10 text-lg text-white" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <div className="text-sm font-medium text-blue-100/50 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {timeLeft > 0 ? (
                                <span>Code expires in {formatTime(timeLeft)}</span>
                            ) : (
                                <span className="text-red-400">Code expired</span>
                            )}
                        </div>

                        <div className="w-full space-y-2">
                            <Button
                                onClick={() => handleVerify(otp)}
                                disabled={otp.length !== 6 || loading}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Verify Code'}
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <div className="text-sm text-center text-blue-100/50">
                            Didn't receive it?{' '}
                            <button
                                onClick={handleResend}
                                disabled={!canResend || loading}
                                className="text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:underline transition-all"
                            >
                                Resend code
                            </button>
                        </div>

                        <Link href="/auth" className="flex items-center gap-2 text-sm text-blue-100/40 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to login
                        </Link>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}
