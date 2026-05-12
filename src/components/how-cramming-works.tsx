import { Target, KeyRound, CheckCircle2, Clock } from 'lucide-react'

export default function HowCrammingWorks({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="glass rounded-xl p-4 border border-blue-500/10 mb-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-6 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400 shrink-0" />
            <span><strong className="text-slate-200">40 cards</strong> per session</span>
          </div>
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-400 shrink-0" />
            <span><strong className="text-slate-200">Type</strong> the translation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span><strong className="text-slate-200">2 correct</strong> = mastered</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500 shrink-0" />
            <span><strong className="text-slate-200">~20 min</strong> per set</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-blue-500/10 mb-8">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 text-center">
        How Cramming Works
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="flex items-start gap-3 sm:flex-col sm:text-center">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 sm:mx-auto">
            <Target className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-semibold text-white mb-0.5 sm:mb-1">40 Cards</p>
            <p className="text-xs sm:text-sm text-slate-400">
              Each session picks 40 words you haven&apos;t mastered yet. Our algorithm focuses on the ones you struggle with most.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 sm:flex-col sm:text-center">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 sm:mx-auto">
            <KeyRound className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-semibold text-white mb-0.5 sm:mb-1">Type &amp; Check</p>
            <p className="text-xs sm:text-sm text-slate-400">
              See the word in your language, type the translation. Accent shortcuts help you type on any keyboard.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 sm:flex-col sm:text-center">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 sm:mx-auto">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-semibold text-white mb-0.5 sm:mb-1">2 Correct = Done</p>
            <p className="text-xs sm:text-sm text-slate-400">
              Get it right twice and that word is mastered. The set is complete when all 40 cards are mastered.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-yellow-500" />
          <span>One set takes ~20 minutes. <strong className="text-slate-200">10 sets (200 minutes)</strong> for basic fluency.</span>
        </div>
      </div>
    </div>
  )
}
