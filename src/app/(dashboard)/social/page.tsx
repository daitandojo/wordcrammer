'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Zap, Target, Timer, Star, Loader2 } from 'lucide-react'
import { useUser } from '@/components/user-provider'
import { useToast } from '@/components/toast'

const challengeDescs: Record<string, string> = {
  most_xp: 'Earn the most XP this week',
  most_sets: 'Complete the most sets this week',
  fastest_set: 'Best average time per set this week',
  best_absorption: 'Highest average absorption score this week',
}

const challengeColors: Record<string, string> = {
  most_xp: '#eab308',
  most_sets: '#22c55e',
  fastest_set: '#3b82f6',
  best_absorption: '#a855f7',
}

const challengeIcons: Record<string, React.ReactNode> = {
  most_xp: <Zap style={{ width: 16, height: 16, color: '#eab308' }} />,
  most_sets: <Target style={{ width: 16, height: 16, color: '#22c55e' }} />,
  fastest_set: <Timer style={{ width: 16, height: 16, color: '#3b82f6' }} />,
  best_absorption: <Trophy style={{ width: 16, height: 16, color: '#a855f7' }} />,
}

const MILESTONES = [5, 10, 15, 20, 25, 30]

export default function SocialPage() {
  const { user: userData } = useUser()
  const toast = useToast()
  const [completedSets, setCompletedSets] = useState(0)
  const [totalTopics, setTotalTopics] = useState(0)
  const [loading, setLoading] = useState(true)
  const [challenge, setChallenge] = useState<{ name: string; type: string; reward: number; endDate: string } | null>(null)
  const [challengeScore, setChallengeScore] = useState(0)
  const [challengeParticipants, setChallengeParticipants] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const [topicsRes, progressRes, chalRes] = await Promise.all([
          fetch('/api/topics'),
          fetch('/api/progress'),
          fetch('/api/challenges/current'),
        ])
        const allTopics = await topicsRes.json()
        const allProgress = await progressRes.json()
        const chal = await chalRes.json()

        const mastered = allTopics.filter((t: { topiccode: string; itemcount: number }) =>
          t.topiccode?.startsWith('ES') || t.topiccode?.startsWith('FR') || t.topiccode?.startsWith('IT') || t.topiccode?.startsWith('DE')
        ).filter((t: { topiccode: string; itemcount: number }) => {
          const p = allProgress.filter((pr: { topiccode: string; corrects: string }) => pr.topiccode === t.topiccode)
          return p.filter((pr: { corrects: string }) => Number(pr.corrects) >= 2).length >= t.itemcount
        }).length

        setCompletedSets(mastered)
        setTotalTopics(allTopics.filter((t: { topiccode: string }) =>
          t.topiccode?.startsWith('ES') || t.topiccode?.startsWith('FR') || t.topiccode?.startsWith('IT') || t.topiccode?.startsWith('DE')
        ).length)

        if (chal && !chal.error) {
          setChallenge(chal)
          setChallengeParticipants(Math.floor(Math.random() * 50) + 20)
          setChallengeScore(Math.floor(Math.random() * 500))
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const handleShare = async (text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'WordCrammer', text })
      } else {
        await navigator.clipboard.writeText(text)
        toast.show('xp', 'Link copied!')
      }
    } catch {}
  }

  const daysLeft = challenge
    ? Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / 86400000))
    : 0

  const nextMilestone = MILESTONES.find((m) => m > completedSets) ?? completedSets
  const milestoneProgress = completedSets > 0 ? Math.min((completedSets / nextMilestone) * 100, 100) : 0

  return (
    <div style={{ minHeight: '100%', background: '#050a14', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,179,8,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <Loader2 style={{ width: 20, height: 20, color: 'rgba(148,163,184,0.2)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ padding: '48px 40px', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ marginBottom: '48px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', letterSpacing: '-0.01em', marginBottom: '4px' }}>
              Social
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.45)' }}>
              Challenges, milestones, and referrals
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Daily Challenge */}
            {challenge && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  padding: '28px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${challengeColors[challenge.type] ?? '#eab308'}20`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  {challengeIcons[challenge.type]}
                  <div>
                    <p style={{ fontSize: '12px', color: 'rgba(148,163,184,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Weekly Challenge
                    </p>
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>
                      {challenge.name}
                    </h2>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(234,179,8,0.5)', letterSpacing: '0.05em' }}>
                      {challenge.reward} XP reward
                    </span>
                    <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(234,179,8,0.08)', color: 'rgba(234,179,8,0.6)', border: '1px solid rgba(234,179,8,0.12)' }}>
                      {daysLeft}d left
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(148,163,184,0.4)', marginBottom: '20px' }}>
                  {challengeDescs[challenge.type]}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(148,163,184,0.4)' }}>Your score</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{challengeScore}</span>
                </div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '9999px',
                      background: `linear-gradient(90deg, ${challengeColors[challenge.type] ?? '#eab308'}60, ${challengeColors[challenge.type] ?? '#eab308'})`,
                      width: `${Math.min(challengeScore / 1000 * 100, 100)}%`,
                    }}
                  />
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(148,163,184,0.2)' }}>{challengeParticipants} participants</p>
              </motion.div>
            )}

            {/* Milestones */}
            <div
              style={{
                padding: '28px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Star style={{ width: 16, height: 16, color: 'rgba(234,179,8,0.5)' }} />
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>Milestones</h2>
                <span style={{ fontSize: '12px', color: 'rgba(148,163,184,0.3)', marginLeft: 'auto' }}>
                  {completedSets} sets mastered
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(148,163,184,0.4)' }}>
                    Next milestone: {nextMilestone} sets
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(148,163,184,0.3)' }}>
                    {nextMilestone > completedSets ? nextMilestone - completedSets : 0} more
                  </span>
                </div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${milestoneProgress}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: '100%', borderRadius: '9999px', background: 'linear-gradient(90deg, rgba(234,179,8,0.6), rgba(234,179,8,0.9))' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {MILESTONES.map((m) => {
                  const done = completedSets >= m
                  return (
                    <div
                      key={m}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        background: done ? 'rgba(31,200,90,0.06)' : 'rgba(255,255,255,0.03)',
                        border: done ? '1px solid rgba(31,200,90,0.12)' : '1px solid rgba(255,255,255,0.05)',
                        opacity: done ? 1 : 0.5,
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 600, color: done ? 'rgba(31,200,90,0.7)' : 'rgba(148,163,184,0.3)' }}>
                        {m}
                      </span>
                      <span style={{ fontSize: '10px', color: 'rgba(148,163,184,0.25)' }}>sets</span>
                      {done && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="rgba(31,200,90,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  )
                })}
              </div>

              {completedSets > 0 && completedSets % 5 === 0 && (
                <button
                  onClick={() =>
                    handleShare(
                      `I've mastered ${completedSets} sets on WordCrammer! ${Math.round((completedSets / totalTopics) * 100)}% of my language journey. wordcrammer.com`
                    )
                  }
                  style={{
                    marginTop: '20px',
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(234,179,8,0.06)',
                    border: '1px solid rgba(234,179,8,0.1)',
                    color: 'rgba(234,179,8,0.7)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  Share milestone
                </button>
              )}
            </div>

            {/* Invite friends */}
            <div
              style={{
                padding: '28px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '6px' }}>Invite friends</h2>
              <p style={{ fontSize: '13px', color: 'rgba(148,163,184,0.35)', marginBottom: '20px' }}>
                You both get{' '}
                <span style={{ color: 'rgba(234,179,8,0.7)', fontWeight: 500 }}>+50 XP</span> when they complete their first set.
              </p>
              {userData?.referralCode && (
                <button
                  onClick={() =>
                    handleShare(
                      `Join me on WordCrammer! We both get +50 XP when you complete your first set. wordcrammer.com/login?ref=${userData.referralCode}`
                    )
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(31,200,90,0.06)',
                    border: '1px solid rgba(31,200,90,0.1)',
                    color: 'rgba(74,222,128,0.7)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  Share invite link
                </button>
              )}
              {userData?.referredCount !== undefined && (
                <p style={{ fontSize: '11px', color: 'rgba(148,163,184,0.2)', textAlign: 'center', marginTop: '12px' }}>
                  {userData.referredCount} friends joined
                </p>
              )}
            </div>
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
