import { Trophy, Medal } from 'lucide-react'
import Link from 'next/link'
import { getLeaderboardWithLevels } from '@/lib/db/xp'

function RankMedal({ rank }: { rank: number }) {
  if (rank === 0) return <Medal className="w-4 h-4 text-yellow-400" />
  if (rank === 1) return <Medal className="w-4 h-4 text-slate-300" />
  if (rank === 2) return <Medal className="w-4 h-4 text-amber-600" />
  return null
}

export default async function Leaderboard() {
  let leaders: Array<{
    username: string
    firstname: string
    alterego: string
    score: string | null
    xp: number
    level: number
  }> = []
  try {
    leaders = await getLeaderboardWithLevels(50)
  } catch {
    return null
  }

  return (
    <>
      <div className="fixed top-24 left-4 hidden lg:block z-40">
        <Link
          href="/leaderboard"
          className="glass rounded-xl p-3 shadow-xl max-h-[65vh] overflow-y-auto min-w-[210px] border border-white/10 hover:bg-white/[0.08] transition-all duration-200 group"
        >
          <div className="flex items-center gap-2 mb-3 px-1">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Leaderboard
            </span>
          </div>

          {leaders.map((crammer, i) => (
            <div
              key={crammer.username}
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors cursor-default"
            >
              <span className="w-5 text-[11px] text-slate-600 text-right font-mono">
                {i + 1}
              </span>
              <RankMedal rank={i} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 truncate font-medium">
                  {crammer.alterego}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-yellow-500/70 font-mono bg-yellow-500/10 px-1.5 py-0.5 rounded">
                  Lv.{crammer.level}
                </span>
                <span className="text-xs text-slate-500 font-mono">{crammer.score ?? 0}</span>
              </div>
            </div>
          ))}

          {leaders.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-4">No scores yet</p>
          )}
        </Link>
      </div>
    </>
  )
}
