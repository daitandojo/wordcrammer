import { Target, KeyRound, CheckCircle2, Clock, Brain, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen px-4 py-24 relative overflow-hidden bg-mesh">
      <div className="deco-blob deco-blob-1 animate-float" style={{ top: '10%', left: '-5%' }} />
      <div className="deco-blob deco-blob-2 animate-float-delayed" style={{ top: '60%', right: '-10%' }} />

      <div className="max-w-3xl mx-auto relative">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How <span className="gradient-text">Cramming</span> Works
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            WordCrammer uses scientifically-backed techniques to help you learn vocabulary faster.
          </p>
        </div>

        <div className="space-y-8">
          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">1. Forty Cards Per Session</h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Each session serves you <strong className="text-white">40 atomic phrases</strong> — a mix of single words
              (&ldquo;the mountain&rdquo;) and short phrases (&ldquo;the cat sleeps&rdquo;). Research shows that
              <strong className="text-white"> 40 items</strong> is the optimal batch size for a focused 20-minute
              learning session. The phrases are ranked by <strong className="text-white">frequency of daily use</strong>,
              so you learn the most useful language first.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">2. Type the Translation</h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              You&apos;re shown a phrase in your source language. <strong className="text-white">Type the translation</strong> from
              memory. This is called <strong className="text-white">active recall</strong> — one of the most effective
              learning techniques. As you type, accent shortcuts (<code className="text-blue-300 bg-slate-800 px-1 rounded">/e</code> → é)
              are automatically converted so you can type in any language on any keyboard.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mt-2">
              If you type the correct answer, the app moves on immediately. If you&apos;re stuck, press{' '}
              <kbd className="text-blue-300 bg-slate-800 px-1 rounded text-[10px]">Enter</kbd> to reveal the answer and try again next round.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">3. Two Correct Answers = Mastered</h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Get a phrase right <strong className="text-white">twice</strong> and it&apos;s mastered —
              removed from the set. This is based on <strong className="text-white">spaced repetition</strong>:
              seeing a word, recalling it, then seeing it again after a short interval creates strong long-term memory.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mt-2">
              Get it wrong? The counter goes back. Words you struggle with <strong className="text-white">come back more often</strong>
              in future sessions until the attempt/correct ratio drops below 3:1.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">The Science Behind It</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
              <p>
                <strong className="text-white">Spaced Repetition:</strong> Our algorithm tracks every attempt.
                Words are surfaced again after increasing intervals — 1 day, 3 days, 7 days — until they stick.
              </p>
              <p>
                <strong className="text-white">Active Recall:</strong> Typing an answer from memory is far more effective
                than recognizing it in multiple choice. That&apos;s why typing is the core mechanic.
              </p>
              <p>
                <strong className="text-white">Frequency Ranking:</strong> Our 30 sets are ordered by how often
                each phrase appears in daily conversation. Set 1 has the 40 most useful phrases; Set 30 has the least common.
                After 10 sets (200 minutes), you can defend yourself in basic conversation.
              </p>
              <p>
                <strong className="text-white">1200 Phrases = Basic Fluency:</strong> Research suggests ~1200 well-chosen
                atomic phrases are enough for <strong className="text-white">moderate conversational fluency</strong>.
                At 40 phrases per session, that&apos;s 30 sessions — or about <strong className="text-white">10 hours</strong> of study.
              </p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Practice Modes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="glass rounded-xl p-3 border border-white/5">
                <p className="text-white font-medium mb-1">Cram</p>
                <p className="text-slate-400 text-xs">Type the translation. Core mechanic.</p>
              </div>
              <div className="glass rounded-xl p-3 border border-white/5">
                <p className="text-white font-medium mb-1">Multiple Choice</p>
                <p className="text-slate-400 text-xs">Test recognition. Good for quick review.</p>
              </div>
              <div className="glass rounded-xl p-3 border border-white/5">
                <p className="text-white font-medium mb-1">Listen &amp; Type</p>
                <p className="text-slate-400 text-xs">Hear the word, type what you hear.</p>
              </div>
              <div className="glass rounded-xl p-3 border border-white/5">
                <p className="text-white font-medium mb-1">Sentence Build</p>
                <p className="text-slate-400 text-xs">Arrange words in the correct order.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link href="/login" className="btn-primary px-8 py-3 text-base font-semibold">
            Start Cramming Free
          </Link>
        </div>
      </div>
    </div>
  )
}
