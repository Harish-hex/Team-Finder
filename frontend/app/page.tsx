'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Users, Search, Sparkles, Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/navbar'

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

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background illustration - ambient atmosphere */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/night-workspace.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Darkening overlay */}
        <div className="absolute inset-0 bg-[#0a0f1a]/80" />
        {/* Cool blue tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-transparent to-[#0a0f1a]/90" />
        {/* Subtle blur via backdrop */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-center pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-3xl"
          >
            {/* Main content panel */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1320]/70 p-8 backdrop-blur-md md:p-12 bg-transparent">
              <motion.h1
                variants={item}
                className="text-balance text-center text-4xl font-bold tracking-tight text-white/95 sm:text-5xl md:text-6xl"
              >
                Find your squad.
                <br />
                <span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
                  Win together.
                </span>
              </motion.h1>

              <motion.p
                variants={item}
                className="mt-6 text-pretty text-center text-lg text-blue-100/60"
              >
                A place for college students to find teams, learn together, and ship.
                <br className="hidden sm:block" />
                Learn from experienced mentors. Compete alongside friends.
              </motion.p>

              <motion.div
                variants={item}
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Link href="/create">
                  <Button size="lg" className="h-13 gap-2 bg-indigo-500 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 hover:shadow-xl hover:shadow-indigo-500/25">
                    <Users className="h-5 w-5" />
                    Create Team
                  </Button>
                </Link>
                <Link href="/teams">
                  <Button size="lg" variant="outline" className="h-13 gap-2 border-white/20 bg-white/5 px-8 text-base font-semibold text-white/90 backdrop-blur-sm hover:bg-white/10 hover:text-white">
                    <Search className="h-5 w-5" />
                    Browse Teams
                  </Button>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                variants={item}
                className="mt-10 flex flex-wrap items-center justify-center gap-4 border-t border-white/10 pt-8 text-sm"
              >
                <div className="flex items-center gap-2 text-blue-100/50">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20">
                    <Shield className="h-3.5 w-3.5 text-indigo-300" />
                  </div>
                  <span>Mentors ready to guide</span>
                </div>
                <div className="flex items-center gap-2 text-blue-100/50">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                  </div>
                  <span>Beginner-friendly teams</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Bottom */}
      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/10 bg-[#0d1320]/70 p-8 backdrop-blur-md md:p-10"
          >
            <div className="text-center">
              <h2 className="text-balance text-xl font-semibold text-white/90 md:text-2xl">
                Ready to compete?
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-pretty text-blue-100/50">
                Join teams forming now for upcoming hackathons, CTFs, and coding competitions.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/create">
                  <Button className="gap-2 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400">
                    Create Your Team
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/teams">
                  <Button variant="outline" className="gap-2 border-white/20 bg-white/5 text-white/90 hover:bg-white/10 hover:text-white">
                    Browse Teams
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/80">
                <Users className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-white/90">Fireteam</span>
            </div>
            <p className="text-sm text-blue-100/40">
              College-only tech team finder. Find your squad, win together.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
