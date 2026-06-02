'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Trophy, Target, Loader2, ChevronRight, Flame, TrendingUp, Clock } from 'lucide-react'
import { useCramStore } from '@/store/cram-store'
import SetChart from '@/components/set-chart'

type ProjectSet = {
  id: number
  name: string
  language: string
  createdBy: string | null
  moduleCount: number
}

type Module = {
  topiccode: string
  topictitle: string
  itemcount: number
}

type UserStats = {
  xp: number
  level: number
  streak: number
  username: string
  firstname: string
}

const EFFICIENCY_BADGES = [
  { max: 80, label: 'Gold', color: '#eab308', icon: '🥇' },
  { max: 120, label: 'Silver', color: '#94a3b8', icon: '🥈' },
  { max: 160, label: 'Bronze', color: '#cd7f32', icon: '🥉' },
  { max: Infinity, label: 'Wood', color: '#92400e', icon: '🪵' },
]

const LANG_COLORS: Record<string, string> = {
  es: '#ef4444',
  fr: '#3b82f6',
  it: '#22c55e',
  de: '#eab308',
}

function getEfficiencyBadge(bestAttempts?: number) {
  if (!bestAttempts) return null
  return EFFICIENCY_BADGES.find((b) => bestAttempts <= b.max) ?? null
}

function getStatusInfo(mastered: number, total: number) {
  if (mastered === 0) return { label: 'Not started', color: 'text-slate-400', dot: 'bg-slate-500' }
  if (mastered >= total) return { label: 'Completed', color: 'text-green-400', dot: 'bg-green-500' }
  return { label: 'In progress', color: 'text-blue-400', dot: 'bg-blue-500' }
}

