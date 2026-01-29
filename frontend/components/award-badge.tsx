'use client'

import { motion } from 'framer-motion'
import { Trophy, Medal, Star, Shield, Flame, Heart, Zap, Crown } from 'lucide-react'
import type { Award } from '@/lib/mock-data'

interface AwardBadgeProps {
  award: Award
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const iconMap = {
  trophy: Trophy,
  medal: Medal,
  star: Star,
  shield: Shield,
  flame: Flame,
  heart: Heart,
  zap: Zap,
  crown: Crown,
}

// Collectible card style tiers
const rarityStyles = {
  common: {
    border: 'border-amber-700/50',
    bg: 'bg-gradient-to-b from-amber-950/80 via-amber-900/60 to-amber-950/90',
    icon: 'text-amber-500',
    iconGlow: '',
    shine: 'from-amber-600/0 via-amber-500/10 to-amber-600/0',
    tier: 'Bronze',
    tierColor: 'text-amber-600',
    tierBg: 'bg-amber-900/50',
  },
  rare: {
    border: 'border-slate-400/40',
    bg: 'bg-gradient-to-b from-slate-800/80 via-slate-700/60 to-slate-900/90',
    icon: 'text-slate-300',
    iconGlow: 'drop-shadow-[0_0_8px_rgba(203,213,225,0.3)]',
    shine: 'from-slate-400/0 via-slate-300/15 to-slate-400/0',
    tier: 'Silver',
    tierColor: 'text-slate-300',
    tierBg: 'bg-slate-700/50',
  },
  epic: {
    border: 'border-amber-400/50',
    bg: 'bg-gradient-to-b from-amber-900/80 via-yellow-800/60 to-amber-950/90',
    icon: 'text-amber-300',
    iconGlow: 'drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]',
    shine: 'from-yellow-400/0 via-yellow-300/25 to-yellow-400/0',
    tier: 'Gold',
    tierColor: 'text-amber-300',
    tierBg: 'bg-amber-800/50',
  },
  legendary: {
    border: 'border-violet-400/60',
    bg: 'bg-gradient-to-b from-violet-900/80 via-purple-800/70 to-violet-950/90',
    icon: 'text-violet-300',
    iconGlow: 'drop-shadow-[0_0_16px_rgba(167,139,250,0.6)]',
    shine: 'from-fuchsia-400/0 via-violet-300/30 to-fuchsia-400/0',
    tier: 'Legendary',
    tierColor: 'text-violet-300',
    tierBg: 'bg-violet-700/50',
  },
}

const sizeStyles = {
  sm: { card: 'w-16 h-20', icon: 'h-6 w-6', text: 'text-[10px]' },
  md: { card: 'w-20 h-24', icon: 'h-8 w-8', text: 'text-xs' },
  lg: { card: 'w-24 h-28', icon: 'h-10 w-10', text: 'text-xs' },
}

export function AwardBadge({ award, size = 'md', showLabel = false }: AwardBadgeProps) {
  const Icon = iconMap[award.icon]
  const styles = rarityStyles[award.rarity]
  const dimensions = sizeStyles[size]

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="group relative cursor-pointer"
    >
      {/* Card container */}
      <div
        className={`
          relative overflow-hidden rounded-lg border-2 ${styles.border} ${styles.bg} ${dimensions.card}
          flex flex-col items-center justify-center
          shadow-lg transition-shadow duration-300
          ${award.rarity === 'legendary' ? 'shadow-violet-500/25 group-hover:shadow-violet-500/40' : ''}
          ${award.rarity === 'epic' ? 'shadow-amber-500/20 group-hover:shadow-amber-500/35' : ''}
        `}
      >
        {/* Diagonal shine effect */}
        <div
          className={`
            pointer-events-none absolute inset-0 -translate-x-full
            bg-gradient-to-r ${styles.shine}
            skew-x-12 transition-transform duration-700
            group-hover:translate-x-full
          `}
        />

        {/* Top edge highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Legendary animated border glow */}
        {award.rarity === 'legendary' && (
          <div className="pointer-events-none absolute inset-0 rounded-lg animate-pulse ring-1 ring-violet-400/30 ring-inset" />
        )}

        {/* Icon with glow */}
        <div className="relative flex items-center justify-center flex-1">
          <Icon className={`${dimensions.icon} ${styles.icon} ${styles.iconGlow}`} />
        </div>

        {/* Tier label at bottom */}
        <div className={`w-full px-1 pb-1.5`}>
          <div className={`rounded px-1.5 py-0.5 text-center ${styles.tierBg}`}>
            <span className={`${dimensions.text} font-semibold uppercase tracking-wider ${styles.tierColor}`}>
              {styles.tier}
            </span>
          </div>
        </div>

        {/* Corner sparkle for epic/legendary */}
        {(award.rarity === 'legendary' || award.rarity === 'epic') && (
          <div className={`absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full ${
            award.rarity === 'legendary' ? 'bg-violet-400 shadow-sm shadow-violet-400' : 'bg-amber-400 shadow-sm shadow-amber-400'
          }`} />
        )}
      </div>

      {/* External label (optional) */}
      {showLabel && (
        <p className="mt-2 text-center text-xs font-medium text-foreground/80 line-clamp-1">
          {award.name}
        </p>
      )}
    </motion.div>
  )
}
