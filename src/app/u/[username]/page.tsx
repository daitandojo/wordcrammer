import { prisma } from '@/lib/prisma'
import { Trophy, Flame, BarChart3, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function UserProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const user = await prisma.tblCrammers.findUnique({ where: { username } })
  if (!user) notFound()

  const completedSessions = await prisma.tblSessions.count({ where: { username, score: { gt: 0 } } })
  const totalMastered = await prisma.tblProgress.count({ where: { username, corrects: { gte: '2' } } })
  const level = Number(user.level ?? 1)
  const xp = Number(user.xp ?? 0)
  const streak = user.streak ?? 0

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-mesh">
      <div className="max-w-md w-full">
        <div className="glass rounded-2xl p-8 border border-white/10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
            {user.firstname?.[0] ?? '?'}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 font-display">{user.alterego || user.firstname}</h1>
          <p className="text-xs text-slate-500 mb-6">@{user.username}</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass rounded-xl p-3 text-center border border-white/5">
              <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{level}</p>
              <p className="text-[10px] text-slate-500">Level</p>
            </div>
            <div className="glass rounded-xl p-3 text-center border border-white/5">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{streak}</p>
              <p className="text-[10px] text-slate-500">Streak</p>
            </div>
            <div className="glass rounded-xl p-3 text-center border border-white/5">
              <BookOpen className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{completedSessions}</p>
              <p className="text-[10px] text-slate-500">Sets</p>
            </div>
          </div>

          <div className="glass rounded-xl p-4 border border-white/5 mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">XP</span>
              <span className="text-blue-400 font-bold font-mono">{xp.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Phrases mastered</span>
              <span className="text-green-400 font-bold">{totalMastered}</span>
            </div>
          </div>

          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← WordCrammer
          </Link>
        </div>
      </div>
    </div>
  )
}
