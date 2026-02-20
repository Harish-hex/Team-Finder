'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    GraduationCap,
    Users,
    Code,
    Loader2,
    ArrowLeft,
    AlertCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Navbar } from '@/components/navbar'
import { supabase, Profile, Team } from '@/lib/supabase'
import { DatabaseService } from '@/lib/database-service'

const experienceLevelColors: Record<string, string> = {
    Beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Intermediate: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Advanced: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
}

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

export default function PublicProfilePage() {
    const params = useParams()
    const router = useRouter()
    const userId = params.userId as string

    const [profile, setProfile] = useState<Profile | null>(null)
    const [teams, setTeams] = useState<Team[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true)

                // Check auth
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/auth/login')
                    return
                }

                // If viewing own profile, redirect to /profile
                if (user.id === userId) {
                    router.push('/profile')
                    return
                }

                const result = await DatabaseService.getPublicProfile(userId)
                if (!result.profile) {
                    setError('Profile not found')
                } else {
                    setProfile(result.profile)
                    setTeams(result.teams)
                }
            } catch (err) {
                console.error('Error loading profile:', err)
                setError('Failed to load profile')
            } finally {
                setLoading(false)
            }
        }

        if (userId) fetchProfile()
    }, [userId, router])

    if (loading) {
        return (
            <div className="relative min-h-screen">
                <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1018]" />
                <Navbar />
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="relative min-h-screen">
                <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1018]" />
                <Navbar />
                <main className="relative mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                    <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
                        <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
                        <h3 className="text-lg font-semibold text-foreground">Profile Not Found</h3>
                        <p className="mt-1 text-muted-foreground">This user doesn&apos;t exist or their profile hasn&apos;t been created yet.</p>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1018]">
                <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
            </div>

            <Navbar />

            <main className="relative mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                </Button>

                <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                    {/* Profile Header */}
                    <motion.div variants={item} className="relative overflow-hidden rounded-xl border border-border bg-card">
                        <div className="absolute inset-0 h-32 bg-gradient-to-b from-indigo-500/15 to-transparent" />

                        <div className="relative p-6 md:p-8">
                            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-xl shadow-indigo-500/10">
                                    <AvatarImage
                                        src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.display_name}`}
                                        alt={profile.display_name}
                                    />
                                    <AvatarFallback className="bg-indigo-500 text-2xl text-indigo-50">
                                        {profile.display_name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                                            {profile.display_name}
                                        </h1>
                                        {profile.is_mentor && (
                                            <div className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-sm font-medium text-violet-400">
                                                <GraduationCap className="h-4 w-4" />
                                                Mentor
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-1 text-lg text-muted-foreground">{profile.university}</p>
                                    <div className="mt-3 flex flex-wrap items-center gap-3">
                                        <Badge
                                            variant="outline"
                                            className={experienceLevelColors[profile.experience_level] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}
                                        >
                                            {profile.experience_level}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Interests */}
                    <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <Code className="h-5 w-5 text-indigo-400" />
                            <h2 className="text-lg font-semibold text-foreground">Interests</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.interests && profile.interests.length > 0 ? (
                                profile.interests.map((interest) => (
                                    <span
                                        key={interest}
                                        className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
                                    >
                                        {interest}
                                    </span>
                                ))
                            ) : (
                                <p className="text-muted-foreground">No interests added yet.</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Teams */}
                    <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-indigo-400" />
                            <h2 className="text-lg font-semibold text-foreground">Teams</h2>
                        </div>

                        {teams.length > 0 ? (
                            <div className="space-y-3">
                                {teams.map((team) => (
                                    <Link key={team.id} href={`/teams/${team.id}`}>
                                        <div className="group rounded-lg border border-border bg-secondary/30 p-4 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/5">
                                            <p className="font-medium text-foreground transition-colors group-hover:text-indigo-300">
                                                {team.name}
                                            </p>
                                            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                                                <span className="capitalize">{team.event_type}</span>
                                                <span>Max {team.max_members} members</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Not part of any teams yet.</p>
                        )}
                    </motion.div>
                </motion.div>
            </main>
        </div>
    )
}
