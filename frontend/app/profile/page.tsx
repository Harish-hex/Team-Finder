'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  Users,
  Code,
  Trophy,
  Edit2,
  Loader2,
  Trash2,
  LogOut,
  Bell,
  Check,
  X,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { supabase, Team } from '@/lib/supabase'
import { DatabaseService } from '@/lib/database-service'
import { EditProfileDialog } from '@/components/edit-profile-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ProfileData {
  id: string
  user_id: string
  display_name: string
  university: string
  interests: string[]
  experience_level: 'Beginner' | 'Intermediate' | 'Advanced'
  is_mentor: boolean
  avatar_url?: string
  created_at: string
}

interface TeamWithApplications extends Team {
  pending_applications: number
}

interface ApplicationData {
  id: string
  user_id: string
  preferred_role: string
  experience: string
  message: string
  status: string
  created_at: string
  display_name?: string
  university?: string
  experience_level?: string
  avatar_url?: string
  interests?: string[]
  contact_info?: string
}

const experienceLevelColors: Record<string, string> = {
  Beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Intermediate: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Advanced: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [ownedTeams, setOwnedTeams] = useState<TeamWithApplications[]>([])
  const [joinedTeams, setJoinedTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null)
  const [leavingTeamId, setLeavingTeamId] = useState<string | null>(null)
  const [selectedTeamForApplications, setSelectedTeamForApplications] = useState<string | null>(null)
  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [processingApplicationId, setProcessingApplicationId] = useState<string | null>(null)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/auth')
        return
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          router.push('/onboarding/profile')
          return
        }
        setError('Failed to load profile')
        return
      }

      setProfile(profileData)

      // Fetch owned teams with application counts
      const teamsWithApps = await DatabaseService.getMyTeamsWithApplications()
      setOwnedTeams(teamsWithApps)

      // Fetch joined teams
      const joined = await DatabaseService.getJoinedTeams()
      setJoinedTeams(joined)

    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [router])

  const handleDeleteTeam = async (teamId: string) => {
    setDeletingTeamId(teamId)
    const result = await DatabaseService.deleteTeam(teamId)
    if (result.success) {
      setOwnedTeams(prev => prev.filter(t => t.id !== teamId))
    } else {
      alert(result.error || 'Failed to delete team')
    }
    setDeletingTeamId(null)
  }

  const handleLeaveTeam = async (teamId: string) => {
    setLeavingTeamId(teamId)
    const result = await DatabaseService.leaveTeam(teamId)
    if (result.success) {
      setJoinedTeams(prev => prev.filter(t => t.id !== teamId))
    } else {
      alert(result.error || 'Failed to leave team')
    }
    setLeavingTeamId(null)
  }

  const handleViewApplications = async (teamId: string) => {
    setSelectedTeamForApplications(teamId)
    setLoadingApplications(true)
    const apps = await DatabaseService.getTeamApplications(teamId)
    setApplications(apps)
    setLoadingApplications(false)
  }

  const handleApproveApplication = async (applicationId: string) => {
    setProcessingApplicationId(applicationId)
    const result = await DatabaseService.approveApplication(applicationId)
    if (result.success) {
      setApplications(prev => prev.filter(a => a.id !== applicationId))
      // Refresh owned teams to update application count
      const teamsWithApps = await DatabaseService.getMyTeamsWithApplications()
      setOwnedTeams(teamsWithApps)
    } else {
      alert(result.error || 'Failed to approve application')
    }
    setProcessingApplicationId(null)
  }

  const handleRejectApplication = async (applicationId: string) => {
    setProcessingApplicationId(applicationId)
    const result = await DatabaseService.rejectApplication(applicationId)
    if (result.success) {
      setApplications(prev => prev.filter(a => a.id !== applicationId))
      // Refresh owned teams to update application count
      const teamsWithApps = await DatabaseService.getMyTeamsWithApplications()
      setOwnedTeams(teamsWithApps)
    } else {
      alert(result.error || 'Failed to reject application')
    }
    setProcessingApplicationId(null)
  }

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1018]" />
        <Navbar />
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-red-400">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  // No profile state
  if (!profile) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1018]" />
        <Navbar />
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-white">No profile found.</p>
          <Link href="/onboarding/profile">
            <Button>Create Profile</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Night sky gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1018]">
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

      <Navbar />

      <main className="relative mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Profile Header */}
          <motion.div
            variants={item}
            className="relative overflow-hidden rounded-xl border border-border bg-card"
          >
            {/* Background gradient - purple */}
            <div className="absolute inset-0 h-32 bg-gradient-to-b from-violet-500/15 to-transparent" />

            <div className="relative p-6 md:p-8">
              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                {/* Avatar */}
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl shadow-violet-500/10">
                  <AvatarImage
                    src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.display_name}`}
                    alt={profile.display_name}
                  />
                  <AvatarFallback className="bg-violet-500 text-2xl text-violet-50">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
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

                {/* Edit Button */}
                <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setIsEditProfileOpen(true)}>
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Edit Profile Dialog */}
          <EditProfileDialog
            profile={profile}
            open={isEditProfileOpen}
            onOpenChange={setIsEditProfileOpen}
            onSaved={fetchData}
          />

          {/* Interests Section */}
          <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Code className="h-5 w-5 text-violet-400" />
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

          {/* Your Teams (Owned) */}
          <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-foreground">Your Teams</h2>
              </div>
              <Link href="/create">
                <Button size="sm" variant="outline" className="gap-1">
                  Create Team
                </Button>
              </Link>
            </div>

            {ownedTeams.length > 0 ? (
              <div className="space-y-3">
                {ownedTeams.map((team) => (
                  <div key={team.id} className="group rounded-lg border border-border bg-secondary/30 p-4 transition-all hover:border-violet-500/30 hover:bg-violet-500/5">
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/teams/${team.id}`} className="flex-1">
                        <p className="font-medium text-foreground transition-colors group-hover:text-violet-300">
                          {team.name}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="capitalize">{team.event_type}</span>
                          <span>Max {team.max_members} members</span>
                        </div>
                      </Link>

                      <div className="flex items-center gap-2">
                        {/* View Applications Button */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="relative gap-1"
                              onClick={() => handleViewApplications(team.id)}
                            >
                              <Bell className="h-4 w-4" />
                              Applications
                              {team.pending_applications > 0 && (
                                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                  {team.pending_applications}
                                </span>
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Applications for {team.name}</DialogTitle>
                              <DialogDescription>
                                Review and manage team join requests
                              </DialogDescription>
                            </DialogHeader>

                            {loadingApplications ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                              </div>
                            ) : applications.filter(a => a.status === 'pending').length > 0 ? (
                              <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
                                {applications.filter(a => a.status === 'pending').map((app) => (
                                  <div key={app.id} className="rounded-xl border border-border bg-secondary/20 p-5 space-y-4">
                                    {/* Applicant Header */}
                                    <div className="flex items-start gap-4">
                                      <Avatar className="h-14 w-14 border-2 border-border shrink-0">
                                        <AvatarImage
                                          src={app.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${app.display_name}`}
                                          alt={app.display_name || 'Applicant'}
                                        />
                                        <AvatarFallback className="bg-violet-500 text-violet-50 text-lg">
                                          {app.display_name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h3 className="text-base font-semibold text-foreground">
                                            {app.display_name || 'Unknown User'}
                                          </h3>
                                          {app.experience_level && (
                                            <Badge
                                              variant="outline"
                                              className={experienceLevelColors[app.experience_level] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}
                                            >
                                              {app.experience_level}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          {app.university || 'Unknown University'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          Applied {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Interests */}
                                    {app.interests && app.interests.length > 0 && (
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Interests</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {app.interests.map((interest: string) => (
                                            <span key={interest} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                                              {interest}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Application Details */}
                                    <div className="grid gap-3 sm:grid-cols-2">
                                      <div className="rounded-lg bg-secondary/40 p-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Preferred Role</p>
                                        <p className="text-sm font-medium text-foreground">{app.preferred_role}</p>
                                      </div>
                                      <div className="rounded-lg bg-secondary/40 p-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Experience</p>
                                        <p className="text-sm text-foreground">{app.experience}</p>
                                      </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Why they want to join</p>
                                      <p className="text-sm text-foreground leading-relaxed bg-secondary/30 rounded-lg p-3">
                                        {app.message}
                                      </p>
                                    </div>

                                    {/* Contact */}
                                    {app.contact_info && (
                                      <div className="rounded-lg bg-secondary/40 p-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Phone Number</p>
                                        <p className="text-sm font-medium text-foreground">{app.contact_info}</p>
                                      </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-1">
                                      <Button
                                        size="sm"
                                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 flex-1 sm:flex-none"
                                        disabled={processingApplicationId === app.id}
                                        onClick={() => handleApproveApplication(app.id)}
                                      >
                                        {processingApplicationId === app.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Check className="h-4 w-4" />
                                        )}
                                        Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10 flex-1 sm:flex-none"
                                        disabled={processingApplicationId === app.id}
                                        onClick={() => handleRejectApplication(app.id)}
                                      >
                                        <X className="h-4 w-4" />
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8 text-center">
                                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">No pending applications</p>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Delete Team Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Team</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{team.name}&quot;? This action cannot be undone.
                                All team members will be removed and pending applications will be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDeleteTeam(team.id)}
                                disabled={deletingTeamId === team.id}
                              >
                                {deletingTeamId === team.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Delete Team
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">You haven't created any teams yet.</p>
                <Link href="/create" className="mt-2 text-sm text-indigo-400 hover:text-indigo-300">
                  Create your first team →
                </Link>
              </div>
            )}
          </motion.div>

          {/* Teams You've Joined */}
          <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-foreground">Teams You've Joined</h2>
            </div>

            {joinedTeams.length > 0 ? (
              <div className="space-y-3">
                {joinedTeams.map((team) => (
                  <div key={team.id} className="group rounded-lg border border-border bg-secondary/30 p-4 transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5">
                    <div className="flex items-start justify-between gap-4">
                      <Link href={`/teams/${team.id}`} className="flex-1">
                        <p className="font-medium text-foreground transition-colors group-hover:text-cyan-300">
                          {team.name}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="capitalize">{team.event_type}</span>
                          <span>Max {team.max_members} members</span>
                        </div>
                      </Link>

                      {/* Leave Team Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                          >
                            <LogOut className="h-4 w-4" />
                            Leave
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Leave Team</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to leave &quot;{team.name}&quot;? You will need to apply again if you want to rejoin.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-amber-600 hover:bg-amber-700"
                              onClick={() => handleLeaveTeam(team.id)}
                              disabled={leavingTeamId === team.id}
                            >
                              {leavingTeamId === team.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Leave Team
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">You haven't joined any teams yet.</p>
                <Link href="/teams" className="mt-2 text-sm text-indigo-400 hover:text-indigo-300">
                  Browse teams to join →
                </Link>
              </div>
            )}
          </motion.div>

          {/* Achievements Placeholder */}
          <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
            </div>
            <p className="mt-4 text-center text-muted-foreground">
              No achievements yet. Join events and teams to earn badges!
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
