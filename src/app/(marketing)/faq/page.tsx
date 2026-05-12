import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

const faqs = [
  {
    q: 'What level of fluency will I reach?',
    a: 'After completing all 30 sets (1200 phrases), you will have a vocabulary of the ~1200 most common atomic phrases in your target language. This is sufficient for moderate conversational fluency — you can handle everyday situations, express opinions, and understand most common conversations. Research suggests 1200 well-chosen phrases cover roughly 85% of daily language use.',
  },
  {
    q: 'How long does each session take?',
    a: 'A typical session of 40 phrases takes about 20 minutes. Some users finish in 15 minutes, others take 25. The time depends on how familiar you already are with the vocabulary.',
  },
  {
    q: 'How long until I can speak the language?',
    a: 'After 10 sets (200 minutes of study), you can defend yourself in basic conversation. After all 30 sets (~10 hours), you have moderate fluency. A dedicated learner can achieve basic fluency in 2-3 days of focused work.',
  },
  {
    q: 'Can I learn multiple languages at once?',
    a: 'Yes, you can switch your target language at any time in Settings. However, we recommend focusing on one language at a time for fastest progress.',
  },
  {
    q: 'How are words selected for each session?',
    a: 'Our smart algorithm picks 40 words based on three tiers: (1) words you\'ve struggled with (high attempt/correct ratio), (2) words you\'re learning (one correct so far), and (3) new words you haven\'t seen. Within each tier, words you haven\'t seen recently get priority — this creates automatic spaced repetition.',
  },
  {
    q: 'What if I don\'t know a word?',
    a: 'Press Enter to reveal the answer. The word stays in the set and will come back later. Getting it wrong doesn\'t punish you — it just tells the algorithm to show it again sooner.',
  },
  {
    q: 'Why 40 cards per session?',
    a: '40 is the sweet spot for a focused 20-minute session. It\'s enough to make meaningful progress but short enough to fit into a busy day. The number is backed by research on optimal batch sizes for vocabulary acquisition.',
  },
  {
    q: 'Why 2 correct answers = mastered?',
    a: 'Two successful recalls with spacing between them creates a strong memory trace. The first correct answer shows you recognize the word; the second confirms it\'s moving into long-term memory. This is based on the well-established "retrieval practice effect" in cognitive science.',
  },
  {
    q: 'Can I create my own vocabulary sets?',
    a: 'Yes. You can create custom sets manually (via the Edit Sets page) or generate them with AI (via Generate Set). Teachers can create sets for their students and share the set code. Go to Topics → Edit Sets to get started.',
  },
  {
    q: 'Is WordCrammer really free?',
    a: 'Yes, completely free. No subscriptions, no limits, no ads. All features — cram sessions, AI generation, all 5 practice modes, progress tracking — are available to every user.',
  },
  {
    q: 'What languages are available?',
    a: 'WordCrammer supports 20 target languages including Spanish, French, German, Italian, Dutch, Portuguese, Danish, Swedish, Norwegian, Finnish, Polish, Hungarian, Greek, Romanian, Arabic, Hebrew, Japanese, Chinese, Indonesian, and Ukrainian. The interface language is English.',
  },
  {
    q: 'Does the app work offline?',
    a: 'Basic offline support is available. Your progress is synced when you reconnect. For the full experience, an internet connection is required for AI features and to load new vocabulary sets.',
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen px-4 py-24 relative overflow-hidden bg-mesh">
      <div className="deco-blob deco-blob-1 animate-float" style={{ top: '10%', left: '-5%' }} />
      <div className="deco-blob deco-blob-2 animate-float-delayed" style={{ top: '60%', right: '-10%' }} />

      <div className="max-w-3xl mx-auto relative">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Everything you need to know about WordCrammer.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="glass rounded-xl border border-white/10 group open:ring-1 open:ring-blue-500/20 transition-all">
              <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer text-sm text-white font-medium hover:text-blue-300 transition-colors list-none">
                <ChevronDown className="w-4 h-4 text-blue-400 shrink-0 transition-transform group-open:rotate-180" />
                {faq.q}
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-sm text-slate-500 mb-4">Still have questions?</p>
          <Link href="/login" className="btn-primary px-6 py-2.5 text-sm">
            Start Cramming Free
          </Link>
        </div>
      </div>
    </div>
  )
}
