'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

type QuestionTimerProps = {
  duration?: number
  running: boolean
  onTimeout: () => void
  onTick?: (remaining: number) => void
  size?: number
}

export default function QuestionTimer({
  duration = 10,
  running,
  onTimeout,
  onTick,
  size = 36,
}: QuestionTimerProps) {
  const progress = useMotionValue(1)
  const smoothProgress = useSpring(progress, { stiffness: 80, damping: 15 })
  const strokeDashoffset = useTransform(smoothProgress, [0, 1], [2 * Math.PI * (size / 2 - 2), 0])
  const colorRef = useRef(progress)

  useEffect(() => {
    if (!running) {
      progress.set(1)
      return
    }

    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000
      const remaining = Math.max(0, 1 - elapsed / duration)
      progress.set(remaining)
      onTick?.(Math.ceil(remaining * duration) / duration * duration)

      if (remaining <= 0) {
        clearInterval(interval)
        onTimeout()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [running, duration, onTimeout, onTick, progress])

  const circumference = 2 * Math.PI * (size / 2 - 2)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 2}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={2.5}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 2}
          fill="none"
          stroke="url(#timerGradient)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
        />
        <defs>
          <linearGradient id="timerGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
