'use client'

import React from "react"

import { useState } from 'react'
import { useParams, notFound } from 'next/navigation'
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
import { mockTeams } from '@/lib/mock-data'

const eventTypeColors: Record<string, string> = {
  hackathon: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  ctf: 'bg-red-500/20 text-red-400 border-red-500/30',
  competition: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  project: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
}

export default function TeamDetailPage() {
  const params = useParams()
  const team = mockTeams.find((t) => t.id === params.id)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [applicationData, setApplicationData] = useState({
    name: '',
    role: '',
    experience: '',
    message: '',
  })

  if (!team) {
    notFound()
  }

  const slotsRemaining = team.teamSize - team.currentMembers.length
  const slotPercentage = (team.currentMembers.length / team.teamSize) * 100

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => {
      setIsApplyDialogOpen(false)
      setIsSubmitted(false)
      setApplicationData({ name: '', role: '', experience: '', message: '' })
    }, 2000)
  }

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
              <Badge variant="outline" className={eventTypeColors[team.eventType]}>
                {team.eventType}
              </Badge>
            </div>

            <h1 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
              {team.eventName}
            </h1>

            {/* Beginner/Mentor Callouts - Impossible to miss */}
            {(team.isBeginnerFriendly || team.hasMentor) && (
              <div className="mb-6 space-y-3">
                {team.isBeginnerFriendly && (
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
                {team.hasMentor && (
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
                Created {formatDate(team.createdAt)}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {team.currentMembers.length}/{team.teamSize} members
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
                  {team.currentMembers.length}/{team.teamSize}
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
                {team.techStack.map((tech) => (
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
                {team.rolesNeeded.map((role) => (
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
                {team.currentMembers.length} of {team.teamSize} members
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.currentMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4"
                >
                  <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback className="bg-secondary text-sm">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
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

          {/* Apply Button */}
          <div className="mt-8 flex justify-center">
            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25">
                  <Send className="h-5 w-5" />
                  Apply to Join
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Apply to Join Team</DialogTitle>
                  <DialogDescription>
                    Fill out this form to apply for {team.eventName}
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
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={applicationData.name}
                        onChange={(e) =>
                          setApplicationData({ ...applicationData, name: e.target.value })
                        }
                        required
                      />
                    </div>

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

                    <Button type="submit" className="w-full gap-2">
                      <Send className="h-4 w-4" />
                      Submit Application
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
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
