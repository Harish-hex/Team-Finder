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
import { AuthService, UserProfile } from '@/lib/auth-service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const INTERESTS = [
    'Hackathons', 'CTFs', 'Web Dev', 'Mobile App',
    'ML / AI', 'Systems Programming', 'Game Dev', 'Blockchain'
]

export default function MobileOnboardingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Form State
    const [displayName, setDisplayName] = useState('')
    const [university, setUniversity] = useState('')
    const [selectedInterests, setSelectedInterests] = useState<string[]>([])
    const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner')
    const [isMentor, setIsMentor] = useState(false)

    // Retrieve email from session
    const [email, setEmail] = useState<string | null>(null)

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('auth_email')
        if (!storedEmail) {
            // In a real app, maybe redirect to login. For prototype, we might allow testing or redirect.
            // safely redirect
            router.push('/auth')
            return
        }
        setEmail(storedEmail)
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
        if (!email) return

        if (!displayName || !university || selectedInterests.length === 0) {
            toast.error('Please fill in all required fields')
            return
        }

        setLoading(true)

        try {
            const profileData: UserProfile['profile'] = {
                displayName,
                university,
                interests: selectedInterests,
                experienceLevel,
                isMentor
            }

            await AuthService.saveProfile(email, profileData)
            toast.success('Profile created! Welcome aboard.')
            router.push('/') // Redirect to home/dashboard
        } catch (error) {
            toast.error('Failed to save profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen py-10 px-4 flex justify-center">
            {/* Background elements */}
            <div className="fixed inset-0 -z-10 bg-[#0a0f1a]">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-[#0a0f1a]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <Card className="border-white/10 bg-[#0d1320]/80 backdrop-blur-md shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
                            <Rocket className="w-8 h-8 text-indigo-400" />
                            Setup your profile
                        </CardTitle>
                        <CardDescription className="text-blue-100/60 text-lg">
                            Introduction yourself to the community. You can change this later.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Basic Info */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="displayName" className="text-blue-100">Display Name</Label>
                                    <Input
                                        id="displayName"
                                        placeholder="e.g. Alex Chen"
                                        value={displayName}
                                        onChange={e => setDisplayName(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white focus:border-indigo-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="university" className="text-blue-100">University / College</Label>
                                    <Input
                                        id="university"
                                        placeholder="e.g. Stanform University"
                                        value={university}
                                        onChange={e => setUniversity(e.target.value)}
                                        className="bg-white/5 border-white/10 text-white focus:border-indigo-500/50"
                                    />
                                </div>
                            </div>

                            {/* Interests */}
                            <div className="space-y-3">
                                <Label className="text-blue-100">Areas of Interest <span className="text-xs text-muted-foreground">(Select at least one)</span></Label>
                                <div className="flex flex-wrap gap-2">
                                    {INTERESTS.map(interest => {
                                        const isSelected = selectedInterests.includes(interest)
                                        return (
                                            <Badge
                                                key={interest}
                                                variant="outline"
                                                onClick={() => toggleInterest(interest)}
                                                className={cn(
                                                    "cursor-pointer px-4 py-2 text-sm transition-all border-white/10 select-none",
                                                    isSelected
                                                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 hover:bg-indigo-500/30"
                                                        : "hover:bg-white/5 text-blue-100/60 hover:text-blue-100"
                                                )}
                                            >
                                                {isSelected && <Check className="w-3 h-3 mr-1.5 inline-block" />}
                                                {interest}
                                            </Badge>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Experience Level */}
                            <div className="space-y-3">
                                <Label className="text-blue-100">Experience Level</Label>
                                <RadioGroup
                                    value={experienceLevel}
                                    onValueChange={(val: any) => setExperienceLevel(val)}
                                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                >
                                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                        <div key={level}>
                                            <RadioGroupItem value={level} id={level} className="peer sr-only" />
                                            <Label
                                                htmlFor={level}
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:text-white peer-data-[state=checked]:border-indigo-500 peer-data-[state=checked]:text-indigo-400 [&:has([data-state=checked])]:border-indigo-500 cursor-pointer transition-all"
                                            >
                                                <span className="text-base font-semibold">{level}</span>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            {/* Mentor Checkbox */}
                            <div className="flex items-center space-x-2 rounded-lg border border-white/10 bg-white/5 p-4">
                                <Checkbox
                                    id="mentor"
                                    checked={isMentor}
                                    onCheckedChange={(c) => setIsMentor(!!c)}
                                    className="border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:text-white"
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor="mentor"
                                        className="text-sm font-medium leading-none text-blue-100 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        I’m open to mentoring others
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Help students who are just starting out.
                                    </p>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 text-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin mr-2" />
                                ) : (
                                    <>
                                        Complete Profile
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>

                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
