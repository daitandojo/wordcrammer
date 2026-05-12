import { Globe, GraduationCap, Briefcase } from 'lucide-react'
import { ScrollReveal } from '@/components/scroll-reveal'
import { motion } from 'framer-motion'

const reasons = [
  {
    title: 'Friends Abroad',
    description: 'Connect with people from around the world. Speaking their language opens doors to genuine friendships and cultural understanding.',
    icon: Globe,
  },
  {
    title: 'Good Grades',
    description: 'Excel in your language classes with regular vocabulary practice. Our smart algorithm focuses on words you struggle with most.',
    icon: GraduationCap,
  },
  {
    title: 'International Job',
    description: 'Stand out to employers with multilingual skills. WordCrammer helps you build vocabulary confidence for the global workplace.',
    icon: Briefcase,
  },
]

export default function ReasonsToCram() {
  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden bg-mesh-deep">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />

      {/* Decorative */}
      <svg className="absolute top-0 right-0 pointer-events-none" width="400" height="400" viewBox="0 0 400 400">
        <circle cx="350" cy="50" r="180" className="deco-ring" strokeWidth="0.5" />
        <circle cx="350" cy="50" r="120" className="deco-ring" strokeWidth="0.3" opacity="0.5" />
      </svg>

      <div className="relative max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-700 font-medium mb-4">Why WordCrammer</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
              Why <span className="gradient-text">Cram</span> with Us?
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reasons.map((reason, i) => {
            const Icon = reason.icon
            return (
              <ScrollReveal key={reason.title} direction="up" delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
                  className="group relative rounded-2xl p-[1px] overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                  }}
                >
                  <div className="rounded-2xl p-8 h-full" style={{ background: 'rgba(8,15,31,0.6)', backdropFilter: 'blur(16px)' }}>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(31,200,90,0.06)', border: '1px solid rgba(31,200,90,0.08)' }}>
                      <Icon className="w-5.5 h-5.5" style={{ color: 'rgba(74,222,128,0.7)' }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3">{reason.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{reason.description}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
