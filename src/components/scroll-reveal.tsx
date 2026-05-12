'use client'

import { motion } from 'framer-motion'
import { type ReactNode, useRef } from 'react'
import { useInView } from 'framer-motion'

type ScrollRevealProps = {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  className?: string
}

const directionOffset = {
  up: { y: 30, x: 0 },
  down: { y: -30, x: 0 },
  left: { x: 30, y: 0 },
  right: { x: -30, y: 0 },
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.4,
  className = '',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const offset = directionOffset[direction]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: offset.x, y: offset.y }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
