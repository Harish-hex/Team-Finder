'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Sparkles, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
import { TeamCard } from '@/components/team-card'
import { mockTeams } from '@/lib/mock-data'
import { DatabaseService } from '@/lib/database-service'

const eventTypes = ['all', 'hackathon', 'ctf', 'competition', 'project'] as const
const techStacks = ['React', 'Python', 'TypeScript', 'Go', 'C++', 'Rust', 'Java', 'C']
const roles = ['Frontend Dev', 'Backend Dev', 'Full Stack Dev', 'ML Engineer', 'Designer', 'DevOps']

export default function TeamsPage() {
  const [search, setSearch] = useState('')
  const [eventType, setEventType] = useState<string>('all')
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [beginnerFriendly, setBeginnerFriendly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch teams from database
  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true)
      const data = await DatabaseService.getTeams()
      setTeams(data)
      setLoading(false)
    }
    fetchTeams()
  }, [])

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch =
          team.name.toLowerCase().includes(searchLower) ||
          team.description.toLowerCase().includes(searchLower) ||
          team.tech_stack.some((tech: string) => tech.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // Event type filter
      if (eventType !== 'all' && team.event_type !== eventType) return false

      // Tech stack filter
      if (selectedTech.length > 0) {
        const hasMatchingTech = selectedTech.some((tech) =>
          team.tech_stack.some((t: string) => t.toLowerCase().includes(tech.toLowerCase()))
        )
        if (!hasMatchingTech) return false
      }

      // Roles filter
      if (selectedRoles.length > 0) {
        const hasMatchingRole = selectedRoles.some((role) =>
          team.roles_needed.some((r: string) => r.toLowerCase().includes(role.toLowerCase()))
        )
        if (!hasMatchingRole) return false
      }

      // Beginner friendly filter
      if (beginnerFriendly && !team.is_beginner_friendly) return false

      return true
    })
  }, [teams, search, eventType, selectedTech, selectedRoles, beginnerFriendly])

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    )
  }

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const clearFilters = () => {
    setSearch('')
    setEventType('all')
    setSelectedTech([])
    setSelectedRoles([])
    setBeginnerFriendly(false)
  }

  const hasActiveFilters =
    search || eventType !== 'all' || selectedTech.length > 0 || selectedRoles.length > 0 || beginnerFriendly

  return (
    <div className="relative min-h-screen">
      {/* Night sky gradient background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0a0f1a] via-[#0d1525] to-[#0a1018]">
        {/* Subtle texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

      <Navbar />

      <main className="relative mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Browse Teams</h1>
          <p className="mt-2 text-muted-foreground">
            Find the perfect team for your next hackathon, CTF, or coding competition.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search teams, events, or tech stack..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Events' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {[selectedTech.length, selectedRoles.length, beginnerFriendly ? 1 : 0].reduce(
                    (a, b) => a + b,
                    0
                  )}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Filters</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                  <X className="h-4 w-4" />
                  Clear all
                </Button>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Tech Stack */}
              <div>
                <Label className="mb-3 block text-sm font-medium">Tech Stack</Label>
                <div className="flex flex-wrap gap-2">
                  {techStacks.map((tech) => (
                    <Badge
                      key={tech}
                      variant={selectedTech.includes(tech) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${selectedTech.includes(tech)
                        ? 'border-violet-500/50 bg-violet-500 text-violet-50 shadow-sm shadow-violet-500/20'
                        : 'hover:border-violet-500/30 hover:bg-violet-500/10'
                        }`}
                      onClick={() => toggleTech(tech)}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Roles */}
              <div>
                <Label className="mb-3 block text-sm font-medium">Roles Needed</Label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <Badge
                      key={role}
                      variant={selectedRoles.includes(role) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${selectedRoles.includes(role)
                        ? 'border-violet-500/50 bg-violet-500 text-violet-50 shadow-sm shadow-violet-500/20'
                        : 'hover:border-violet-500/30 hover:bg-violet-500/10'
                        }`}
                      onClick={() => toggleRole(role)}
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Beginner Friendly Toggle */}
              <div>
                <Label className="mb-3 block text-sm font-medium">Experience Level</Label>
                <div className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${beginnerFriendly
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-border bg-secondary/50'
                  }`}>
                  <Switch
                    id="beginner-friendly"
                    checked={beginnerFriendly}
                    onCheckedChange={setBeginnerFriendly}
                  />
                  <div className="flex items-center gap-2">
                    <Sparkles className={`h-4 w-4 ${beginnerFriendly ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                    <Label htmlFor="beginner-friendly" className="cursor-pointer text-sm">
                      Beginner Friendly Only
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredTeams.length}</span> teams
          </p>
        </div>

        {/* Team Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : filteredTeams.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TeamCard team={team} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No teams found</h3>
            <p className="mt-1 text-center text-muted-foreground">
              Try adjusting your filters or search terms.
            </p>
            <Button variant="outline" className="mt-4 bg-transparent" onClick={clearFilters}>
              Clear Filters
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  )
}
