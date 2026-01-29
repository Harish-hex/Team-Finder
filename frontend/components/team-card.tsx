'use client'

import { motion } from 'framer-motion'
import { Users, Sparkles, GraduationCap, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Team } from '@/lib/mock-data'

interface TeamCardProps {
  team: Team
}

const eventTypeColors: Record<string, string> = {
  hackathon: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  ctf: 'bg-red-500/20 text-red-400 border-red-500/30',
  competition: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  project: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
}

export function TeamCard({ team }: TeamCardProps) {
  const slotsRemaining = team.teamSize - team.currentMembers.length
  const slotPercentage = (team.currentMembers.length / team.teamSize) * 100
  const timeAgo = getTimeAgo(team.createdAt)

  return (
    <Link href={`/teams/${team.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="group relative rounded-xl border border-white/10 bg-[#0d1320]/80 p-5 backdrop-blur-sm transition-all duration-300 hover:border-indigo-400/30 hover:bg-[#0d1320]/90"
      >
        <div className="relative">
          {/* Event Name - Most Prominent */}
          <h3 className="mb-3 text-xl font-bold text-white/90 transition-colors group-hover:text-indigo-300">
            {team.eventName}
          </h3>

          {/* Beginner Friendly / Mentor Badges - Visually Distinct */}
          {(team.isBeginnerFriendly || team.hasMentor) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {team.isBeginnerFriendly && (
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-300">
                  <Sparkles className="h-4 w-4" />
                  Beginner Friendly
                </div>
              )}
              {team.hasMentor && (
                <div className="flex items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-sm font-medium text-indigo-300">
                  <GraduationCap className="h-4 w-4" />
                  Has Mentor
                </div>
              )}
            </div>
          )}

          {/* Roles Needed */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-blue-100/40">Looking for</p>
            <div className="flex flex-wrap gap-1.5">
              {team.rolesNeeded.map((role) => (
                <Badge key={role} variant="secondary" className="border border-indigo-400/20 bg-indigo-500/10 text-indigo-200">
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {team.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-medium text-blue-100/50"
              >
                {tech}
              </span>
            ))}
            {team.techStack.length > 4 && (
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-medium text-blue-100/50">
                +{team.techStack.length - 4}
              </span>
            )}
          </div>

          {/* Slots Remaining - Visual Progress Bar */}
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-blue-100/40">Team slots</span>
              <span className="font-medium text-white/80">
                {team.currentMembers.length}/{team.teamSize}
                <span className="ml-1 text-indigo-300">({slotsRemaining} open)</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${slotPercentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-400"
              />
            </div>
          </div>

          {/* Footer - Metadata */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {team.currentMembers.slice(0, 3).map((member) => (
                  <Avatar key={member.id} className="h-7 w-7 border-2 border-[#0d1320]">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback className="bg-indigo-500/20 text-xs text-indigo-200">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {team.currentMembers.length > 3 && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0d1320] bg-white/10 text-xs font-medium text-blue-100/50">
                    +{team.currentMembers.length - 3}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-100/40">
                <Badge variant="outline" className={`${eventTypeColors[team.eventType]} text-xs`}>
                  {team.eventType}
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-blue-100/30 transition-all group-hover:translate-x-1 group-hover:text-indigo-300" />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  return 'Just now'
}
