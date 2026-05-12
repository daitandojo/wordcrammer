'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Trophy, Target, Loader2, ChevronRight, Flame } from 'lucide-react'
import { useCramStore } from '@/store/cram-store'
import SetChart from '@/components/set-chart'

type TopicStats = {
  topiccode: string
  topictitle: string
  total: number
  mastered: number
  pct: number
}

type TagStats = {
  tag: string
  total: number
  mastered: number
  pct: number
}

type UserStats = {
  xp: number
  level: number
  streak: number
  username: string
  firstname: string
}

export default function AnalysisPage() {
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [setData, setSetData] = useState<TopicStats[]>([])
  const [topicTagData, setTopicTagData] = useState<TagStats[]>([])
  const [grammarTagData, setGrammarTagData] = useState<TagStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, topicsRes, progressRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch('/api/topics'),
          fetch('/api/progress'),
        ])
        const me = await meRes.json()
        const topics = await topicsRes.json()
        const allProgress: Array<{ topiccode: string; question: string; attempts: string; corrects: string }> = await progressRes.json()

        setStats({
          xp: me.xp ?? 0,
          level: me.level ?? 1,
          streak: me.streak ?? 0,
          username: me.username ?? '',
          firstname: me.firstname ?? 'Crammer',
        })

        // Fetch content for SET topics to get tags
        const allContent: Array<{ topiccode: string; question: string; answer: string; topic_tag: string | null; grammar_tag: string | null }> = []
        for (const topic of (topics as Array<{ topiccode: string }>).filter((t) => t.topiccode?.startsWith('SET'))) {
          const r = await fetch(`/api/content?topiccode=${topic.topiccode}`).catch(() => null)
          if (r?.ok) {
            const c = await r.json()
            allContent.push(...c)
          }
        }

        const contentMap = new Map(allContent.map((c) => [`${c.topiccode}|${c.question}`, c]))

        // Per-set stats
        const sets = topics
          .filter((t: { topiccode: string }) => t.topiccode?.startsWith('SET'))
          .map((topic: { topiccode: string; topictitle: string; itemcount: number }) => {
            const p = allProgress.filter((pr) => pr.topiccode === topic.topiccode)
            const mastered = p.filter((pr) => Number(pr.corrects) >= 2).length
            return {
              topiccode: topic.topiccode,
              topictitle: topic.topictitle,
              total: topic.itemcount,
              mastered,
              pct: topic.itemcount > 0 ? Math.round((mastered / topic.itemcount) * 100) : 0,
            }
          })
          .sort((a: TopicStats, b: TopicStats) => a.topiccode.localeCompare(b.topiccode))
        setSetData(sets)

        // Topic tag stats
        const tagMap = new Map<string, { total: number; mastered: number }>()
        for (const item of allContent) {
          const tag = item.topic_tag || 'uncategorized'
          if (!tagMap.has(tag)) tagMap.set(tag, { total: 0, mastered: 0 })
          const t = tagMap.get(tag)!
          t.total++
          const prog = allProgress.find(
            (p) => p.topiccode === item.topiccode && p.question === item.question
          )
          if (prog && Number(prog.corrects) >= 2) t.mastered++
        }
        setTopicTagData(
          Array.from(tagMap.entries())
            .map(([tag, v]) => ({ tag, total: v.total, mastered: v.mastered, pct: Math.round((v.mastered / v.total) * 100) }))
            .sort((a, b) => b.total - a.total)
        )

        // Grammar tag stats
        const gramMap = new Map<string, { total: number; mastered: number }>()
        for (const item of allContent) {
          const tag = item.grammar_tag || 'other'
          if (!gramMap.has(tag)) gramMap.set(tag, { total: 0, mastered: 0 })
          const t = gramMap.get(tag)!
          t.total++
          const prog = allProgress.find(
            (p) => p.topiccode === item.topiccode && p.question === item.question
          )
          if (prog && Number(prog.corrects) >= 2) t.mastered++
        }
        setGrammarTagData(
          Array.from(gramMap.entries())
            .map(([tag, v]) => ({ tag: tag.replace(/_/g, ' '), total: v.total, mastered: v.mastered, pct: Math.round((v.mastered / v.total) * 100) }))
            .sort((a, b) => b.total - a.total)
        )
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

  const totalPhrases = setData.reduce((a, s) => a + s.total, 0)
  const totalMastered = setData.reduce((a, s) => a + s.mastered, 0)
  const overallPct = totalPhrases > 0 ? Math.round((totalMastered / totalPhrases) * 100) : 0

  const topWeakTag = topicTagData.filter((t) => t.total >= 5).sort((a, b) => a.pct - b.pct)[0]

  return (
    <div className="app-main p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Your Progress</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {totalMastered} of {totalPhrases} phrases mastered · {overallPct}% overall
          </p>
        </div>
        {stats && (
          <div className="flex items-center gap-2">
            {stats.streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">{stats.streak} day streak</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Lv.{stats.level}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      {/* Set completion chart */}
        <SetChart data={setData} />
        </div>

        {/* Topic tag mastery */}
        <div className="glass rounded-2xl p-4 sm:p-5 border border-white/5 animate-slide-up" style={{ animationDelay: '0.1s' }}
        >
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Mastery by Topic
          </h3>
          <div className="h-48 sm:h-56 overflow-y-auto space-y-2 pr-1">
            {topicTagData.slice(0, 15).map((t) => (
              <div key={t.tag}>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-slate-300 capitalize">{t.tag}</span>
                  <span className="text-slate-500">{t.mastered}/{t.total}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${t.pct}%`, background: t.pct >= 80 ? '#22c55e' : t.pct >= 40 ? '#3b82f6' : '#ef4444' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grammar tag mastery */}
        <div className="glass rounded-2xl p-4 sm:p-5 border border-white/5 animate-slide-up" style={{ animationDelay: '0.2s' }}
        >
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Mastery by Grammar
          </h3>
          <div className="h-48 sm:h-56 overflow-y-auto space-y-2 pr-1">
            {grammarTagData.slice(0, 15).map((t) => (
              <div key={t.tag}>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-slate-300 capitalize">{t.tag}</span>
                  <span className="text-slate-500">{t.mastered}/{t.total}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${t.pct}%`, background: t.pct >= 80 ? '#22c55e' : t.pct >= 40 ? '#3b82f6' : '#ef4444' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="glass rounded-2xl p-4 sm:p-5 border border-white/5 animate-slide-up" style={{ animationDelay: '0.3s' }}
        >
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Recommended for You
          </h3>
          <div className="space-y-3">
            {topWeakTag && (
              <button
                onClick={() => router.push(`/sets`)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl glass glass-hover text-sm text-left transition-all"
              >
                <Target className="w-4 h-4 text-orange-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-slate-200 font-medium">Practice {topWeakTag.tag}</p>
                  <p className="text-xs text-slate-500">Only {topWeakTag.pct}% mastered — create a filtered practice</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 ml-auto" />
              </button>
            )}

            {setData.filter((s) => s.pct > 0 && s.pct < 100).slice(0, 2).map((s) => (
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
                <BarChart3 className="w-4 h-4 text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-slate-200 font-medium">Continue {s.topictitle}</p>
                  <p className="text-xs text-slate-500">{s.mastered}/{s.total} mastered · {s.pct}%</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 ml-auto" />
              </button>
            ))}

            {!topWeakTag && setData.every((s) => s.pct >= 100) && (
              <p className="text-slate-500 text-sm text-center py-4">All sets complete! Amazing work.</p>
            )}
        </div>
      </div>
    </div>
  )
}