export default function AnalysisPage() {
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [projectSets, setProjectSets] = useState<ProjectSet[]>([])
  const [modulesBySet, setModulesBySet] = useState<Record<number, Module[]>>({})
  const [progressByCode, setProgressByCode] = useState<Record<string, { mastered: number; total: number }>>({})
  const [efficiencyByCode, setEfficiencyByCode] = useState<Record<string, number>>({})
  const [completionsByCode, setCompletionsByCode] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, setsRes, progressRes, sessionsRes, completionRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch('/api/projectsets'),
          fetch('/api/progress'),
          fetch('/api/progress/sessions'),
          fetch('/api/progress/completion-stats'),
        ])

        const me = await meRes.json()
        const sets: ProjectSet[] = setsRes.ok ? await setsRes.json() : []
        const allProgress: Array<{ topiccode: string; question: string; corrects: string }> = progressRes.ok ? await progressRes.json() : []
        const sessions: Array<{ topiccode: string; attempts: number; score: number; totalItems: number }> = sessionsRes.ok ? await sessionsRes.json() : []
        const completionData: Record<string, number> = completionRes.ok ? await completionRes.json() : {}

        setStats({
          xp: me.xp ?? 0,
          level: me.level ?? 1,
          streak: me.streak ?? 0,
          username: me.username ?? '',
          firstname: me.firstname ?? 'Crammer',
        })

        setProjectSets(sets)
        setCompletionsByCode(completionData)

        const progMap: Record<string, { mastered: number; total: number }> = {}
        const byTopic = new Map<string, typeof allProgress>()
        for (const p of allProgress) {
          if (!byTopic.has(p.topiccode)) byTopic.set(p.topiccode, [])
          byTopic.get(p.topiccode)!.push(p)
        }
        for (const [code, items] of byTopic.entries()) {
          const mastered = items.filter((p) => Number(p.corrects) >= 2).length
          const total = items.length
          progMap[code] = { mastered, total }
        }
        setProgressByCode(progMap)

        const effMap: Record<string, number> = {}
        for (const s of sessions) {
          if (!s.topiccode) continue
          const completed = s.score >= s.totalItems
          if (!completed) continue
          if (!effMap[s.topiccode] || s.attempts < effMap[s.topiccode]) {
            effMap[s.topiccode] = s.attempts
          }
        }
        setEfficiencyByCode(effMap)

        const modulesMap: Record<number, Module[]> = {}
        for (const ps of sets) {
          const setRes = await fetch(`/api/projectsets/${ps.id}`)
          if (setRes.ok) {
            const data = await setRes.json()
            modulesMap[ps.id] = data.modules ?? []
          }
        }
        setModulesBySet(modulesMap)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  const allModules = Object.values(modulesBySet).flat()
  const totalPhrases = allModules.reduce((a, m) => a + (m.itemcount || 0), 0)
  const totalMastered = Object.values(progressByCode).reduce((a, p) => a + p.mastered, 0)
  const overallPct = totalPhrases > 0 ? Math.round((totalMastered / totalPhrases) * 100) : 0

  const levelXP = (stats?.level ?? 1) * 1000
  const prevLevelXP = (stats?.level ?? 1 - 1) * 1000
  const xpInLevel = (stats?.xp ?? 0) - prevLevelXP
  const xpPct = Math.round((xpInLevel / (levelXP - prevLevelXP)) * 100)

  const setData = allModules.map((m) => {
    const prog = progressByCode[m.topiccode] ?? { mastered: 0, total: m.itemcount }
    return {
      topiccode: m.topiccode,
      topictitle: m.topictitle,
      total: prog.total,
      mastered: prog.mastered,
      pct: prog.total > 0 ? Math.round((prog.mastered / prog.total) * 100) : 0,
      bestAttempts: efficiencyByCode[m.topiccode],
      completions: completionsByCode[m.topiccode] ?? 0,
    }
  })

  const weakestModule = setData
    .filter((s) => s.total >= 5 && s.mastered < s.total)
    .sort((a, b) => a.pct - b.pct)[0]

  const recentSessions = [] as Array<{ topiccode: string; attempts: number; score: number; totalItems: number }>

  return (
    <div className="app-main flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Your Progress</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {totalMastered} of {totalPhrases} phrases mastered · {overallPct}% overall
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats && stats.streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">{stats.streak} day streak</span>
            </div>
          )}
          {stats && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Lv.{stats.level}</span>
            </div>
          )}
        </div>
      </div>

      {/* XP Bar */}
      {stats && (
        <div className="glass rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">Level {stats.level} XP</span>
            <span className="text-yellow-400 font-medium">{stats.xp.toLocaleString()} XP total</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-yellow-500 to-yellow-300"
              style={{ width: `${Math.min(xpPct, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-600 mt-1">
            <span>Lv. {stats.level}</span>
            <span>Lv. {stats.level + 1}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 flex-1 min-h-0">
        {/* Set completion chart */}
        <SetChart data={setData} />

        {/* Module breakdown by Project Set */}
        <div className="glass rounded-2xl p-5 border border-white/5 animate-slide-up flex flex-col min-h-0">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 shrink-0">
            Module Mastery
          </h3>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
            {setData.slice(0, 20).map((s) => {
              const badge = getEfficiencyBadge(s.bestAttempts)
              const status = getStatusInfo(s.mastered, s.total)
              return (
                <div key={s.topiccode}>
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} />
                      <span className="text-slate-300 truncate">{s.topictitle}</span>
                      {badge && (
                        <span className="text-[10px]" title={`${badge.label}: ${s.bestAttempts} attempts`}>
                          {badge.icon}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.completions > 0 && (
                        <span className="text-slate-500 text-[10px]">{s.completions}✅</span>
                      )}
                      <span className="text-slate-500">{s.mastered}/{s.total}</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${s.pct}%`, background: s.pct >= 100 ? '#22c55e' : s.pct > 0 ? '#3b82f6' : 'rgba(255,255,255,0.08)' }}
                    />
                  </div>
                </div>
              )
            })}
            {setData.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">No modules found.</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass rounded-2xl p-5 border border-white/5 animate-slide-up flex flex-col min-h-0" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 shrink-0">
            Recommended for You
          </h3>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
            {weakestModule && (
              <button
                onClick={() => router.push(`/sets`)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl glass glass-hover text-sm text-left transition-all"
              >
                <Target className="w-4 h-4 text-orange-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-slate-200 font-medium">Focus: {weakestModule.topictitle}</p>
                  <p className="text-xs text-slate-500">{weakestModule.pct}% mastered — needs attention</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 ml-auto" />
              </button>
            )}

            {setData.filter((s) => s.mastered > 0 && s.mastered < s.total).slice(0, 3).map((s) => (
              <button
                key={s.topiccode}
                onClick={() => {
                  fetch(`/api/progress?action=generateset&topiccode=${s.topiccode}&size=40`)
                    .then((r) => r.json())
                    .then((data) => {
                      if (data.allDone) return
                      useCramStore.getState().setSet(data.items, { topiccode: s.topiccode, topictitle: s.topictitle, voice: 'es-ES', itemcount: data.items.length })
                      router.push('/cram')
                    })
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl glass glass-hover text-sm text-left transition-all"
              >
                <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-slate-200 font-medium">Continue {s.topictitle}</p>
                  <p className="text-xs text-slate-500">{s.mastered}/{s.total} mastered · {s.pct}%</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 ml-auto" />
              </button>
            ))}

            {setData.filter((s) => s.mastered === 0).slice(0, 2).map((s) => (
              <button
                key={s.topiccode}
                onClick={() => {
                  fetch(`/api/progress?action=generateset&topiccode=${s.topiccode}&size=40`)
                    .then((r) => r.json())
                    .then((data) => {
                      if (data.allDone) return
                      useCramStore.getState().setSet(data.items, { topiccode: s.topiccode, topictitle: s.topictitle, voice: 'es-ES', itemcount: data.items.length })
                      router.push('/cram')
                    })
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl glass glass-hover text-sm text-left transition-all"
              >
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-slate-200 font-medium">Start {s.topictitle}</p>
                  <p className="text-xs text-slate-500">{s.total} phrases · Not started</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 ml-auto" />
              </button>
            ))}

{setData.every((s) => s.mastered >= s.total || s.total === 0) && setData.length > 0 && (
              <p className="text-green-400 text-sm text-center py-4">All modules mastered! Amazing work! 🏆</p>
            )}
          </div>
      </div>

      {/* Efficiency summary */}
        <div className="glass rounded-2xl p-5 border border-white/5 animate-slide-up flex flex-col min-h-0" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5 shrink-0">
            Efficiency Overview
          </h3>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {EFFICIENCY_BADGES.map((badge) => {
              const count = setData.filter((s) => {
                const b = getEfficiencyBadge(s.bestAttempts)
                return b?.label === badge.label
              }).length
              return (
                <div key={badge.label} className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-lg">{badge.icon}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: badge.color }}>{badge.label}</p>
                    <p className="text-xs text-slate-500">≤{badge.max === Infinity ? '200+' : badge.max} attempts</p>
                  </div>
                  {count > 0 && (
                    <span className="ml-auto text-xs font-medium text-slate-400">{count} module{count !== 1 ? 's' : ''}</span>
                  )}
                </div>
              )
            })}
          </div>
          {setData.every((s) => !s.bestAttempts) && (
            <p className="text-slate-500 text-sm text-center py-4">Complete a full session to see efficiency stats.</p>
          )}
        </div>
      </div>
    </div>
  )
}