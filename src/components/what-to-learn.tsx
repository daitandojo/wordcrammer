import { ScrollReveal } from '@/components/scroll-reveal'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

const languages = [
  ['French', 'FR'],
  ['Italian', 'IT'],
  ['Danish', 'DK'],
  ['German', 'DE'],
  ['Ukrainian', 'UA'],
  ['Dutch', 'NL'],
  ['Portuguese', 'PT'],
  ['Hebrew', 'IL'],
  ['Spanish', 'ES'],
  ['Norwegian', 'NO'],
  ['Swedish', 'SE'],
  ['Finnish', 'FI'],
  ['Indonesian', 'ID'],
  ['Japanese', 'JP'],
  ['Chinese', 'CN'],
  ['Polish', 'PL'],
  ['Hungarian', 'HU'],
  ['Greek', 'GR'],
  ['Arabic', 'AR'],
  ['Romanian', 'RO'],
]

const colorMap: Record<string, string> = {
  FR: '#4156d3', IT: '#009a3e', DK: '#c60c30', DE: '#dd3333',
  UA: '#005bbb', NL: '#ff6600', PT: '#006600', IL: '#0038b8',
  ES: '#c60b1e', NO: '#002868', SE: '#006aa7', FI: '#003580',
  ID: '#ff0000', JP: '#bc002d', CN: '#de2910', PL: '#dc143c',
  HU: '#00664f', GR: '#0d5eaf', AR: '#007a3d', RO: '#002b7f',
}

export default function WhatToLearn() {
  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden" style={{ background: 'rgba(8,15,31,0.8)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03 }}>
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lang-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="0.6" fill="#fff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lang-grid)" />
        </svg>
      </div>

      <div className="relative max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs text-slate-600 mb-4 tracking-wide">
              <MapPin className="w-3.5 h-3.5" />
              20 languages available
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
              Which <span className="gradient-text">language</span>?
            </h2>
            <p className="text-sm text-slate-600">Click any flag to begin</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-3">
          {languages.map(([name, code], i) => (
            <ScrollReveal key={name} direction="up" delay={i * 0.03}>
              <a
                href="/login"
                className="group flex flex-col items-center gap-2.5 p-3 rounded-2xl transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-[11px] tracking-wide shadow-md transition-all duration-300 group-hover:shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${colorMap[code] || '#4ade80'}, ${colorMap[code] || '#22d65e'}cc)`,
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {code}
                </motion.div>
                <span className="text-[10px] text-slate-600 group-hover:text-slate-400 text-center font-medium leading-tight tracking-wide transition-colors">
                  {name}
                </span>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
