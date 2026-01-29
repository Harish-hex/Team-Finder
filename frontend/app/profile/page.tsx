'use client'

import { motion } from 'framer-motion'
import {
  GraduationCap,
  Users,
  Code,
  Trophy,
  Edit2,
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'
import { AwardBadge } from '@/components/award-badge'
import { mockUser, mockTeams } from '@/lib/mock-data'

const experienceLevelColors = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  advanced: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  expert: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
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
  const userTeams = mockTeams.filter((team) => team.creatorId === mockUser.id)

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
                  <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
                  <AvatarFallback className="bg-violet-500 text-2xl text-violet-50">
                    {mockUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                      {mockUser.name}
                    </h1>
                    {mockUser.isMentor && (
                      <div className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-sm font-medium text-violet-400">
                        <GraduationCap className="h-4 w-4" />
                        Mentor
                      </div>
                    )}
                  </div>

                  <p className="mt-1 text-lg text-muted-foreground">{mockUser.role}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Badge
                      variant="outline"
                      className={experienceLevelColors[mockUser.experienceLevel]}
                    >
                      {mockUser.experienceLevel.charAt(0).toUpperCase() +
                        mockUser.experienceLevel.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Edit Button */}
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">About</h2>
            <p className="leading-relaxed text-muted-foreground">{mockUser.about}</p>
          </motion.div>

          {/* Skills Section */}
          <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Code className="h-5 w-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-foreground">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {mockUser.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Awards Section - Collectible Showcase */}
          <motion.div variants={item} className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Header with collection count */}
            <div className="border-b border-border bg-gradient-to-r from-violet-500/10 via-transparent to-transparent px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20">
                    <Trophy className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Collection</h2>
                    <p className="text-sm text-muted-foreground">{mockUser.awards.length} awards earned</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-amber-700" />
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-violet-400" />
                </div>
              </div>
            </div>

            {/* Awards grid - card display */}
            <div className="p-6">
              <div className="flex flex-wrap justify-center gap-4">
                {mockUser.awards.map((award, index) => (
                  <motion.div
                    key={award.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08, type: 'spring', stiffness: 300 }}
                    className="flex flex-col items-center"
                  >
                    <AwardBadge award={award} size="lg" />
                    <p className="mt-2.5 max-w-[96px] text-center text-xs font-medium text-foreground/90 leading-tight">
                      {award.name}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Locked awards - mysterious slots */}
              <div className="mt-8 border-t border-border/50 pt-6">
                <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
                  Locked Awards
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="group relative"
                    >
                      <div className="flex h-28 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 bg-muted/10 transition-colors hover:border-violet-500/30 hover:bg-violet-500/5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/30">
                          <span className="text-lg font-bold text-muted-foreground/40">?</span>
                        </div>
                        <span className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/40">
                          Hidden
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Teams Participated - Card list */}
          {userTeams.length > 0 && (
            <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-violet-400" />
                  <h2 className="text-lg font-semibold text-foreground">Teams</h2>
                </div>
              </div>

              <div className="space-y-3">
                {userTeams.map((team) => (
                  <Link key={team.id} href={`/teams/${team.id}`}>
                    <div className="group flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4 transition-all hover:border-violet-500/30 hover:bg-violet-500/5">
                      <div>
                        <p className="font-medium text-foreground transition-colors group-hover:text-violet-300">{team.eventName}</p>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="capitalize">{team.eventType}</span>
                          <span>
                            {team.currentMembers.length}/{team.teamSize} members
                          </span>
                        </div>
                      </div>
                      <div className="flex -space-x-2">
                        {team.currentMembers.slice(0, 3).map((member) => (
                          <Avatar key={member.id} className="h-8 w-8 border-2 border-card">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback className="bg-secondary text-xs">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
