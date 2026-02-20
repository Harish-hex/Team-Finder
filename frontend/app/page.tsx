'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  Plus,
  Calendar,
  MapPin,
  ExternalLink,
  Trash2,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  Clock,
  UserCheck,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/navbar'
import { supabase, Team, Event } from '@/lib/supabase'
import { DatabaseService } from '@/lib/database-service'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

// ─── Animation variants ────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

// ─── Event type styling map ────────────────────────────
const eventTypeStyles: Record<string, string> = {
  hackathon: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  ctf: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  competition: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  workshop: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  meetup: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  other: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
}

interface ProfileData {
  display_name: string
  avatar_url?: string
}

interface TeamWithApplications extends Team {
  pending_applications: number
}

// ════════════════════════════════════════════════════════
// Main Dashboard Page
// ════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [ownedTeams, setOwnedTeams] = useState<TeamWithApplications[]>([])
  const [joinedTeams, setJoinedTeams] = useState<Team[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)

  // Event creation state
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [creatingEvent, setCreatingEvent] = useState(false)
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)
  const [brochureFile, setBrochureFile] = useState<File | null>(null)
  const [brochurePreview, setBrochurePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form fields
  const [eventTitle, setEventTitle] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventType, setEventType] = useState('')
  const [eventMaxMembers, setEventMaxMembers] = useState('')
  const [eventVenue, setEventVenue] = useState('')
  const [eventRegLink, setEventRegLink] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()
        if (authError || !user) {
          setRedirecting(true)
          window.location.href = '/auth/login'
          return
        }

        // Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('user_id', user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          setRedirecting(true)
          window.location.href = '/onboarding/profile'
          return
        }
        setProfile(profileData)

        // Teams
        const [owned, joined, eventList, adminStatus] = await Promise.all([
          DatabaseService.getMyTeamsWithApplications(),
          DatabaseService.getJoinedTeams(),
          DatabaseService.getEvents(),
          DatabaseService.isAdmin(),
        ])
        setOwnedTeams(owned)
        setJoinedTeams(joined)
        setEvents(eventList)
        setIsAdmin(adminStatus)
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // ── Brochure file handler ─────────────────────────────
  const handleBrochureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBrochureFile(file)
    const reader = new FileReader()
    reader.onload = () => setBrochurePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const clearBrochure = () => {
    setBrochureFile(null)
    setBrochurePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Create event handler ──────────────────────────────
  const handleCreateEvent = async () => {
    if (!eventTitle.trim() || !eventDescription.trim()) return
    setCreatingEvent(true)

    let brochureUrl: string | undefined
    if (brochureFile) {
      const uploadResult = await DatabaseService.uploadBrochure(brochureFile)
      if (uploadResult.url) {
        brochureUrl = uploadResult.url
      }
    }

    const result = await DatabaseService.createEvent({
      title: eventTitle.trim(),
      description: eventDescription.trim(),
      event_date: eventDate || undefined,
      event_type: eventType || undefined,
      max_members: eventMaxMembers ? parseInt(eventMaxMembers) : undefined,
      venue: eventVenue.trim() || undefined,
      registration_link: eventRegLink.trim() || undefined,
      brochure_url: brochureUrl,
    })

    if (result.success) {
      // Reset form
      setEventTitle('')
      setEventDescription('')
      setEventDate('')
      setEventType('')
      setEventMaxMembers('')
      setEventVenue('')
      setEventRegLink('')
      clearBrochure()
      setShowCreateEvent(false)
      // Refresh events
      const updated = await DatabaseService.getEvents()
      setEvents(updated)
    } else {
      alert(result.error || 'Failed to create event')
    }
    setCreatingEvent(false)
  }

  // ── Delete event handler ──────────────────────────────
  const handleDeleteEvent = async (eventId: string) => {
    setDeletingEventId(eventId)
    const result = await DatabaseService.deleteEvent(eventId)
    if (result.success) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
    } else {
      alert(result.error || 'Failed to delete event')
    }
    setDeletingEventId(null)
  }

  // ── Loading / Redirecting ─────────────────────────────
  if (loading || redirecting) {
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

  const allTeams = [
    ...ownedTeams.map((t) => ({ ...t, owned: true })),
    ...joinedTeams.map((t) => ({ ...t, owned: false })),
  ]

  // ════════════════════════════════════════════════════════
  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1018]">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />
      </div>

      <Navbar />

      <main className="relative mx-auto max-w-5xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
          {/* ─── Greeting Header ────────────────────────── */}
          <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white/95 sm:text-3xl">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-blue-300 bg-clip-text text-transparent">
                  {profile?.display_name || 'there'}
                </span>
              </h1>
              <p className="mt-1 text-blue-100/50">Here&apos;s what&apos;s happening with your teams and events.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/create">
                <Button className="gap-2 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400">
                  <Plus className="h-4 w-4" />
                  Create Team
                </Button>
              </Link>
              <Link href="/teams">
                <Button variant="outline" className="gap-2 border-white/20 bg-white/5 text-white/90 hover:bg-white/10 hover:text-white">
                  <Search className="h-4 w-4" />
                  Browse
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════════
              MY TEAMS SECTION
              ═══════════════════════════════════════════════ */}
          <motion.section variants={item}>
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white/90">My Teams</h2>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-medium text-indigo-300">
                {allTeams.length}
              </span>
            </div>

            {allTeams.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {allTeams.map((team) => (
                  <Link key={team.id} href={`/teams/${team.id}`}>
                    <div className="group rounded-xl border border-white/10 bg-[#0d1320]/60 p-4 backdrop-blur-sm transition-all hover:border-indigo-500/30 hover:bg-indigo-500/5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-white/90 transition-colors group-hover:text-indigo-300">
                            {team.name}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-blue-100/40">
                            <Badge variant="outline" className="border-white/10 bg-white/5 text-blue-100/50 text-xs">
                              {team.event_type}
                            </Badge>
                            <span>Max {team.max_members}</span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            (team as any).owned
                              ? 'border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs'
                              : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs'
                          }
                        >
                          {(team as any).owned ? 'Owner' : 'Member'}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-[#0d1320]/40 p-8 text-center backdrop-blur-sm">
                <Users className="mx-auto h-10 w-10 text-blue-100/20" />
                <p className="mt-3 text-blue-100/40">You haven&apos;t joined any teams yet.</p>
                <div className="mt-4 flex justify-center gap-3">
                  <Link href="/create">
                    <Button size="sm" className="gap-1 bg-indigo-500 text-white hover:bg-indigo-400">
                      <Plus className="h-3.5 w-3.5" />
                      Create Team
                    </Button>
                  </Link>
                  <Link href="/teams">
                    <Button size="sm" variant="outline" className="gap-1 border-white/20 text-white/70 hover:text-white">
                      <Search className="h-3.5 w-3.5" />
                      Browse Teams
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.section>

          {/* ═══════════════════════════════════════════════
              EVENTS SECTION
              ═══════════════════════════════════════════════ */}
          <motion.section variants={item}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white/90">Events</h2>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                  {events.length}
                </span>
              </div>

              {/* Admin: Add Event Button */}
              {isAdmin && (
                <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500">
                      <Plus className="h-4 w-4" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                      <DialogDescription>Add an event for all users to see on the dashboard.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                      {/* Title */}
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-white/70">
                          Event Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={eventTitle}
                          onChange={(e) => setEventTitle(e.target.value)}
                          placeholder="e.g. HackFest 2026"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white/90 placeholder-white/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-white/70">
                          Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          value={eventDescription}
                          onChange={(e) => setEventDescription(e.target.value)}
                          placeholder="Brief description of the event..."
                          rows={3}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white/90 placeholder-white/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Date + Type row */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-white/70">Date</label>
                          <input
                            type="datetime-local"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white/90 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-white/70">Event Type</label>
                          <select
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white/90 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                          >
                            <option value="">Select type</option>
                            <option value="hackathon">Hackathon</option>
                            <option value="ctf">CTF</option>
                            <option value="competition">Competition</option>
                            <option value="workshop">Workshop</option>
                            <option value="meetup">Meetup</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Members + Venue row */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-white/70">Max Members / Team Size</label>
                          <input
                            type="number"
                            min="1"
                            value={eventMaxMembers}
                            onChange={(e) => setEventMaxMembers(e.target.value)}
                            placeholder="e.g. 4"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white/90 placeholder-white/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-white/70">Venue</label>
                          <input
                            type="text"
                            value={eventVenue}
                            onChange={(e) => setEventVenue(e.target.value)}
                            placeholder="e.g. Main Auditorium"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white/90 placeholder-white/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Registration link */}
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-white/70">Registration Link</label>
                        <input
                          type="url"
                          value={eventRegLink}
                          onChange={(e) => setEventRegLink(e.target.value)}
                          placeholder="https://..."
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white/90 placeholder-white/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Brochure upload */}
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-white/70">Event Brochure / Poster</label>
                        {brochurePreview ? (
                          <div className="relative rounded-lg border border-white/10 overflow-hidden">
                            <img src={brochurePreview} alt="Brochure preview" className="max-h-48 w-full object-contain bg-black/20" />
                            <button
                              onClick={clearBrochure}
                              className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white/80 hover:bg-black/80 hover:text-white transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/5 py-6 text-sm text-white/40 transition-colors hover:border-indigo-500/40 hover:bg-indigo-500/5 hover:text-white/60"
                          >
                            <Upload className="h-5 w-5" />
                            Click to upload image (PNG, JPG, WEBP)
                          </button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleBrochureSelect}
                          className="hidden"
                        />
                      </div>

                      {/* Submit */}
                      <Button
                        onClick={handleCreateEvent}
                        disabled={creatingEvent || !eventTitle.trim() || !eventDescription.trim()}
                        className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
                      >
                        {creatingEvent ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Publish Event
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Events list */}
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="group overflow-hidden rounded-xl border border-white/10 bg-[#0d1320]/60 backdrop-blur-sm transition-all hover:border-emerald-500/20"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Brochure thumbnail */}
                      {event.brochure_url && (
                        <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-48">
                          <Image
                            src={event.brochure_url}
                            alt={`${event.title} brochure`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold text-white/90">{event.title}</h3>
                              {event.event_type && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs capitalize ${eventTypeStyles[event.event_type] || eventTypeStyles.other}`}
                                >
                                  {event.event_type}
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1.5 text-sm leading-relaxed text-blue-100/50">{event.description}</p>
                          </div>

                          {/* Admin delete */}
                          {isAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 shrink-0 text-white/20 hover:bg-red-500/10 hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;{event.title}&quot;? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDeleteEvent(event.id)}
                                    disabled={deletingEventId === event.id}
                                  >
                                    {deletingEventId === event.id && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>

                        {/* Meta row */}
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-blue-100/40">
                          {event.event_date && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(event.event_date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                          {event.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {event.venue}
                            </span>
                          )}
                          {event.max_members && (
                            <span className="flex items-center gap-1">
                              <UserCheck className="h-3.5 w-3.5" />
                              Team size: {event.max_members}
                            </span>
                          )}
                        </div>

                        {/* Registration link */}
                        {event.registration_link && (
                          <div className="mt-3">
                            <a
                              href={event.registration_link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Register
                              </Button>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-[#0d1320]/40 p-8 text-center backdrop-blur-sm">
                <Calendar className="mx-auto h-10 w-10 text-blue-100/20" />
                <p className="mt-3 text-blue-100/40">No events yet. Check back soon!</p>
              </div>
            )}
          </motion.section>
        </motion.div>
      </main>
    </div>
  )
}
