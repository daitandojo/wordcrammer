'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Award } from 'lucide-react'
import { useUser } from '@/components/user-provider'

type SetProgress = {
  topiccode: string
  topictitle: string
  total: number
  mastered: number
  pct: number
  bestAttempts?: number
  completions?: number
}

const EFFICIENCY_BADGES = [
  { max: 80, label: 'Gold', color: '#eab308', bg: 'rgba(234,179,8,0.12)', icon: '🥇' },
  { max: 120, label: 'Silver', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: '🥈' },
  { max: 160, label: 'Bronze', color: '#cd7f32', bg: 'rgba(205,127,50,0.12)', icon: '🥉' },
  { max: Infinity, label: 'Wood', color: '#92400e', bg: 'rgba(146,64,14,0.1)', icon: '🪵' },
]

const LANGUAGES = [
  { code: 'ES', label: 'Spanish', accent: '#ef4444' },
  { code: 'FR', label: 'French', accent: '#3b82f6' },
  { code: 'IT', label: 'Italian', accent: '#22c55e' },
  { code: 'DE', label: 'German', accent: '#eab308' },
]

function sortTopics(a: SetProgress, b: SetProgress) {
  const numA = parseInt(a.topiccode.replace(/\D/g, ''), 10) || 0
  const numB = parseInt(b.topiccode.replace(/\D/g, ''), 10) || 0
  return numA - numB
}

