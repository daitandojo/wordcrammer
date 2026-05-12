import { ScrollReveal } from '@/components/scroll-reveal'

export default function HistoryForm() {
  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden bg-mesh-deep">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />

      {/* Decorative */}
      <svg className="absolute bottom-0 left-1/2 translate-x-1/2 pointer-events-none" width="600" height="200" viewBox="0 0 600 200" preserveAspectRatio="none">
        <path d="M0,100 C150,0 450,200 600,100 L600,200 L0,200 Z" fill="rgba(8,15,31,0.3)" />
        <path d="M0,100 C150,20 450,180 600,100" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
      </svg>

      <div className="relative max-w-2xl mx-auto text-center">
        <ScrollReveal>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-700 font-medium mb-6">Our philosophy</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            Learning is an <span className="gradient-text">Art</span>
          </h2>
          <p className="text-slate-500 leading-relaxed text-base mb-8 max-w-lg mx-auto">
            WordCrammer was built for language enthusiasts by language enthusiasts. Our smart flashcard
            system adapts to your learning pace, making vocabulary acquisition natural and efficient.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="inline-flex items-center gap-8 py-6 px-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
            {[
              { value: '1,200+', label: 'Active learners' },
              { value: '20', label: 'Languages' },
              { value: '100%', label: 'Free' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="font-display text-xl font-bold text-white">{stat.value}</span>
                <span className="text-[11px] text-slate-600 tracking-wide">{stat.label}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
