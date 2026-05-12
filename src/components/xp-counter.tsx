'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

type XpCounterProps = {
  value: number
  previous?: number
  earned?: number
  className?: string
}

export default function XpCounter({ value, previous = 0, earned = 0, className = '' }: XpCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const count = useMotionValue(previous)
  const smoothCount = useSpring(count, { stiffness: 60, damping: 20 })
  const rounded = useTransform(smoothCount, (v) => Math.round(v))

  useEffect(() => {
    count.set(value)
  }, [value, count])

  return (
    <span className={`font-mono ${className}`}>
      <motion.span>{rounded}</motion.span>
      {earned > 0 && (
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: [0, 1, 0], y: -4 }}
          transition={{ duration: 1.5 }}
          className="text-green-400 text-xs ml-1"
        >
          +{earned}
        </motion.span>
      )}
    </span>
  )
}
