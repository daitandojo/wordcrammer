'use client'

import { useRouter } from 'next/navigation'
import Crammy from '@/components/crammy'
import { Share2 } from 'lucide-react'
import { useToast } from '@/components/toast'
import { generateShareCard } from '@/lib/share/card'

type Props = {
  mastered: number
  totalSet: number
  totalAttempts: number
  xpGained: number
  leveledUp: boolean
  absorption: number
  currentTopic: { topictitle: string } | null
  aiFeedback: string | null
  onMoreTopics: () => void
  onCramAgain: () => void
}

export default function CramCompletion({
  mastered, totalSet, totalAttempts, xpGained, leveledUp, absorption,
  currentTopic, aiFeedback, onMoreTopics, onCramAgain,
}: Props) {
  const toast = useToast()
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center border border-white/10 animate-scale-in">
        <div className="mb-4 flex justify-center"><Crammy mood="celebrating" size={96} /></div>
        <h2 className="text-2xl font-bold text-white mb-2">Set complete!</h2>
        <p className="text-slate-400 text-sm mb-2">{currentTopic?.topictitle}</p>
        <div className="space-y-2 my-6">
          <p className="text-slate-400 text-sm">You learnt <span className="text-green-400 font-bold">{mastered}</span> phrases in <span className="text-blue-400 font-bold">{totalAttempts}</span> attempts.</p>
          <p className="text-slate-400 text-sm">
            Absorption: <span className={absorption > 7 ? 'text-green-400' : absorption > 4 ? 'text-yellow-400' : 'text-red-400'}>{absorption}</span> / 10
          </p>
          {xpGained > 0 && <p className="text-sm"><span className="text-yellow-400 font-bold">+{xpGained} XP</span></p>}
        </div>
        {leveledUp && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl mb-4 text-sm font-medium animate-scale-in flex items-center justify-between gap-2">
            <span>Level up! 🎊</span>
            <button onClick={async () => {
              try {
                const text = `I just leveled up on WordCrammer! 🎯 wordcrammer.app`
                if (navigator.share) await navigator.share({ title: 'WordCrammer', text })
                else await navigator.clipboard.writeText(text)
              } catch {}
            }} className="text-[10px] text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-lg hover:bg-yellow-500/10">Share</button>
          </div>
        )}
        {aiFeedback && (
          <div className="glass rounded-xl p-4 mb-4 border border-blue-500/10 text-left animate-slide-up">
            <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-1">AI Tutor</p>
            <p className="text-xs text-slate-300 leading-relaxed">{aiFeedback}</p>
          </div>
        )}
        {mastered === totalSet && (
          <div className="glass rounded-xl p-3 mb-4 border border-yellow-500/10 text-center animate-slide-up">
            <p className="text-xs text-yellow-400 font-semibold">Perfect set! 🎯 All {totalSet} mastered.</p>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={onMoreTopics} className="btn-secondary px-5 py-2 text-sm">More Topics</button>
          <button onClick={onCramAgain} className="btn-primary px-5 py-2 text-sm">Cram Again</button>
        </div>
        <div className="flex justify-center mt-4">
          <button onClick={async () => {
            try {
              const svg = await generateShareCard({
                username: 'Crammer', setTitle: currentTopic?.topictitle ?? 'Vocabulary',
                mastered, total: totalSet, absorption,
              })
              const blob = new Blob([svg], { type: 'image/svg+xml' })
              if (navigator.share) {
                await navigator.share({
                  title: 'WordCrammer',
                  text: `I just mastered ${mastered} phrases on WordCrammer!`,
                  files: [new File([blob], 'cram-result.svg', { type: 'image/svg+xml' })],
                })
              } else {
                await navigator.clipboard.writeText(`I just mastered ${mastered}/${totalSet} phrases on WordCrammer! 🎯 wordcrammer.app`)
                toast.show('xp', 'Share link copied!')
              }
            } catch (e) { console.error('[Failed to share result]', e) }
          }} className="btn-secondary px-4 py-1.5 text-xs">
            <Share2 className="w-3 h-3" /> Share
          </button>
        </div>
        <div className="flex justify-center mt-3">
          <button onClick={async () => {
            try {
              const text = `I just mastered ${mastered} phrases in ${totalAttempts} attempts on WordCrammer! Join me — we both get +50 XP 🎯 wordcrammer.app`
              if (navigator.share) await navigator.share({ title: 'WordCrammer', text })
              else await navigator.clipboard.writeText(text)
            } catch {}
          }} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
            📨 Invite a friend — you both get +50 XP
          </button>
        </div>
      </div>
    </div>
  )
}
