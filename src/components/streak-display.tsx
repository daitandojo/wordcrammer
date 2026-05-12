'use client'

import { useState, useEffect } from 'react'
import { Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type StreakDisplayProps = {
  streak: number
  className?: string
}

export default function StreakDisplay({ streak, className = '' }: StreakDisplayProps) {
  const [prevStreak, setPrevStreak] = useState(streak)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (streak > prevStreak) {
      setShowAnimation(true)
      setTimeout(() => setShowAnimation(false), 1500)
    }
    setPrevStreak(streak)
  }, [streak, prevStreak])

  if (streak <= 0) return null

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: [2, 1, 1.3, 1], opacity: [0, 1, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-orange-500/20 blur-md" />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        key={streak}
        initial={{ scale: 1 }}
        animate={showAnimation ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Flame className={`w-4 h-4 ${streak >= 7 ? 'text-orange-400' : streak >= 30 ? 'text-yellow-400' : 'text-orange-400'}`} />
      </motion.div>
      <motion.span
        key={`streak-${streak}`}
        initial={{ scale: 1 }}
        animate={showAnimation ? { scale: [1, 1.4, 1] } : {}}
        className="text-sm font-bold text-orange-400"
      >
        {streak}
      </motion.span>
      <span className="text-xs text-slate-500">day streak</span>
    </div>
  )
}
