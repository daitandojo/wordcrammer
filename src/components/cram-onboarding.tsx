'use client'

import Crammy from '@/components/crammy'

type Props = {
  onDismiss: () => void
}

export default function CramOnboarding({ onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-2xl p-6 sm:p-8 max-w-md w-full border border-white/10 animate-scale-in text-center">
        <div className="mb-4 flex justify-center"><Crammy mood="happy" size={64} /></div>
        <h2 className="text-xl font-bold text-white mb-1">The 40-Card Cram</h2>
        <p className="text-sm text-slate-400 mb-5">Here&apos;s how it works:</p>
        <div className="space-y-3 text-left mb-5">
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500/10 text-green-400 text-xs font-bold shrink-0 mt-0.5">1</span>
            <div><p className="text-sm font-medium text-white">40 cards per session</p><p className="text-xs text-slate-400">Prioritized by usefulness and your past performance.</p></div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500/10 text-green-400 text-xs font-bold shrink-0 mt-0.5">2</span>
            <div><p className="text-sm font-medium text-white">Type the translation</p><p className="text-xs text-slate-400">Instant check as you type. <kbd className="text-blue-300 bg-slate-800 px-1 rounded text-[10px]">Enter</kbd> to reveal.</p></div>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500/10 text-green-400 text-xs font-bold shrink-0 mt-0.5">3</span>
            <div><p className="text-sm font-medium text-white">2 correct = mastered</p><p className="text-xs text-slate-400">All 40 mastered = set complete.</p></div>
          </div>
        </div>
        <div className="glass rounded-xl p-3 mb-5 border border-yellow-500/10">
          <p className="text-xs text-slate-400">⏱️ <strong className="text-slate-200">~20 min per set</strong> · 10 sets (200 min) for basic fluency</p>
        </div>
        <button onClick={onDismiss} className="btn-primary w-full justify-center py-2.5 text-sm">Got it, let&apos;s cram!</button>
      </div>
    </div>
  )
}
