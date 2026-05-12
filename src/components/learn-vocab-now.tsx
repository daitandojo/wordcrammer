import { Brain, Volume2, BarChart3, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ScrollReveal } from '@/components/scroll-reveal'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Brain,
    title: 'Smart Selection',
    desc: 'Our algorithm focuses on words you haven\'t mastered yet, maximizing every study minute.',
  },
  {
    icon: Volume2,
    title: 'Text-to-Speech',
    desc: 'Hear correct pronunciation in 20 languages with native voice support.',
  },
  {
    icon: BarChart3,
    title: 'Track Progress',
    desc: 'Detailed analytics show your improvement per word, per topic, and overall.',
  },
]

export default function LearnVocabNow() {
  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      {/* SVG grid accent */}
      <svg className="absolute top-1/2 left-0 -translate-y-1/2 pointer-events-none opacity-[0.015]" width="600" height="600" viewBox="0 0 600 600">
        <defs>
          <pattern id="feat-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4ade80" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#feat-grid)" />
      </svg>

      {/* Rings */}
      <svg className="absolute bottom-[10%] left-[5%] pointer-events-none animate-float-slow" width="300" height="300" viewBox="0 0 300 300">
        <circle cx="150" cy="150" r="140" className="deco-ring" strokeWidth="0.5" />
        <circle cx="150" cy="150" r="90" className="deco-ring-accent" strokeWidth="0.5" />
      </svg>

      <div className="relative max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            AI-Powered <span className="gradient-text">Learning</span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
          {features.map((item, i) => {
            const Icon = item.icon
            return (
              <ScrollReveal key={item.title} direction="up" delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -3, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
                  className="text-left rounded-2xl p-6 transition-all duration-300"
                  style={{
                    background: 'rgba(8,15,31,0.5)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.08)' }}>
                    <Icon className="w-5 h-5" style={{ color: 'rgba(167,139,250,0.7)' }} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              </ScrollReveal>
            )
          })}
        </div>

        <ScrollReveal>
          <p className="text-sm text-slate-500 mb-8 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: 'rgba(167,139,250,0.5)' }} />
            Best of all — it&apos;s{' '}
            <span className="text-slate-300 font-medium">completely free</span>.
            No subscriptions, no limits.
          </p>
          <Link href="/login" className="btn-primary px-8 py-4 text-sm font-semibold">
            Get Started Free
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}
