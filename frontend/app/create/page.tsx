'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, X, Sparkles, GraduationCap, Users, CheckCircle, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Navbar } from '@/components/navbar'
import { DatabaseService } from '@/lib/database-service'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const eventTypes = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'ctf', label: 'CTF' },
  { value: 'competition', label: 'Coding Competition' },
  { value: 'project', label: 'Project' },
]

const suggestedTechStacks = ['React', 'Python', 'TypeScript', 'Go', 'C++', 'Rust', 'Java', 'Node.js', 'PostgreSQL', 'Docker']
const suggestedRoles = ['Frontend Dev', 'Backend Dev', 'Full Stack Dev', 'ML Engineer', 'Designer', 'DevOps', 'Data Scientist', 'Security Expert']

export default function CreateTeamPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    eventType: '',
    techStack: [] as string[],
    rolesNeeded: [] as string[],
    teamSize: '4',
    isBeginnerFriendly: false,
    hasMentor: false,
    groupLink: '',
  })
  const [newTech, setNewTech] = useState('')
  const [newRole, setNewRole] = useState('')

  // Auth guard
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      setAuthChecking(false)
    }
    checkAuth()
  }, [router])

  const handleAddTech = (tech: string) => {
    if (tech && !formData.techStack.includes(tech)) {
      setFormData({ ...formData, techStack: [...formData.techStack, tech] })
      setNewTech('')
    }
  }

  const handleRemoveTech = (tech: string) => {
    setFormData({ ...formData, techStack: formData.techStack.filter((t) => t !== tech) })
  }

  const handleAddRole = (role: string) => {
    if (role && !formData.rolesNeeded.includes(role)) {
      setFormData({ ...formData, rolesNeeded: [...formData.rolesNeeded, role] })
      setNewRole('')
    }
  }

  const handleRemoveRole = (role: string) => {
    setFormData({ ...formData, rolesNeeded: formData.rolesNeeded.filter((r) => r !== role) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create team in database
      const result = await DatabaseService.createTeam({
        name: formData.eventName,
        description: formData.description,
        eventType: formData.eventType,
        techStack: formData.techStack,
        rolesNeeded: formData.rolesNeeded,
        teamSize: parseInt(formData.teamSize),
        isBeginnerFriendly: formData.isBeginnerFriendly,
        hasMentor: formData.hasMentor,
        groupLink: formData.groupLink || undefined,
      })

      if (result.success) {
        setIsSubmitting(false)
        setIsSuccess(true)

        // Redirect after success
        setTimeout(() => {
          router.push('/teams')
        }, 2000)
      } else {
        toast.error(result.error || 'Failed to create team')
        setIsSubmitting(false)
      }
    } catch (error) {
      toast.error('Failed to create team')
      setIsSubmitting(false)
    }
  }

  if (authChecking) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1018]" />
        <Navbar />
        <main className="relative flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </main>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1018]">
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
        </div>
        <Navbar />
        <main className="relative flex min-h-screen items-center justify-center px-4 pt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Team Created!</h1>
            <p className="mt-2 text-muted-foreground">
              Your team is now live. Redirecting to browse teams...
            </p>
          </motion.div>
        </main>
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

      <main className="relative mx-auto max-w-2xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Create a Team</h1>
            <p className="mt-2 text-muted-foreground">
              Set up your team and start recruiting members for your next event.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold text-foreground">Basic Information</h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="eventName">Event Name *</Label>
                  <Input
                    id="eventName"
                    placeholder="e.g., HackMIT 2026"
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your team, the event, and what you're looking to build..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Event Type *</Label>
                    <Select
                      value={formData.eventType}
                      onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Team Size *</Label>
                    <Select
                      value={formData.teamSize}
                      onValueChange={(value) => setFormData({ ...formData, teamSize: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 5, 6, 8, 10].map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size} members
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold text-foreground">Tech Stack</h2>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add technology..."
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTech(newTech)
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => handleAddTech(newTech)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Selected Tech */}
                {formData.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="gap-1 pr-1">
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="ml-1 rounded-full p-0.5 hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                <div className="flex flex-wrap gap-2">
                  {suggestedTechStacks
                    .filter((tech) => !formData.techStack.includes(tech))
                    .slice(0, 6)
                    .map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => handleAddTech(tech)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {tech}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>

            {/* Roles Needed */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold text-foreground">Roles Needed</h2>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add role..."
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddRole(newRole)
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => handleAddRole(newRole)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Selected Roles */}
                {formData.rolesNeeded.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.rolesNeeded.map((role) => (
                      <Badge key={role} className="gap-1 pr-1 bg-primary/10 text-primary">
                        {role}
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(role)}
                          className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                <div className="flex flex-wrap gap-2">
                  {suggestedRoles
                    .filter((role) => !formData.rolesNeeded.includes(role))
                    .slice(0, 4)
                    .map((role) => (
                      <Badge
                        key={role}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => handleAddRole(role)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {role}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>

            {/* Team Settings */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-6 text-lg font-semibold text-foreground">Team Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Sparkles className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Beginner Friendly</p>
                      <p className="text-sm text-muted-foreground">Welcome newcomers to your team</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.isBeginnerFriendly}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isBeginnerFriendly: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <GraduationCap className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Mentor Available</p>
                      <p className="text-sm text-muted-foreground">You will mentor team members</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.hasMentor}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, hasMentor: checked })
                    }
                  />
                </div>

                {/* Group Chat Link */}
                <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                    <Link2 className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="font-medium text-foreground">Group Chat Link</p>
                    <p className="text-sm text-muted-foreground">WhatsApp, Discord, or Slack — visible only to accepted members</p>
                    <Input
                      placeholder="https://chat.whatsapp.com/... or https://discord.gg/..."
                      value={formData.groupLink}
                      onChange={(e) => setFormData({ ...formData, groupLink: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <Link href="/teams">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Create Team
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  )
}
