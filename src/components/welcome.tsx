'use client'

import { useState } from 'react'
import { ArrowRight, Play, Shield } from 'lucide-react'
import Link from 'next/link'
import LiveCounter from '@/components/live-counter'
import DemoMode from '@/components/demo-mode'
import { motion } from 'framer-motion'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function Welcome() {
  const [showDemo, setShowDemo] = useState(false)

  if (showDemo) {
    return (
      <div className="h-dvh flex items-center justify-center px-4 bg-[#050a14]">
        <DemoMode onComplete={() => window.location.href = '/login'} />
      </div>
    )
  }

  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center px-8 overflow-hidden bg-[#050a14]">
      {/* Dot grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.02 }}>
        <defs>
          <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="24" cy="24" r="0.8" fill="#4ade80" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      {/* Ambient glow blobs */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full pointer-events-none animate-drift" style={{ background: 'radial-gradient(ellipse, rgba(31,200,90,0.05) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[25%] right-[-15%] w-[500px] h-[500px] rounded-full pointer-events-none animate-drift-delayed" style={{ background: 'radial-gradient(ellipse, rgba(167,139,250,0.04) 0%, transparent 70%)' }} />
      <div className="absolute top-[55%] left-[-8%] w-[350px] h-[350px] rounded-full pointer-events-none animate-float" style={{ background: 'radial-gradient(ellipse, rgba(56,189,248,0.03) 0%, transparent 70%)' }} />

      {/* Decorative rings */}
      <svg className="absolute top-[12%] right-[8%] pointer-events-none animate-drift" width="340" height="340" viewBox="0 0 340 340">
        <circle cx="170" cy="170" r="160" className="deco-ring" strokeWidth="0.5" />
        <circle cx="170" cy="170" r="115" className="deco-ring" strokeWidth="0.3" opacity="0.5" />
      </svg>
      <svg className="absolute bottom-[18%] left-[6%]" width="260" height="260" viewBox="0 0 260 260">
        <circle cx="130" cy="130" r="120" className="deco-ring" strokeWidth="0.5" />
        <circle cx="130" cy="130" r="80" className="deco-ring-accent" strokeWidth="0.5" />
      </svg>

      {/* Content */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative text-center w-full max-w-3xl mx-auto flex flex-col items-center"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-green-500/10 bg-green-500/[0.04] text-green-400/60 text-xs font-medium tracking-wide mb-20">
          <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-green-400/50" />
          Join 1,200+ language learners
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={fadeUp} className="font-display font-bold text-white leading-[1.05] tracking-tight mb-16" style={{ fontSize: 'clamp(3rem, 11vw, 5.5rem)' }}>
          Speak a new language
          <br />
          <span className="gradient-text">in 2 weeks.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={fadeUp} className="text-base md:text-lg text-slate-500 mb-24 max-w-xl mx-auto leading-relaxed">
          Master the{' '}
          <span className="text-slate-300 font-medium">1,200 most useful phrases</span>{' '}
          ranked by real-world frequency.{' '}
          <span className="text-slate-300 font-medium">200 minutes</span> to basic fluency.
        </motion.p>

        {/* Stats row */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-20 mb-24">
          {[
            { value: '40', label: 'cards per session' },
            { value: '20', label: 'min per set' },
            { value: '30', label: 'sets = fluency' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 relative">
              {i > 0 && (
                <div className="absolute left-[-40px] top-1/2 -translate-y-1/2 w-px h-10 bg-white/[0.04]" />
              )}
              <span className="text-3xl font-display font-bold text-white">{s.value}</span>
              <span className="text-[11px] text-slate-600 tracking-wide">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-5 mb-32">
          <Link
            href="/login"
            className="btn-primary px-12 py-4 text-sm group"
          >
            Start speaking Spanish — free
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <button
            onClick={() => setShowDemo(true)}
            className="btn-ghost text-sm text-slate-600 hover:text-slate-300 group"
          >
            <Play className="w-3.5 h-3.5" />
            Try 5 cards — no sign-up
          </button>
        </motion.div>

        {/* Trust row */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-8 text-xs text-slate-700 mb-24">
          <span className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-green-500/40" />
            No credit card
          </span>
          <div className="w-px h-3 bg-white/[0.06]" />
          <span className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-green-500/40" />
            Free forever
          </span>
          <div className="w-px h-3 bg-white/[0.06]" />
          <span className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-green-500/40" />
            AI-powered
          </span>
        </motion.div>
      </motion.div>

      {/* Live counter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative mb-20"
      >
        <LiveCounter />
      </motion.div>

      {/* Testimonial ticker */}
      <div className="absolute bottom-10 left-0 right-0 overflow-hidden py-3">
        <div className="flex gap-16" style={{ animation: 'scroll-left 40s linear infinite', whiteSpace: 'nowrap' }}>
          {[
            '"Learned basic Spanish in 3 days"',
            '"Passed my French exam after 15 sets"',
            '"Ordering food in Italian now"',
            '"Defended myself in Portuguese in a week"',
            '"Got my first B2 certificate"',
            '"Spanish conversations at work now"',
            '"Learned basic Spanish in 3 days"',
            '"Passed my French exam after 15 sets"',
          ].map((t, i) => (
            <span key={i} className="text-sm text-slate-800 italic font-light">{t}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
