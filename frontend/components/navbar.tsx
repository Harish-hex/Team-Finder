'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Plus, Search, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/teams', label: 'Browse Teams', icon: Search },
  { href: '/create', label: 'Create Team', icon: Plus },
  { href: '/profile', label: 'Profile', icon: User },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0f1a]/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/80">
            <Users className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white/90">Fireteam</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'relative gap-2',
                    isActive ? 'text-indigo-300' : 'text-white/50 hover:text-white/80'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-x-2 -bottom-[17px] h-0.5 bg-indigo-400"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="border-b border-white/10 bg-[#0a0f1a]/95 backdrop-blur-lg md:hidden"
        >
          <div className="space-y-1 px-4 py-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-2',
                      isActive ? 'bg-indigo-500/10 text-indigo-300' : 'text-white/50'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}
    </header>
  )
}
