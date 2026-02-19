'use client'

import React from "react"
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Users,
  Clock,
  Sparkles,
  GraduationCap,
  Calendar,
  Code,
  Send,
  CheckCircle,
  Heart,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Navbar } from '@/components/navbar'
import { DatabaseService } from '@/lib/database-service'
import { Team } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

const eventTypeColors: Record<string, string> = {
  hackathon: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  ctf: 'bg-red-500/20 text-red-400 border-red-500/30',
  competition: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  project: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
}

interface TeamMemberWithProfile {
  user_id: string
  display_name: string
  role: string
  experience_level: string
  avatar_url?: string
}

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.id as string

  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [applicationData, setApplicationData] = useState({
    role: '',
    experience: '',
    message: '',
    contactInfo: '',
  })

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      setCurrentUserId(user?.id || null)
    }
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user)
      setCurrentUserId(session?.user?.id || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch team data
  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch team details
        const teamData = await DatabaseService.getTeamById(teamId)
        if (!teamData) {
          setError('Team not found')
          setLoading(false)
          return
        }
        setTeam(teamData)

        // Fetch team members
        const membersData = await DatabaseService.getTeamMembers(teamId)
        setMembers(membersData || [])
      } catch (err) {
        console.error('Error fetching team:', err)
        setError('Failed to load team data')
      } finally {
        setLoading(false)
      }
    }

    if (teamId) {
      fetchTeamData()
    }
  }, [teamId])

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await DatabaseService.applyToTeam({
        teamId: teamId,
        preferredRole: applicationData.role,
        experience: applicationData.experience,
        message: applicationData.message,
        contactInfo: applicationData.contactInfo,
      })

      if (result.success) {
        setIsSubmitted(true)
        setTimeout(() => {
          setIsApplyDialogOpen(false)
          setIsSubmitted(false)
          setApplicationData({ role: '', experience: '', message: '', contactInfo: '' })
        }, 2000)
      } else {
        setSubmitError(result.error || 'Failed to submit application')
      }
    } catch (err) {
      setSubmitError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1018]" />
        <Navbar />
        <main className="relative mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p className="mt-4 text-muted-foreground">Loading team details...</p>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error || !team) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1018]" />
        <Navbar />
        <main className="relative mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
          <Link href="/teams">
            <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Teams
            </Button>
          </Link>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Team Not Found</h3>
            <p className="mt-1 text-center text-muted-foreground">
              {error || "This team doesn't exist or has been removed."}
            </p>
            <Button variant="outline" className="mt-4 bg-transparent" onClick={() => router.push('/teams')}>
              Browse Other Teams
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const slotsRemaining = team.max_members - members.length
  const slotPercentage = (members.length / team.max_members) * 100

  return (
    <div className="relative min-h-screen">
      {/* Night sky gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1018]">
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

      <Navbar />

      <main className="relative mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/teams">
          <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Teams
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header Card */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            {/* Event Type Badge */}
            <div className="mb-4">
              <Badge variant="outline" className={eventTypeColors[team.event_type]}>
                {team.event_type}
              </Badge>
            </div>

            <h1 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
              {team.name}
            </h1>

            {/* Beginner/Mentor Callouts - Impossible to miss */}
            {(team.is_beginner_friendly || team.has_mentor) && (
              <div className="mb-6 space-y-3">
                {team.is_beginner_friendly && (
                  <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                      <Sparkles className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-400">Beginner Friendly</p>
                      <p className="text-sm text-emerald-300/80">
                        New to competitions? No worries - this team welcomes beginners and will help you learn along the way.
                      </p>
                    </div>
                  </div>
                )}
                {team.has_mentor && (
                  <div className="flex items-start gap-3 rounded-lg border border-violet-500/30 bg-violet-500/10 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                      <GraduationCap className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-violet-400">Mentor Available</p>
                      <p className="text-sm text-violet-300/80">
                        An experienced mentor is part of this team, ready to guide and support your growth.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Created {formatDate(team.created_at)}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {members.length}/{team.max_members} members
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {slotsRemaining} slots open
              </div>
            </div>

            <p className="text-foreground leading-relaxed">{team.description}</p>

            {/* Slots Progress Bar */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Team capacity</span>
                <span className="font-medium text-foreground">
                  {members.length}/{team.max_members}
                  <span className="ml-1 text-violet-400">({slotsRemaining} open)</span>
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${slotPercentage}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                />
              </div>
            </div>
          </div>

          {/* Tech Stack & Roles */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Tech Stack */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Code className="h-5 w-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-foreground">Tech Stack</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {team.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Roles Needed */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-foreground">Roles Needed</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {team.roles_needed.map((role) => (
                  <Badge key={role} className="border-violet-500/30 bg-violet-500/10 text-violet-300">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Current Members */}
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Current Team</h2>
              <span className="text-sm text-muted-foreground">
                {members.length} of {team.max_members} members
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4"
                >
                  <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage
                      src={member.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.display_name}`}
                      alt={member.display_name || 'Member'}
                    />
                    <AvatarFallback className="bg-secondary text-sm">
                      {member.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{member.display_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.role === 'admin' ? 'Team Lead' : 'Member'}
                    </p>
                  </div>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: slotsRemaining }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center gap-3 rounded-lg border border-dashed border-violet-500/30 bg-violet-500/5 p-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-violet-500/30">
                    <Heart className="h-5 w-5 text-violet-400/50" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-violet-300/80">Open Slot</p>
                    <p className="text-xs text-muted-foreground">Could be you!</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group Chat Link - Members Only */}
          {team.group_link && currentUserId && members.some(m => m.user_id === currentUserId) && (
            <div className="mt-6 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <ExternalLink className="h-5 w-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-foreground">Team Group Chat</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Only visible to team members</p>
              <a
                href={team.group_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 text-sm font-medium text-indigo-300 hover:bg-indigo-500/30 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open Group Chat
              </a>
            </div>
          )}

          {/* Apply Button */}
          <div className="mt-8 flex justify-center">
            {isAuthenticated ? (
              <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25" disabled={slotsRemaining === 0}>
                    <Send className="h-5 w-5" />
                    {slotsRemaining === 0 ? 'Team is Full' : 'Apply to Join'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Apply to Join Team</DialogTitle>
                    <DialogDescription>
                      Fill out this form to apply for {team.name}
                    </DialogDescription>
                  </DialogHeader>

                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-8"
                    >
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                        <CheckCircle className="h-8 w-8 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Application Sent!</h3>
                      <p className="mt-1 text-center text-sm text-muted-foreground">
                        The team lead will review your application.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmitApplication} className="space-y-4 pt-4">
                      {submitError && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                          {submitError}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="role">Preferred Role</Label>
                        <Input
                          id="role"
                          placeholder="e.g., Frontend Developer"
                          value={applicationData.role}
                          onChange={(e) =>
                            setApplicationData({ ...applicationData, role: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="experience">Experience Level</Label>
                        <Input
                          id="experience"
                          placeholder="e.g., Intermediate, 2 years"
                          value={applicationData.experience}
                          onChange={(e) =>
                            setApplicationData({ ...applicationData, experience: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Why do you want to join?</Label>
                        <Textarea
                          id="message"
                          placeholder="Tell the team about yourself and why you'd be a great fit..."
                          value={applicationData.message}
                          onChange={(e) =>
                            setApplicationData({ ...applicationData, message: e.target.value })
                          }
                          rows={4}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactInfo">Phone Number</Label>
                        <Input
                          id="contactInfo"
                          type="tel"
                          placeholder="e.g., 9876543210"
                          value={applicationData.contactInfo}
                          onChange={(e) => {
                            // Only allow digits
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                            setApplicationData({ ...applicationData, contactInfo: val })
                          }}
                          pattern="[1-9][0-9]{9}"
                          title="Phone number must be 10 digits and cannot start with 0"
                          maxLength={10}
                          required
                        />
                        {applicationData.contactInfo.length > 0 && applicationData.contactInfo.length < 10 && (
                          <p className="text-xs text-amber-400">Must be exactly 10 digits ({applicationData.contactInfo.length}/10)</p>
                        )}
                        {applicationData.contactInfo.startsWith('0') && (
                          <p className="text-xs text-red-400">Phone number cannot start with 0</p>
                        )}
                      </div>

                      <Button type="submit" className="w-full gap-2" disabled={isSubmitting || applicationData.contactInfo.length !== 10 || applicationData.contactInfo.startsWith('0')}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit Application
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            ) : (
              <div className="text-center">
                <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25" onClick={() => router.push('/auth/login')}>
                  <Send className="h-5 w-5" />
                  Sign In to Apply
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  You need to be logged in to apply for teams
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
