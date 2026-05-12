'use client'

import { motion, AnimatePresence } from 'framer-motion'

type Mood = 'idle' | 'happy' | 'celebrating'

type Props = {
  mood?: Mood
  size?: number
  className?: string
}

export default function Crammy({ mood = 'idle', size = 80, className = '' }: Props) {
  const bodyScale = mood === 'celebrating' ? [1, 1.08, 1] : [1, 1.02, 1]
  const eyeY = mood === 'happy' ? -1 : 0
  const blinkProgress = mood === 'idle' ? [1, 0, 1] : [1, 1, 1]

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={{ scale: bodyScale }}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
    >
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        {/* Body */}
        <rect x="15" y="22" width="50" height="42" rx="12" fill="url(#bodyGrad)" />
        {/* Pages */}
        <rect x="22" y="18" width="36" height="38" rx="8" fill="#1e293b" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <rect x="26" y="24" width="28" height="4" rx="2" fill="rgba(34,197,94,0.2)" />
        <rect x="26" y="32" width="20" height="4" rx="2" fill="rgba(34,197,94,0.15)" />
        <rect x="26" y="40" width="24" height="4" rx="2" fill="rgba(34,197,94,0.15)" />

        {/* Eyes */}
        <motion.ellipse
          cx="30" cy="44" rx="3.5" ry="4"
          fill="white"
          animate={{ scaleY: blinkProgress, cy: 44 + eyeY }}
          transition={{ duration: 0.15 }}
        />
        <motion.ellipse
          cx="50" cy="44" rx="3.5" ry="4"
          fill="white"
          animate={{ scaleY: blinkProgress, cy: 44 + eyeY }}
          transition={{ duration: 0.15 }}
        />
        {/* Pupils */}
        <circle cx="30" cy="44" r="1.5" fill="#0b1120" />
        <circle cx="50" cy="44" r="1.5" fill="#0b1120" />

        {/* Smile */}
        <motion.path
          d="M32 52 Q40 58 48 52"
          stroke={mood === 'happy' ? '#22c55e' : 'rgba(255,255,255,0.5)'}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          animate={{ d: mood === 'happy' ? 'M30 54 Q40 62 50 54' : 'M32 52 Q40 58 48 52' }}
        />

        {/* Book spine */}
        <line x1="15" y1="28" x2="15" y2="64" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="65" y1="28" x2="65" y2="64" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* Sparkle when happy */}
        <AnimatePresence>
          {mood === 'celebrating' && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <circle cx="10" cy="20" r="3" fill="#eab308" />
              <circle cx="70" cy="18" r="2.5" fill="#22c55e" />
              <circle cx="58" cy="12" r="2" fill="#3b82f6" />
              <circle cx="22" cy="14" r="2" fill="#a78bfa" />
            </motion.g>
          )}
        </AnimatePresence>

        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  )
}
