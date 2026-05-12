'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Medal, Search, Loader2, Flame, ChevronRight } from 'lucide-react'

type Leader = {
  username: string
  alterego: string
  firstname: string
  xp: number
  level: number
  streak: number | null
  score: string | null
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 0) return <Medal className="w-5 h-5 text-yellow-400" />
  if (rank === 1) return <Medal className="w-5 h-5 text-slate-300" />
  if (rank === 2) return <Medal className="w-5 h-5 text-amber-600" />
  return null
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState<'all' | 'weekly' | 'monthly'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = period !== 'all' ? `?period=${period}` : ''
    fetch(`/api/leaderboard${params}`)
      .then((r) => r.json())
      .then((data) => {
        setLeaders(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [period])

  const filtered = leaders.filter((l) =>
    l.alterego?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="app-main p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 mb-4">
          <Trophy className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Leaderboard</h1>
        <p className="text-sm text-slate-500">Top scorers ranked by XP</p>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap justify-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crammers..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-white/5 text-slate-500 border border-white/5 hover:text-slate-300'
              }`}
            >
              {p === 'all' ? 'All Time' : p === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            {filtered.map((crammer, i) => (
              <div
                key={crammer.username}
                className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-white/[0.03] transition-colors"
              >
                <span className="w-7 text-xs sm:text-sm text-slate-600 text-right font-mono shrink-0">
                  {i + 1}
                </span>
                <div className="w-7 sm:w-8 shrink-0 flex justify-center">
                  <RankMedal rank={i} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-white font-medium truncate">
                    {crammer.alterego}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                    @{crammer.username}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {crammer.streak && crammer.streak > 0 && (
                    <div className="flex items-center gap-1 text-orange-400">
                      <Flame className="w-3 h-3" />
                      <span className="text-[10px] sm:text-xs font-medium">{crammer.streak}</span>
                    </div>
                  )}
                  <span className="text-[10px] sm:text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded">
                    Lv.{crammer.level}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-blue-400 font-mono w-16 sm:w-20 text-right">
                    {crammer.xp.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No scores yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
