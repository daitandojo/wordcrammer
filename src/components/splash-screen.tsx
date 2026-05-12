'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Crammy from '@/components/crammy'

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter')

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('hold'), 1800)
    const holdTimer = setTimeout(() => setPhase('exit'), 3400)
    const exitTimer = setTimeout(() => onComplete(), 4200)
    return () => {
      clearTimeout(enterTimer)
      clearTimeout(holdTimer)
      clearTimeout(exitTimer)
    }
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[200] bg-[#050a14] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* SVG background grid */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.025 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#4ade80" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(31,200,90,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Floating ring decorations */}
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" width="600" height="600" viewBox="0 0 600 600">
        <circle cx="300" cy="300" r="280" className="deco-ring" strokeWidth="1" />
        <circle cx="300" cy="300" r="220" className="deco-ring" strokeWidth="0.5" />
        <circle cx="300" cy="300" r="160" className="deco-ring" strokeWidth="0.3" opacity="0.5" />
        <motion.circle
          cx="300" cy="300" r="280"
          stroke="rgba(31,200,90,0.06)"
          strokeWidth="1"
          fill="none"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '300px 300px' }}
        />
        <motion.circle
          cx="300" cy="300" r="220"
          stroke="rgba(56,189,248,0.04)"
          strokeWidth="0.5"
          fill="none"
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '300px 300px' }}
        />
      </svg>

      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-8"
      >
        <Crammy mood={phase === 'hold' ? 'happy' : 'idle'} size={72} />
      </motion.div>

      {/* Wordmark */}
      <div className="flex items-center gap-0 relative">
        {['W', 'o', 'r', 'd', 'C', 'r', 'a', 'm', 'm', 'e', 'r'].map((letter, i) => (
          <motion.span
            key={i}
            className="font-display font-bold tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 13vw, 6.5rem)' }}
            initial={phase === 'exit' ? false : { opacity: 0, y: 32, scale: 0.7 }}
            animate={
              phase === 'enter'
                ? { opacity: 1, y: 0, scale: 1 }
                : phase === 'exit'
                  ? { opacity: 0, scale: 0.6, y: -20 }
                  : { opacity: 1, y: 0, scale: 1 }
            }
            transition={{
              duration: phase === 'exit' ? 0.3 : 0.55,
              delay: phase === 'enter' ? i * 0.07 + 0.1 : phase === 'exit' ? i * 0.015 : 0,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
          >
            <span
              style={{
                color: letter === 'C'
                  ? '#4ade80'
                  : i < 4
                    ? '#ffffff'
                    : 'rgba(255,255,255,0.55)',
              }}
            >
              {letter}
            </span>
          </motion.span>
        ))}
      </div>

      {/* Tagline */}
      <AnimatePresence>
        {phase === 'hold' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-px w-24 origin-center bg-gradient-to-r from-transparent via-green-400/40 to-transparent"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-xs tracking-[0.22em] uppercase text-slate-500 font-medium"
            >
              Master vocabulary in 20 languages
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit flash */}
      <AnimatePresence>
        {phase === 'exit' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.12, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-green-400 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