function CountdownOverlay({ count, topic }: { count: number; topic: string }) {
  const num = parseInt(topic.replace(/\D/g, ''), 10) || 0
  const lang = LANGUAGES.find((l) => topic.startsWith(l.code))
  const accent = lang?.accent ?? '#4ade80'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5,10,20,0.95)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div style={{ textAlign: 'center', position: 'relative' }}>
        {/* Outer ring — slow rotation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 280,
            height: 280,
            marginTop: -140,
            marginLeft: -140,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.03)',
            background: 'radial-gradient(circle, rgba(255,255,255,0.01) 0%, transparent 70%)',
          }}
        >
          {/* Dashed arc overlay */}
          <svg width="280" height="280" viewBox="0 0 280 280" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            <circle cx="140" cy="140" r="135" fill="none" stroke={accent} strokeWidth="1" strokeDasharray="4 8" opacity="0.15" />
          </svg>
        </motion.div>

        {/* Middle ring — counter-rotation */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 200,
            height: 200,
            marginTop: -100,
            marginLeft: -100,
            borderRadius: '50%',
            border: `1px solid ${accent}10`,
          }}
        />

        {/* Pulsing glow ring */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 160,
            height: 160,
            marginTop: -80,
            marginLeft: -80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
          }}
        />

        {/* Main number */}
        <motion.div
          key={count}
          initial={{ scale: 0.3, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {count === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <motion.path
                  d="M20 32 L28 40 L44 24"
                  stroke={accent}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </svg>
              <span style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginTop: '8px', letterSpacing: '-0.02em' }}>GO</span>
            </div>
          ) : (
            <span
              style={{
                fontSize: '80px',
                fontWeight: 700,
                color: 'white',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                textShadow: `0 0 60px ${accent}40`,
                display: 'block',
              }}
            >
              {count}
            </span>
          )}
        </motion.div>

        {/* Label */}
        <motion.p
          key={`label-${count}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: '12px',
            color: 'rgba(148,163,184,0.35)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginTop: '20px',
          }}
        >
          {count === 0 ? 'Starting…' : `Starting in`}
        </motion.p>

        {/* Set badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            marginTop: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            background: `${accent}10`,
            border: `1px solid ${accent}20`,
          }}
        >
          <span style={{ fontSize: '10px', fontWeight: 700, color: accent, letterSpacing: '0.05em' }}>
            {topic}
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { user: userData } = useUser()
  const router = useRouter()
  const [topics, setTopics] = useState<SetProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLang, setActiveLang] = useState('ES')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [startingTopic, setStartingTopic] = useState<string>('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!session?.user) return
    const load = async () => {
      try {
        const [topicsRes, progressRes, sessionsRes, compRes] = await Promise.all([
          fetch('/api/topics'),
          fetch('/api/progress'),
          fetch('/api/progress/sessions'),
          fetch('/api/progress/completion-stats'),
        ])
        const allTopics = await topicsRes.json()
        const allProgress = await progressRes.json()
        const allSessions = await sessionsRes.json()
        const completionStats = await compRes.json()

        const bestSessions = new Map<string, number>()
        for (const s of allSessions) {
          if (s.topiccode && s.score >= s.totalItems) {
            const existing = bestSessions.get(s.topiccode)
            if (!existing || s.attempts < existing) {
              bestSessions.set(s.topiccode, s.attempts)
            }
          }
        }

        const setProgress: SetProgress[] = allTopics
          .filter((t: { topiccode: string }) =>
            LANGUAGES.some((l) => t.topiccode?.startsWith(l.code))
          )
          .map((topic: { topiccode: string; topictitle: string; itemcount: number }) => {
            const p = allProgress.filter((pr: { topiccode: string }) => pr.topiccode === topic.topiccode)
            const mastered = p.filter((pr: { corrects: string }) => Number(pr.corrects) >= 2).length
            return {
              topiccode: topic.topiccode,
              topictitle: topic.topictitle,
              total: topic.itemcount,
              mastered,
              pct: topic.itemcount > 0 ? Math.round((mastered / topic.itemcount) * 100) : 0,
              bestAttempts: bestSessions.get(topic.topiccode),
              completions: completionStats[topic.topiccode] ?? 0,
            }
          })
          .sort(sortTopics)
        setTopics(setProgress)
      } catch (e) { console.error('[Failed to fetch]', e) }
      setLoading(false)
    }
    load()
  }, [session])

  useEffect(() => {
    if (countdown === null) return
    if (timerRef.current) clearTimeout(timerRef.current)
    if (countdown === 0) {
      doStartCram()
      return
    }
    timerRef.current = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [countdown])

  const handleStart = (topiccode: string) => {
    if (countdown !== null) return
    setStartingTopic(topiccode)
    setCountdown(5)
  }

  const doStartCram = () => {
    if (!startingTopic) return
    const topic = topics.find((t) => t.topiccode === startingTopic)
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    setCountdown(null)
    const qs = `?topic=${encodeURIComponent(startingTopic)}&title=${encodeURIComponent(topic?.topictitle ?? '')}`
    window.location.href = '/cram' + qs
  }

  const langTopics = topics.filter((t) => t.topiccode.startsWith(activeLang)).sort((a, b) => {
    const aInProgress = a.mastered > 0 && a.pct < 100 ? 0 : a.pct >= 100 ? 2 : 1
    const bInProgress = b.mastered > 0 && b.pct < 100 ? 0 : b.pct >= 100 ? 2 : 1
    if (aInProgress !== bInProgress) return aInProgress - bInProgress
    const numA = parseInt(a.topiccode.replace(/\D/g, ''), 10) || 0
    const numB = parseInt(b.topiccode.replace(/\D/g, ''), 10) || 0
    return numA - numB
  })
  const completed = topics.filter((t) => t.pct >= 100).length
  const total = topics.length

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const firstName = userData?.firstname || userData?.username || session?.user?.name?.split(' ')[0] || 'there'

  const xpPercent = (() => {
    if (!userData) return 0
    const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000]
    const lvl = thresholds.filter((t) => userData.xp >= t).length
    const cur = thresholds[lvl - 1] ?? 0
    const next = thresholds[lvl] ?? cur + 1000
    return Math.min(Math.max(((userData.xp - cur) / (next - cur)) * 100, 0), 100)
  })()

  return (
    <div style={{ minHeight: '100%', background: '#050a14', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(31,200,90,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-100px', left: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Countdown */}
      <AnimatePresence>
        {countdown !== null && (
          <CountdownOverlay count={countdown} topic={startingTopic} />
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
          <Loader2 style={{ width: 20, height: 20, color: 'rgba(148,163,184,0.2)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ padding: 'clamp(32px, 5vw, 64px)', maxWidth: '920px', margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(148,163,184,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>
              {greeting}
            </p>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '8px' }}>
              {firstName}
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.4)' }}>
              {completed} of {total} sets mastered
            </p>
          </div>

          {/* XP */}
          {userData && (
            <div style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
                    {userData.xp.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '13px', color: 'rgba(148,163,184,0.3)' }}>XP</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {(userData.streak ?? 0) > 0 && (
                    <span style={{ fontSize: '13px', color: 'rgba(250,204,21,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🔥</span>{userData.streak}
                    </span>
                  )}
                  <span style={{ fontSize: '12px', color: 'rgba(148,163,184,0.25)' }}>Level {userData.level}</span>
                </div>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '9999px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    height: '100%',
                    borderRadius: '9999px',
                    background: 'linear-gradient(90deg, #1fc85a, #4ade80)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Language pills */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {LANGUAGES.map((lang) => {
              const langCount = topics.filter((t) => t.topiccode.startsWith(lang.code)).length
              const langDone = topics.filter((t) => t.topiccode.startsWith(lang.code) && t.pct >= 100).length
              const active = activeLang === lang.code
              return (
                <button
                  key={lang.code}
                  onClick={() => setActiveLang(lang.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: active ? `${lang.accent}12` : 'rgba(255,255,255,0.04)',
                    color: active ? lang.accent : 'rgba(148,163,184,0.4)',
                    fontSize: '13px',
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    letterSpacing: active ? '0.01em' : 'normal',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{lang.code}</span>
                  <span style={{ fontSize: '11px', color: active ? `${lang.accent}80` : 'rgba(148,163,184,0.25)', fontWeight: 400 }}>
                    {langDone}/{langCount}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Next up suggestion */}
          {(() => {
            const nextUp = topics.filter((t) => t.topiccode.startsWith(activeLang) && t.pct < 100).sort((a, b) => {
              const numA = parseInt(a.topiccode.replace(/\D/g, ''), 10) || 0
              const numB = parseInt(b.topiccode.replace(/\D/g, ''), 10) || 0
              return numA - numB
            })[0]
            if (!nextUp) return null
            const lang = LANGUAGES.find((l) => nextUp.topiccode.startsWith(l.code))
            const accent = lang?.accent ?? '#4ade80'
            return (
              <div style={{ marginBottom: '20px', padding: '14px 20px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '7px 12px', borderRadius: '8px', background: `${accent}08`, border: `1px solid ${accent}15`, fontSize: '10px', fontWeight: 700, color: accent, letterSpacing: '0.05em' }}>NEXT</div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{nextUp.topictitle}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(148,163,184,0.3)' }}>{nextUp.mastered}/{nextUp.total} mastered</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStart(nextUp.topiccode)}
                  style={{ padding: '8px 18px', borderRadius: '10px', border: 'none', background: `${accent}12`, color: accent, fontSize: '12px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                >
                  Start →
                </motion.button>
              </div>
            )
          })()}

          {/* Sets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
            {langTopics.map((topic, i) => {
              const isDone = topic.pct >= 100
              const isNew = topic.mastered === 0
              const isInProgress = topic.mastered > 0 && !isDone
              const isStarting = startingTopic === topic.topiccode
              const lang = LANGUAGES.find((l) => topic.topiccode.startsWith(l.code))
              const accent = lang?.accent ?? '#4ade80'

              let statusColor: string
              let statusBg: string
              let statusBorder: string
              if (isDone) {
                statusColor = '#22c55e'
                statusBg = 'rgba(34,197,94,0.03)'
                statusBorder = 'rgba(34,197,94,0.12)'
              } else if (isInProgress) {
                statusColor = '#3b82f6'
                statusBg = 'rgba(59,130,246,0.03)'
                statusBorder = 'rgba(59,130,246,0.1)'
              } else {
                statusColor = 'rgba(148,163,184,0.25)'
                statusBg = 'rgba(255,255,255,0.015)'
                statusBorder = 'rgba(255,255,255,0.04)'
              }

              const badge = isDone && topic.bestAttempts
                ? EFFICIENCY_BADGES.find((b) => (topic.bestAttempts ?? Infinity) <= b.max)
                : null

              return (
                <motion.button
                  key={topic.topiccode}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.035, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => handleStart(topic.topiccode)}
                  whileHover={{ scale: isStarting ? 1 : 0.98, transition: { duration: 0.12 } }}
                  whileTap={{ scale: isStarting ? 1 : 0.96, transition: { duration: 0.08 } }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    borderRadius: '16px',
                    background: isStarting ? `${accent}06` : statusBg,
                    border: isStarting ? `1px solid ${accent}30` : `1px solid ${statusBorder}`,
                    cursor: isStarting ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    opacity: isStarting ? 0.7 : 1,
                    outline: 'none',
                  }}
                >
                  {/* Top row: code + status indicator */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isDone ? 'rgba(34,197,94,0.6)' : isInProgress ? 'rgba(59,130,246,0.5)' : 'rgba(148,163,184,0.2)', letterSpacing: '0.08em' }}>
                      {topic.topiccode}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {badge && (
                        <span style={{ fontSize: '14px', lineHeight: 1 }} title={`${badge.label} — ${topic.bestAttempts} attempts`}>
                          {badge.icon}
                        </span>
                      )}
                      {(topic.completions ?? 0) > 0 && (
                        <span style={{ fontSize: '10px', color: 'rgba(148,163,184,0.25)' }}>{topic.completions}</span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <p style={{ fontSize: '13px', fontWeight: 500, color: isDone ? 'rgba(226,232,240,0.5)' : 'rgba(226,232,240,0.75)', marginBottom: 'auto', lineHeight: 1.4 }}>
                    {topic.topictitle}
                  </p>

                  {/* Status label */}
                  <div style={{ marginTop: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: isDone ? 'rgba(34,197,94,0.5)' : isInProgress ? 'rgba(59,130,246,0.4)' : 'rgba(148,163,184,0.2)', letterSpacing: '0.06em' }}>
                      {isDone ? 'COMPLETED' : isInProgress ? 'IN PROGRESS' : 'NOT STARTED'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', color: 'rgba(148,163,184,0.2)' }}>mastered</span>
                      <span style={{ fontSize: '10px', color: isDone ? 'rgba(34,197,94,0.5)' : 'rgba(148,163,184,0.25)', fontWeight: isDone ? 600 : 400 }}>
                        {topic.mastered}/{topic.total}
                      </span>
                    </div>
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.pct}%` }}
                        transition={{ duration: 0.7, delay: 0.1 + i * 0.03 }}
                        style={{
                          height: '100%',
                          borderRadius: '9999px',
                          background: isDone
                            ? 'linear-gradient(90deg, #22c55e80, #22c55e)'
                            : isInProgress
                              ? 'linear-gradient(90deg, #3b82f660, #3b82f6)'
                              : 'linear-gradient(90deg, rgba(148,163,184,0.1), rgba(148,163,184,0.05))',
                        }}
                      />
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>


        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
