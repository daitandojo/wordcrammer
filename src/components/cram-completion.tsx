'use client'

import Crammy from '@/components/crammy'
import { Share2, ArrowLeft, RefreshCw } from 'lucide-react'
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
  onNextSet?: () => void
}

export default function CramCompletion({
  mastered, totalSet, totalAttempts, xpGained, leveledUp, absorption,
  currentTopic, aiFeedback, onMoreTopics, onCramAgain, onNextSet,
}: Props) {
  const toast = useToast()
  const pct = Math.min(Math.max((absorption / 10) * 100, 0), 100)
  const circumference = 2 * Math.PI * 54

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050810', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>

        {/* Icon */}
        <div style={{ position: 'relative', width: '140px', height: '140px' }}>
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
            <circle cx="70" cy="70" r="54" fill="none" stroke="url(#absGrad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${circumference}`} strokeDashoffset={`${circumference - (pct / 100) * circumference}`}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
            <defs>
              <linearGradient id="absGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'white', lineHeight: 1 }}>{absorption}</span>
            <span style={{ fontSize: '11px', color: 'rgba(148,163,184,0.3)', letterSpacing: '0.1em' }}>/ 10</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'rgba(255,255,255,0.95)', marginBottom: '4px', letterSpacing: '-0.01em' }}>Set complete!</h2>
          <p style={{ fontSize: '13px', color: 'rgba(148,163,184,0.4)', marginBottom: '20px' }}>{currentTopic?.topictitle}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'rgba(34,197,94,0.9)' }}>{mastered}</div>
              <div style={{ fontSize: '10px', color: 'rgba(148,163,184,0.3)', letterSpacing: '0.06em', marginTop: '2px' }}>MASTERED</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'rgba(59,130,246,0.8)' }}>{totalAttempts}</div>
              <div style={{ fontSize: '10px', color: 'rgba(148,163,184,0.3)', letterSpacing: '0.06em', marginTop: '2px' }}>ATTEMPTS</div>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'rgba(250,204,21,0.8)' }}>+{xpGained}</div>
              <div style={{ fontSize: '10px', color: 'rgba(148,163,184,0.3)', letterSpacing: '0.06em', marginTop: '2px' }}>XP</div>
            </div>
          </div>
        </div>

        {/* Level up */}
        {leveledUp && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(250,204,21,0.08), rgba(234,179,8,0.04))',
            border: '1px solid rgba(250,204,21,0.12)',
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}>
            <span style={{ fontSize: '13px', color: 'rgba(250,204,21,0.8)', fontWeight: 600 }}>Level up! 🎊</span>
            <button onClick={async () => {
              try {
                const text = `I just leveled up on WordCrammer! 🎯 wordcrammer.app`
                if (navigator.share) await navigator.share({ title: 'WordCrammer', text })
                else await navigator.clipboard.writeText(text)
              } catch {}
            }} style={{ fontSize: '10px', color: 'rgba(250,204,21,0.6)', border: '1px solid rgba(250,204,21,0.15)', borderRadius: '8px', padding: '6px 12px', background: 'transparent', cursor: 'pointer' }}>
              Share →
            </button>
          </div>
        )}

        {/* AI feedback */}
        {aiFeedback && (
          <div style={{
            background: 'rgba(59,130,246,0.04)',
            border: '1px solid rgba(59,130,246,0.08)',
            borderRadius: '14px',
            padding: '16px',
            width: '100%',
          }}>
            <div style={{ fontSize: '9px', color: 'rgba(59,130,246,0.4)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '6px' }}>AI TUTOR</div>
            <p style={{ fontSize: '12px', color: 'rgba(148,163,184,0.7)', lineHeight: 1.6 }}>{aiFeedback}</p>
          </div>
        )}

        {/* Perfect set */}
        {mastered === totalSet && (
          <div style={{
            background: 'rgba(250,204,21,0.04)',
            border: '1px solid rgba(250,204,21,0.08)',
            borderRadius: '12px',
            padding: '12px 16px',
            width: '100%',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '12px', color: 'rgba(250,204,21,0.6)', fontWeight: 600 }}>Perfect set! 🎯 All {totalSet} mastered.</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <button onClick={onMoreTopics} style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '14px',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
            color: 'rgba(148,163,184,0.6)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}>
            <ArrowLeft style={{ width: '14px', height: '14px' }} />
            More
          </button>
          {onNextSet && (
            <button onClick={onNextSet} style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid rgba(59,130,246,0.15)',
              background: 'rgba(59,130,246,0.06)',
              color: 'rgba(96,165,250,0.8)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}>
              Next Set →
            </button>
          )}
          <button onClick={onCramAgain} style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '14px',
            borderRadius: '14px',
            border: 'none',
            background: 'rgba(31,200,90,0.1)',
            color: 'rgba(74,222,128,0.9)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}>
            <RefreshCw style={{ width: '14px', height: '14px' }} />
            Again
          </button>
        </div>

        {/* Share */}
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
          } catch {}
        }} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.04)',
          background: 'transparent',
          color: 'rgba(148,163,184,0.25)',
          fontSize: '11px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}>
          <Share2 style={{ width: '12px', height: '12px' }} />
          Share result
        </button>

        {/* Invite */}
        <button onClick={async () => {
          try {
            const text = `I just mastered ${mastered} phrases in ${totalAttempts} attempts on WordCrammer! Join me — we both get +50 XP 🎯 wordcrammer.app`
            if (navigator.share) await navigator.share({ title: 'WordCrammer', text })
            else await navigator.clipboard.writeText(text)
          } catch {}
        }} style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(148,163,184,0.2)',
          fontSize: '11px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}>
          📨 Invite a friend — you both get +50 XP
        </button>

      </div>
    </div>
  )
}
