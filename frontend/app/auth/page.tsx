'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, ArrowRight, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { AuthService } from '@/lib/auth-service'
import { toast } from 'sonner'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await AuthService.sendOTP(email)

            if (result.success) {
                // Store email temporarily for the verify step
                sessionStorage.setItem('auth_email', email)
                toast.success('Code sent! Check your inbox.')
                router.push('/auth/verify')
            } else {
                toast.error(result.error || 'Something went wrong')
            }
        } catch (error) {
            toast.error('Failed to send code. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4">
            {/* Background elements matched to LandingPage */}
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
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">Welcome back</CardTitle>
                        <CardDescription className="text-blue-100/60 text-base">
                            Enter your college email to find your team.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="you@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending code...
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-xs text-blue-100/30 text-center px-4">
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                            We only use your email for authentication.
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}
