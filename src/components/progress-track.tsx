'use client'

import { memo } from 'react'

type ProgressTrackProps = {
  items: Array<{ id: number; question: string; corrects: number; attempts: number }>
  currentQuestion?: string
}

function ProgressTrackInner({ items, currentQuestion }: ProgressTrackProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 justify-center" role="progressbar" aria-valuenow={items.filter(i => i.corrects >= 2).length} aria-valuemin={0} aria-valuemax={items.length}>
      {items.map((item, idx) => {
        let stateClass = 'border-white/10 bg-white/[0.02]'
        if (item.corrects >= 2) stateClass = 'border-green-500/50 bg-green-500/30 shadow-[0_0_6px_rgba(34,197,94,0.2)]'
        else if (item.corrects === 1) stateClass = 'border-green-500/30 bg-green-500/15'
        else if (item.attempts > 0) stateClass = 'border-red-500/30 bg-red-500/15'
        return (
          <div key={item.id || idx} className="flex items-center gap-0">
            {idx > 0 && <div className={`w-2 sm:w-3 h-px ${item.corrects >= 2 ? 'bg-green-500/40' : 'bg-white/5'}`} />}
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border transition-all duration-300 ${stateClass}`}
              style={item.question === currentQuestion ? { boxShadow: '0 0 0 3px rgba(59,130,246,0.25)' } : undefined}
              aria-label={`Phrase ${idx + 1}: ${item.corrects >= 2 ? 'mastered' : item.corrects === 1 ? 'one correct' : item.attempts > 0 ? 'needs practice' : 'new'}`}
            />
          </div>
        )
      })}
    </div>
  )
}

export const ProgressTrack = memo(ProgressTrackInner, (prev, next) => {
  if (prev.currentQuestion !== next.currentQuestion) return false
  if (prev.items.length !== next.items.length) return false
  for (let i = 0; i < prev.items.length; i++) {
    if (prev.items[i].corrects !== next.items[i].corrects) return false
    if (prev.items[i].attempts !== next.items[i].attempts) return false
  }
  return true
})
