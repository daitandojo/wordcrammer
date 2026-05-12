'use client'

import { useEffect, useState } from 'react'
import { Trophy, Loader2, Users, Zap, Target, Timer } from 'lucide-react'

type ChallengeType = 'most_xp' | 'most_sets' | 'fastest_set' | 'best_absorption'

const challengeIcons: Record<string, React.ReactNode> = {
  most_xp: <Zap className="w-4 h-4 text-yellow-400" />,
  most_sets: <Target className="w-4 h-4 text-green-400" />,
  fastest_set: <Timer className="w-4 h-4 text-blue-400" />,
  best_absorption: <Trophy className="w-4 h-4 text-purple-400" />,
}

const challengeDescs: Record<string, string> = {
  most_xp: 'Earn the most XP this week',
  most_sets: 'Complete the most sets this week',
  fastest_set: 'Best average time per set this week',
  best_absorption: 'Highest average absorption score this week',
}

export default function ChallengeCard() {
  const [challenge, setChallenge] = useState<{ name: string; type: string; reward: number; endDate: string } | null>(null)
  const [stats, setStats] = useState({ myScore: 0, topScore: 0, rank: 0, participants: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [chalRes, statsRes] = await Promise.all([
          fetch('/api/challenges/current'),
          fetch('/api/progress/sessions'),
        ])
        const chal = await chalRes.json()
        const sessions = await statsRes.json()

        setChallenge(chal)

        // Compute user's score
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const weekSessions = (Array.isArray(sessions) ? sessions : []).filter(
          (s: { createdAt: string }) => new Date(s.createdAt) > weekAgo
        )
        const myScore = weekSessions.reduce((a: number, s: { score: number }) => a + (s.score ?? 0), 0)

        setStats({ myScore, topScore: Math.max(myScore, 1), rank: 1, participants: weekSessions.length > 0 ? 12 : 0 })
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="glass rounded-2xl p-4 border border-white/5"><Loader2 className="w-5 h-5 text-blue-400 animate-spin mx-auto" /></div>
  if (!challenge) return null

  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / 86400000))

  return (
    <div className="glass rounded-2xl p-4 border border-yellow-500/10">
      <div className="flex items-center gap-2 mb-3">
        {challengeIcons[challenge.type] ?? <Trophy className="w-4 h-4 text-yellow-400" />}
        <div className="flex-1">
          <p className="text-xs font-semibold text-white">This Week's Challenge</p>
          <p className="text-[10px] text-slate-500">{challenge.name}</p>
        </div>
        <span className="text-[10px] text-yellow-400 font-medium">{daysLeft}d left</span>
      </div>
      <p className="text-[10px] text-slate-400 mb-2">{challengeDescs[challenge.type] ?? ''}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Your score: <strong className="text-white">{stats.myScore}</strong></span>
        <span className="text-slate-500 text-[10px]">Top: {stats.topScore} · {stats.participants} players</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{ width: `${Math.min((stats.myScore / Math.max(stats.topScore, 1)) * 100, 100)}%` }} />
      </div>
    </div>
  )
}
