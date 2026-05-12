'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/toast'
import { Trophy, Flame, Target, ChevronRight, BookOpen, Sparkles, Loader2, CheckCircle2, Globe, Clock, Play } from 'lucide-react'
import { getAchievements, ACHIEVEMENTS } from '@/lib/game-config'
import StreakDisplay from '@/components/streak-display'
import XpCounter from '@/components/xp-counter'
import { useCramStore } from '@/store/cram-store'
import { useUser } from '@/components/user-provider'
import PushPrompt from '@/components/push-prompt'
import RatePrompt from '@/components/rate-prompt'
import ChallengeCard from '@/components/challenge-card'
import { Skeleton } from '@/components/ui/skeleton'
import Crammy from '@/components/crammy'

type SetProgress = {
  topiccode: string
  topictitle: string
  total: number
  mastered: number
  pct: number
}

type UserStats = { xp: number; level: number; streak: number; username: string; firstname: string }

function getSetTier(code: string): 'essential' | 'important' | 'advanced' {
  const n = parseInt(code.slice(3))
  if (n <= 10) return 'essential'
  if (n <= 20) return 'important'
  return 'advanced'
}

const tierMeta = {
  essential: { label: 'Survival', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', desc: 'Basic fluency — defend yourself' },
  important: { label: 'Conversation', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', desc: 'Hold conversations, express opinions' },
  advanced: { label: 'Fluency', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', desc: 'Complex topics, nuanced expression' },
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { user: userData } = useUser()
  const router = useRouter()
  const toast = useToast()
  const [sets, setSets] = useState<SetProgress[]>([])
  const [quests, setQuests] = useState<Array<{ id: string; label: string; icon: string; done: boolean; xp: number }>>([])
  const [targetLangName, setTargetLangName] = useState('Spanish')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) return
    const load = async () => {
      try {
        const [topicsRes, questsRes] = await Promise.all([
          fetch('/api/topics'),
          fetch('/api/progress/quests'),
        ])
        const topics = await topicsRes.json()
        const questsData = await questsRes.json()
        if (questsData.quests) setQuests(questsData.quests)
        const langNames: Record<string, string> = { es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', nl: 'Dutch', pt: 'Portuguese', da: 'Danish', sv: 'Swedish', nb: 'Norwegian', fi: 'Finnish', pl: 'Polish', hu: 'Hungarian', el: 'Greek', ro: 'Romanian', ar: 'Arabic', he: 'Hebrew', ja: 'Japanese', zh: 'Chinese', id: 'Indonesian', uk: 'Ukrainian' }
        setTargetLangName(langNames[userData?.targetLanguage ?? 'es'] ?? 'Spanish')

        const progressRes = await fetch('/api/progress')
        const allProgress = await progressRes.json()

        const setProgress: SetProgress[] = topics
          .filter((t: { topiccode: string }) => t.topiccode?.startsWith('SET'))
          .map((topic: { topiccode: string; topictitle: string; itemcount: number }) => {
            const p = allProgress.filter((pr: { topiccode: string }) => pr.topiccode === topic.topiccode)
            const mastered = p.filter((pr: { corrects: string }) => Number(pr.corrects) >= 2).length
            return { topiccode: topic.topiccode, topictitle: topic.topictitle, total: topic.itemcount, mastered, pct: topic.itemcount > 0 ? Math.round((mastered / topic.itemcount) * 100) : 0 }
          })
          .sort((a: SetProgress, b: SetProgress) => a.topiccode.localeCompare(b.topiccode))
        setSets(setProgress)
      } catch (e) { console.error('[Failed to fetch user stats]', e) }
      setLoading(false)
    }
    load()
  }, [session])

  const nextSet = sets.find((s) => s.pct < 100 && s.pct > 0)
  const firstUnstarted = sets.find((s) => s.pct === 0)
  const recommended = nextSet || firstUnstarted
  const completedSets = sets.filter((s) => s.pct >= 100).length
  const totalSets = sets.length
  const overallPct = sets.length > 0 ? Math.round((completedSets / sets.length) * 100) : 0

  const isFirstVisit = completedSets === 0 && overallPct === 0

  if (loading) return (
    <div className="app-main p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6 animate-pulse">
      <div className="flex items-center justify-between"><Skeleton className="h-6 w-48" /><Skeleton className="h-6 w-24" /></div>
      <Skeleton className="h-32 w-full rounded-2xl" />
      {[1, 2, 3].map((t) => (
        <div key={t} className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </div>
      ))}
    </div>
  )

  const tiers = {
    essential: sets.filter((s) => getSetTier(s.topiccode) === 'essential'),
    important: sets.filter((s) => getSetTier(s.topiccode) === 'important'),
    advanced: sets.filter((s) => getSetTier(s.topiccode) === 'advanced'),
  }

  return (
    <div className="app-main p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
      {/* First visit welcome card */}
      {isFirstVisit && (
        <div className="glass rounded-2xl p-6 border border-brand/20 mb-6 bg-gradient-to-br from-brand/5 to-transparent">
          <div className="flex items-start gap-4">
            <Crammy mood="happy" size={64} />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white mb-1">Welcome to WordCrammer!</h2>
              <p className="text-sm text-slate-400 mb-4">You have 30 sets of 40 phrases waiting for you. Start with SET001 — the 40 most useful phrases in Spanish.</p>
              <button onClick={() => {
                const code = 'SET001'
                fetch(`/api/progress?action=generateset&topiccode=${code}&size=40`).then((r) => r.json()).then((data) => {
                  if (data.allDone) return
                  useCramStore.getState().setSet(data.items, { topiccode: code, topictitle: 'Top 40 Most Useful Everyday Phrases', voice: 'es-ES', itemcount: data.items.length })
                  router.push('/cram')
                })
              }} className="btn-primary px-5 py-2 text-sm">
                <Play className="w-4 h-4" /> Start SET001
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header — language + stats summary */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5 text-green-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">You're learning <span className="gradient-text">{targetLangName}</span></h1>
          </div>
            <p className="text-xs sm:text-sm text-slate-500">
            {completedSets} of {totalSets} sets completed · <XpCounter value={userData?.xp ?? 0} /> XP · Level {userData?.level}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userData && <StreakDisplay streak={userData.streak} />}
        </div>
      </div>

      {/* Overall progress + CTA */}
      <div className="glass rounded-2xl p-5 sm:p-6 border border-brand/10 mb-6 bg-gradient-to-br from-brand/5 to-transparent">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-1">
              {overallPct < 100 ? 'Your Journey' : 'Journey Complete!'}
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
              {recommended
                ? `Continue ${recommended.topictitle}`
                : 'All sets mastered!'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {recommended
                ? `${recommended.mastered} of ${recommended.total} mastered · ${recommended.pct}% complete`
                : 'Amazing work! Review any set to keep sharp.'}
            </p>
            <div className="w-full bg-white/5 rounded-full h-2 mt-3 overflow-hidden max-w-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
              />
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px] sm:text-xs text-slate-600">
              <span><span className="text-green-400 font-bold">{completedSets}</span> sets done</span>
              <span><span className="text-slate-400 font-bold">{totalSets - completedSets}</span> remaining</span>
              <span>~{(totalSets - completedSets) * 20} min left</span>
            </div>
          </div>
          {recommended && (
            <button
              onClick={() => {
                const code = recommended.topiccode
                fetch(`/api/progress?action=generateset&topiccode=${code}&size=40`).then((r) => r.json()).then((data) => {
                  if (data.allDone) return
                  useCramStore.getState().setSet(data.items, { topiccode: code, topictitle: recommended.topictitle, voice: 'es-ES', itemcount: data.items.length })
                  router.push('/cram')
                })
              }}
              className="btn-primary shrink-0 px-5 py-2.5 text-sm"
            >
              {nextSet ? 'Continue' : 'Start'} Cramming
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Journey Sections */}
      <div className="space-y-6">
        {(['essential', 'important', 'advanced'] as const).map((tierKey) => {
          const meta = tierMeta[tierKey]
          const tierSets = tiers[tierKey]
          const tierDone = tierSets.filter((s) => s.pct >= 100).length
          const tierTotal = tierSets.length
          if (tierTotal === 0) return null

          return (
            <div key={tierKey}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
                  <span className="text-[10px] text-slate-600">({tierDone}/{tierTotal})</span>
                </div>
                <span className="text-[10px] text-slate-600">{meta.desc}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {tierSets.map((set, i) => {
                  const isDone = set.pct >= 100
                  const isActive = set.topiccode === recommended?.topiccode
                  return (
                    <button
                      key={set.topiccode}
                      onClick={() => {
                        fetch(`/api/progress?action=generateset&topiccode=${set.topiccode}&size=40`).then((r) => r.json()).then((data) => {
                          if (data.allDone) return
                          useCramStore.getState().setSet(data.items, { topiccode: set.topiccode, topictitle: set.topictitle, voice: 'es-ES', itemcount: data.items.length })
                          router.push('/cram')
                        })
                      }}
                      className={`glass rounded-xl p-3 text-left transition-all duration-200 border ${
                        isDone
                          ? 'border-green-500/20 hover:bg-green-500/5'
                          : isActive
                            ? 'border-brand/30 ring-1 ring-brand/30 hover:bg-brand/5'
                            : 'border-white/5 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className={`text-[10px] font-mono ${isDone ? 'text-green-400' : isActive ? 'text-brand' : 'text-slate-600'}`}>
                          {set.topiccode.replace('SET', '')}
                        </span>
                        {isDone && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                      </div>
                      <p className="text-xs text-slate-300 truncate leading-tight mb-2">{set.topictitle}</p>
                      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${set.pct}%` }}
                          transition={{ duration: 0.5, delay: i * 0.02 }}
                          className={`h-full rounded-full ${isDone ? 'bg-green-500' : 'bg-blue-500'}`}
                        />
                      </div>
                      <p className="text-[9px] text-slate-600 mt-1">{set.mastered}/{set.total}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Share progress banner */}
      {completedSets > 0 && completedSets % 5 === 0 && (
        <div className="glass rounded-2xl p-4 border border-yellow-500/10 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Milestone: {completedSets} sets completed!</p>
            <p className="text-xs text-slate-400">Share your progress with friends.</p>
          </div>
          <button onClick={async () => {
            const text = `I've completed ${completedSets}/30 sets on WordCrammer! 🎯 ${overallPct}% of my language journey. wordcrammer.app`
            try { if (navigator.share) await navigator.share({ title: 'WordCrammer', text }); else { await navigator.clipboard.writeText(text); toast.show('xp', 'Share link copied!') } } catch {}
          }} className="btn-primary px-4 py-2 text-xs shrink-0">Share</button>
        </div>
      )}

      {/* Challenge + Push + Rate */}
      <div className="max-w-md mx-auto mt-6 space-y-3">
        <ChallengeCard />
        <PushPrompt />
        <RatePrompt />
      </div>

      {/* Bottom: Quests + Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {quests.length > 0 && (
          <div className="glass rounded-2xl p-4 border border-white/5">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Today's Quests</h3>
            <div className="space-y-1.5">
              {quests.map((q) => (
                <div key={q.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${q.done ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5 border border-white/5'}`}>
                  <span className="text-sm">{q.icon}</span>
                  <span className={`flex-1 ${q.done ? 'text-green-400 line-through' : 'text-slate-300'}`}>{q.label}</span>
                  <span className="text-[10px] text-yellow-500">{q.xp} XP</span>
                  {q.done && <span className="text-green-400 text-[10px]">Done</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-4 border border-white/5">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Invite Friends</h3>
          <p className="text-xs text-slate-400 mb-2">You both get <strong className="text-yellow-400">+50 XP</strong> when they complete their first set!</p>
          {userData?.referralCode && (
            <div className="space-y-1.5">
              <button
                onClick={async () => {
                  const url = userData.referralUrl || `${window.location.origin}/login?ref=${userData.referralCode}`
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: 'WordCrammer', text: `Join me on WordCrammer! We both get +50 XP when you complete your first set.`, url })
                    } else {
                      await navigator.clipboard.writeText(url)
                      toast.show('xp', 'Invite link copied!')
                    }
                  } catch {}
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg glass glass-hover text-xs text-slate-300 hover:text-white transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Share invite link
              </button>
              <p className="text-[10px] text-slate-600 text-center">{userData.referredCount ?? 0} friends joined</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
