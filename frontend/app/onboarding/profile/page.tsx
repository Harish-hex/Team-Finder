'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, User, Rocket, Sparkles, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const INTERESTS = [
    'Hackathons', 'CTFs', 'Web Dev', 'Mobile App',
    'ML / AI', 'Systems Programming', 'Game Dev', 'Blockchain'
]

export default function MobileOnboardingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [authLoading, setAuthLoading] = useState(true)

    // Store both email and user ID
    const [email, setEmail] = useState<string | null>(null)
    const [userId, setUserId] = useState<string | null>(null)

    // Form State
    const [displayName, setDisplayName] = useState('')
    const [university, setUniversity] = useState('')
    const [selectedInterests, setSelectedInterests] = useState<string[]>([])
    const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner')
    const [isMentor, setIsMentor] = useState(false)

    useEffect(() => {
        const handleUserFound = async (user: { id: string; email?: string | null }) => {
            console.log('✅ User found:', user.email, 'ID:', user.id)
            setEmail(user.email || null)
            setUserId(user.id)
            setAuthLoading(false)

            // Check if profile already exists
            const { data: existingProfile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single()

            console.log('🔍 Profile check:', { existingProfile, error })

            if (existingProfile) {
                console.log('✅ Profile already exists, redirecting to landing')
                toast.success('Profile already exists!')
                router.push('/')
            }
        }

        const checkAuth = async () => {
            // First check if we already have a session
            const { data: { session } } = await supabase.auth.getSession()

            console.log('🔍 Initial session check:', session?.user?.id)

            if (session?.user) {
                handleUserFound(session.user)
            } else {
                console.log('⏳ No immediate session, waiting for auth state change...')
                setAuthLoading(false)
            }
        }

        // Listen for auth changes (e.g., from URL hash)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('🔔 Auth state changed:', event, session?.user?.email)
            if (session?.user) {
                handleUserFound(session.user)
            }
        })

        checkAuth()

        return () => {
            subscription.unsubscribe()
        }
    }, [router])

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        console.log('🚀 Form submitted', { userId, email, displayName, university, selectedInterests, experienceLevel, isMentor })

        if (!userId) {
            console.error('❌ No user ID found')
            toast.error('No authenticated user found. Please try logging in again.')
            router.push('/auth')
            return
        }

        if (!displayName || !university || selectedInterests.length === 0) {
            console.error('❌ Validation failed', { displayName, university, selectedInterests })
            toast.error('Please fill in all required fields')
            return
        }

        setLoading(true)

        try {
            // Save profile directly using the stored user ID
            console.log('💾 Saving profile for user:', userId)

            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    user_id: userId,
                    display_name: displayName,
                    university: university,
                    interests: selectedInterests,
                    experience_level: experienceLevel,
                    is_mentor: isMentor,
                    updated_at: new Date().toISOString()
                })
                .select()

            if (error) {
                console.error('❌ Error saving profile:', error)
                toast.error(`Failed to save profile: ${error.message}`)
                setLoading(false)
                return
            }

            console.log('✅ Profile saved successfully:', data)
            toast.success('Profile created! Welcome aboard.')
            router.push('/')

        } catch (error) {
            console.error('❌ Unexpected error saving profile:', error)
            toast.error('Failed to save profile. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        )
    }

    // If no user is authenticated, show message
    if (!userId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0f1a] p-4">
                <p className="text-white text-center">Please log in to create your profile.</p>
                <Button onClick={() => window.location.href = 'http://localhost:5173'}>
                    Go to Login
                </Button>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1018]">
            <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

            <div className="relative mx-auto max-w-md px-4 py-8 sm:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20">
                            <Sparkles className="h-8 w-8 text-indigo-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Setup your profile</h1>
                        <p className="mt-2 text-sm text-gray-400">
                            Introduction yourself to the community. You can change this later.
                        </p>
                        {email && (
                            <p className="mt-1 text-xs text-indigo-400">{email}</p>
                        )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Display Name */}
                        <div className="space-y-2">
                            <Label htmlFor="displayName" className="text-white">Display Name</Label>
                            <Input
                                id="displayName"
                                placeholder="Your name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                            />
                        </div>

                        {/* University */}
                        <div className="space-y-2">
                            <Label htmlFor="university" className="text-white">University / College</Label>
                            <Input
                                id="university"
                                placeholder="Your university or college"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                            />
                        </div>

                        {/* Interests */}
                        <div className="space-y-3">
                            <Label className="text-white">Areas of Interest <span className="text-gray-500">(Select at least one)</span></Label>
                            <div className="flex flex-wrap gap-2">
                                {INTERESTS.map((interest) => (
                                    <Badge
                                        key={interest}
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer transition-colors",
                                            selectedInterests.includes(interest)
                                                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50"
                                                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                                        )}
                                        onClick={() => toggleInterest(interest)}
                                    >
                                        {selectedInterests.includes(interest) && (
                                            <Check className="h-3 w-3 mr-1" />
                                        )}
                                        {interest}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Experience Level */}
                        <div className="space-y-3">
                            <Label className="text-white">Experience Level</Label>
                            <RadioGroup
                                value={experienceLevel}
                                onValueChange={(value) => setExperienceLevel(value as 'Beginner' | 'Intermediate' | 'Advanced')}
                                className="flex gap-2"
                            >
                                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                    <div
                                        key={level}
                                        className={cn(
                                            "flex-1 cursor-pointer rounded-lg border p-3 text-center transition-colors",
                                            experienceLevel === level
                                                ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-300"
                                                : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                                        )}
                                        onClick={() => setExperienceLevel(level as 'Beginner' | 'Intermediate' | 'Advanced')}
                                    >
                                        <RadioGroupItem value={level} id={level} className="sr-only" />
                                        <span className="text-sm font-medium">{level}</span>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Mentor Option */}
                        <div className="flex items-start space-x-3 rounded-lg border border-white/10 bg-white/5 p-4">
                            <Checkbox
                                id="mentor"
                                checked={isMentor}
                                onCheckedChange={(checked) => setIsMentor(checked === true)}
                                className="mt-0.5"
                            />
                            <div className="flex-1">
                                <Label htmlFor="mentor" className="text-white cursor-pointer">
                                    I'm open to mentoring others
                                </Label>
                                <p className="text-xs text-gray-500 mt-1">
                                    Help students who are just starting out.
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Complete Profile
                                    <ChevronRight className="h-5 w-5 ml-1" />
                                </>
                            )}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}
