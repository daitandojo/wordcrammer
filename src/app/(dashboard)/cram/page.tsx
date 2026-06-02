'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Volume2, Flag, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useToast } from '@/components/toast'
import AccentDrawer from '@/components/accent-drawer'
import VoiceInput from '@/components/voice-input'
import QuestionTimer from '@/components/question-timer'
import CramCompletion from '@/components/cram-completion'
import CramOnboarding from '@/components/cram-onboarding'
import { useCramStore } from '@/store/cram-store'
import ProgressTrack from '@/components/progress-track'
import { replaceAccentChars, getAccentTips } from '@/lib/accent-chars'
import { playCorrectSound, playIncorrectSound, playCompletionSound, playTickSound, playTimeUpSound, playSparkle } from '@/lib/audio'
import { hapticSuccess, hapticError } from '@/lib/haptic'

type CramItem = {
  id: number; topiccode: string; question: string; answer: string
  questiontype: string; reported: string | null
  topic_tag: string | null; grammar_tag: string | null
  attempts: number; corrects: number
}

type Topic = { topiccode: string; topictitle: string; voice: string; itemcount: number }

export default function CramPage() {
  return <CramContent />
}

function CramContent() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const { currentSet: storeSet, currentTopic: storeTopic } = useCramStore()

  const [currentSet, setCurrentSet] = useState<CramItem[]>(storeSet)
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(storeTopic)
  const [currentItem, setCurrentItem] = useState<CramItem | null>(null)
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)
  const [xpGained, setXpGained] = useState(0)
  const [leveledUp, setLeveledUp] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [flash, setFlash] = useState<'correct' | 'incorrect' | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [autoVoice, setAutoVoice] = useState(true)
  const [timerRunning, setTimerRunning] = useState(false)
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | null>(null)
  const [sessionErrors, setSessionErrors] = useState<Array<{ question: string; answer: string; topic_tag: string | null; grammar_tag: string | null }>>([])
  const [aiFeedback, setAiFeedback] = useState<string | null>(null)
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, { correctCount: number; wrongCount: number }>>({})
  const [wrongAnswer, setWrongAnswer] = useState<string | null>(null)
  const sessionAnswersRef = useRef(sessionAnswers)

  useEffect(() => {
    sessionAnswersRef.current = sessionAnswers
  }, [sessionAnswers])

  const totalSize = currentSet.length
  const mastered = Object.values(sessionAnswers).filter((a) => a.correctCount >= 2).length
  const remaining = currentSet.filter((i) => {
    const sa = sessionAnswers[i.id]
    return !sa || sa.correctCount < 2
  }).length

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlTopic = params.get('topic')
    const urlTitle = params.get('title') ?? ''

    if (urlTopic) {
      console.log('[cram] fetching set for', urlTopic)
      const controller = new AbortController()
      const t = setTimeout(() => { controller.abort() }, 15000)
      fetch(`/api/progress?action=generateset&topiccode=${encodeURIComponent(urlTopic)}&size=40`, { cache: 'no-store', signal: controller.signal })
        .then((r) => { if (!r.ok) throw new Error('status ' + r.status); return r.json() })
        .then((data) => {
          clearTimeout(t)
          if (data.allDone) { window.location.href = '/dashboard'; return }
          const topic: Topic = { topiccode: urlTopic, topictitle: urlTitle, voice: '', itemcount: data.items?.length ?? 0 }
          setCurrentSet(data.items)
          setCurrentTopic(topic)
          setReady(true)
          if (!sessionStorage.getItem('wc_cram_onboarded')) setShowOnboarding(true)
        })
        .catch(() => { window.location.href = '/dashboard' })
      return
    }

    const cachedItems = sessionStorage.getItem('wc_cram_set')
    const cachedTopic = sessionStorage.getItem('wc_cram_topic')
    if (cachedItems && cachedTopic) {
      try {
        const items = JSON.parse(cachedItems)
        const topic = JSON.parse(cachedTopic)
        if (Array.isArray(items) && items.length > 0) {
          setCurrentSet(items)
          setCurrentTopic(topic)
          setReady(true)
          if (!sessionStorage.getItem('wc_cram_onboarded')) setShowOnboarding(true)
          return
        }
      } catch {}
    }
    setTimeout(() => { window.location.href = '/dashboard' }, 2000)
    return
  }, [])

  useEffect(() => {
    if (ready && currentSet.length > 0) setCurrentItem(currentSet[0])
  }, [ready, currentSet])

  useEffect(() => {
    if (ready && !showOnboarding) inputRef.current?.focus()
  }, [ready, showOnboarding, currentItem])

  useEffect(() => {
    if (done) {
      confetti({ particleCount: 120, spread: 120, origin: { y: 0.6 }, colors: ['#22c55e', '#3b82f6', '#eab308', '#a78bfa'] })
    }
  }, [done])

  const speakText = useCallback((text: string, lang?: string) => {
    if (!text || typeof window === 'undefined') return
    const voice = lang ?? currentTopic?.voice ?? 'es-ES'
    fetch('/api/audio/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: voice }),
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data?.audio) return
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`)
        audio.play().catch(() => {})
      })
      .catch(() => {})
  }, [currentTopic])

  const saveProgress = useCallback(async (question: string, correct: boolean) => {
    if (!currentTopic) return
    setSaveStatus('saving')
    try { await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topiccode: currentTopic.topiccode, question, correct }) }) } catch (e) { console.error('[Failed to save progress]', e) }
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus(null), 1500)
  }, [currentTopic])

  const proposeNext = useCallback(() => {
    const ans = sessionAnswersRef.current
    const itemsLeft = currentSet.filter((i) => {
    const sa = ans[i.id]
    return !sa || sa.correctCount < 2
  })
    if (itemsLeft.length === 0) { setDone(true); return }

    const candidates = itemsLeft.filter((i) => i.question !== currentItem?.question)
    const pool = candidates.length > 0 ? candidates : itemsLeft
    const item = pool[Math.floor(Math.random() * pool.length)]

    if (item) {
      setCurrentItem(item)
      setFlash(null)
      setTimerRunning(true)
    }
  }, [currentSet, currentItem])

  const handleAnswer = useCallback((correct: boolean) => {
    if (!currentItem) return
    console.log('[handleAnswer]', currentItem.id, currentItem.question, 'correct:', correct, 'sessionAnswers keys:', Object.keys(sessionAnswers))
    setTimerRunning(false)
    const question = currentItem.question

    saveProgress(question, correct)

    if (correct) {
      playCorrectSound()
      hapticSuccess()
      if (autoVoice) speakText(currentItem.answer)
      setFlash('correct')
      playSparkle()
      const id = Date.now()
      setSparkles((prev) => [...prev, { id, x: Math.random() * 60 + 20, y: Math.random() * 30 + 30 }])
      setTimeout(() => setSparkles((prev) => prev.filter((s) => s.id !== id)), 800)
      setSessionAnswers((prev) => {
        const existing = prev[currentItem.id] ?? { correctCount: 0, wrongCount: 0 }
        return { ...prev, [currentItem.id]: { correctCount: existing.correctCount + 1, wrongCount: existing.wrongCount } }
      })
      setTimeout(() => setFlash(null), 600)
      setTimeout(() => proposeNext(), 400)
    } else {
      playIncorrectSound()
      hapticError()
      setFlash('incorrect')
      setWrongAnswer(currentItem.answer)
      setSessionAnswers((prev) => {
        const existing = prev[currentItem.id] ?? { correctCount: 0, wrongCount: 0 }
        return { ...prev, [currentItem.id]: { correctCount: existing.correctCount, wrongCount: existing.wrongCount + 1 } }
      })
      if (currentItem.question) {
        setSessionErrors((prev) => {
          if (prev.length >= 10) return prev
          return [...prev, { question: currentItem.question, answer: currentItem.answer, topic_tag: currentItem.topic_tag, grammar_tag: currentItem.grammar_tag }]
        })
      }
    }
  }, [currentItem, currentTopic, saveProgress, speakText, proposeNext])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const converted = replaceAccentChars(raw)
    if (raw !== converted) e.target.value = converted
    if (currentItem && converted.trim().toLowerCase() === currentItem.answer.toLowerCase()) {
      e.target.value = ''
      handleAnswer(true)
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement
      const value = target.value.trim()
      if (!value) return
      target.value = ''
      handleAnswer(false)
    }
  }

  const awardSessionXp = useCallback(async () => {
    let earnedXp = 0
    try {
      const streakRes = await fetch('/api/progress/streak', { method: 'POST' })
      const streakData = await streakRes.json()
      if (streakData.updated && streakData.streak > 1) toast.show('streak', `${streakData.streak}-day streak! 🔥`)
      else if (streakData.updated && streakData.streak === 1) toast.show('streak', 'Streak started! 🔥')
    } catch (e) { console.error('[Failed to update streak]', e) }
    try {
      const res = await fetch('/api/progress/xp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gameType: 'flashcard-cram', totalQuestions: currentSet.length, score: mastered, isPerfectSession: remaining === 0 && mastered === currentSet.length }) })
      const data = await res.json()
      earnedXp = data.xpGained ?? 0
      if (data.xpGained !== undefined) {
        setXpGained(data.xpGained)
        let msg = `+${data.xpGained} XP`
        if (data.bonuses?.includes('critical')) msg += ' ⚡ CRITICAL HIT!'
        else if (data.bonuses?.includes('mystery')) msg += ' 🎁 Mystery Box!'
        else if (data.bonuses?.includes('speed')) msg += ' ⚡ Speed Bonus!'
        toast.show('xp', msg)
      }
      if (data.leveledUp) { setLeveledUp(true); toast.show('levelup', `Level ${data.level}! 🎊`); confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 }, colors: ['#a78bfa', '#60a5fa', '#eab308'] }) }
    } catch (e) { console.error('[Failed to award XP]', e) }
    try {
      const totalAttempts = Object.values(sessionAnswers).reduce((p, a) => p + a.correctCount + a.wrongCount, 0)
      await fetch('/api/progress/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topiccode: currentTopic?.topiccode, topictitle: currentTopic?.topictitle, score: mastered, totalItems: currentSet.length, xpEarned: earnedXp, attempts: totalAttempts }) })
    } catch (e) { console.error('[Failed to save session]', e) }
    // Check if first completed set — award referral XP if referred
    if (mastered > 0) {
      try {
        await fetch('/api/referral/reward', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      } catch {}
    }
    // AI feedback from session errors
    if (sessionErrors.length >= 2) {
      try {
        const errSummary = sessionErrors.map((e) => `"${e.question}" → correct: "${e.answer}"`).join('\n')
        const fbRes = await fetch('/api/ai/conversation-chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are a language tutor. The user made some errors in a flashcard session. Give 1-3 brief, encouraging sentences about patterns to focus on. Under 100 words. Focus on patterns.' },
              { role: 'user', content: `My errors:\n${errSummary}` },
            ],
          }),
        })
        const fbData = await fbRes.json()
        if (fbData.text) setAiFeedback(fbData.text)
      } catch (e) { console.error('[Failed to get AI feedback]', e) }
    }
  }, [currentSet, mastered, remaining, toast, currentTopic, sessionErrors, sessionAnswers])

  const proposeNextWrapper = useCallback(async () => {
    if (remaining <= 0) {
      playCompletionSound()
      const current = Number(sessionStorage.getItem('wc_completed_sets') ?? '0')
      sessionStorage.setItem('wc_completed_sets', String(current + 1))
      await awardSessionXp()
      setDone(true)
      return
    }
    proposeNext()
  }, [remaining, awardSessionXp, proposeNext])

  const handleReport = async () => {
    if (!currentItem || !currentTopic) return
    try { await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'report', topiccode: currentTopic.topiccode, question: currentItem.question }) }) } catch {}
  }

  const dismissOnboarding = () => { sessionStorage.setItem('wc_cram_onboarded', '1'); setShowOnboarding(false) }

  const startListeningMode = () => {
    if (!currentTopic || !currentSet.length) return
    setSpeaking(true)
    const voices = window.speechSynthesis.getVoices()
    const voice0 = voices.find((v) => v.lang === 'en-GB')
    const voice1 = voices.find((v) => v.lang === currentTopic.voice)
    const series: string[] = []
    for (const item of currentSet) series.push(item.question, item.answer, item.question, item.answer, item.question, item.answer)
    let idx = 0
    const speakSeries = () => {
      if (idx >= series.length || !speaking) { setSpeaking(false); return }
      const u = new SpeechSynthesisUtterance(series[idx])
      u.voice = idx % 2 === 0 && voice0 ? voice0 : voice1 ?? voice0 ?? null
      u.rate = idx % 2 === 0 ? 1 : 0.7
      u.onend = () => { idx++; setTimeout(speakSeries, idx % 6 === 0 ? 2000 : 500) }
      window.speechSynthesis.speak(u)
    }
    speakSeries()
  }

  if (!ready) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
  if (!currentTopic) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-slate-400">Select a topic from the topics page.</p></div>

  if (done) {
    const totalAttempts = Object.values(sessionAnswers).reduce((p, a) => p + a.correctCount + a.wrongCount, 0)
    let absorption = 13 - (3 * totalAttempts) / Math.max(mastered, 1)
    if (isNaN(absorption)) absorption = 0
    absorption = Math.round(absorption * 10) / 10 + 1

    const nextCode = currentTopic?.topiccode
      ? currentTopic.topiccode.slice(0, 2) + String(parseInt(currentTopic.topiccode.slice(2)) + 1).padStart(3, '0')
      : null

    return (
      <CramCompletion
        mastered={mastered}
        totalSet={totalSize}
        totalAttempts={totalAttempts}
        xpGained={xpGained}
        leveledUp={leveledUp}
        absorption={absorption}
        currentTopic={currentTopic}
        aiFeedback={aiFeedback}
        onMoreTopics={() => router.push('/sets')}
        onCramAgain={() => router.push('/cram')}
        onNextSet={nextCode ? () => router.push(`/cram?topic=${nextCode}&title=Set ${nextCode}`) : undefined}
      />
    )
  }

  const answer = currentItem?.answer ?? ''
  const accentTips = answer ? getAccentTips(answer) : []

  return (
    <>
      {showOnboarding && (
        <CramOnboarding onDismiss={dismissOnboarding} />
      )}

      <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#050810', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px 12px', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'rgba(148,163,184,0.35)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>{currentTopic.topiccode}</div>
            <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{currentTopic.topictitle}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(34,197,94,0.9)' }}>{mastered}</span>
            <span style={{ fontSize: '11px', color: 'rgba(148,163,184,0.3)' }}>/</span>
            <span style={{ fontSize: '13px', color: 'rgba(148,163,184,0.5)' }}>{totalSize}</span>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(148,163,184,0.3)', letterSpacing: '0.04em' }}>MASTERED</span>
            <span style={{ fontSize: '10px', color: 'rgba(148,163,184,0.3)', letterSpacing: '0.04em' }}>{remaining} LEFT</span>
          </div>
          <div style={{ height: '3px', borderRadius: '99px', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(mastered / totalSize) * 100}%`,
              background: 'linear-gradient(90deg, #22c55e, #4ade80)',
              borderRadius: '99px',
              transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1)',
              boxShadow: '0 0 8px rgba(34,197,94,0.3)',
            }} />
          </div>
        </div>

        {/* Progress circles */}
        <div style={{ padding: '0 20px 16px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '14px',
            padding: '12px 16px',
          }}>
            <ProgressTrack items={currentSet} currentQuestion={currentItem?.question} sessionAnswers={sessionAnswers} />
          </div>
          {saveStatus && (
            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '9px', transition: 'all 0.3s', color: saveStatus === 'saving' ? 'rgba(148,163,184,0.3)' : 'rgba(34,197,94,0.6)' }}>
                {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
              </span>
            </div>
          )}
        </div>

        {/* Sparkle particles */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {sparkles.map((s) => (
            <motion.div key={s.id} initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: 0, x: (s.x - 50) * 3, y: -100 }} transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ position: 'absolute', width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 6px rgba(250,204,21,0.5)', left: `${s.x}%`, top: `${s.y}%` }} />
          ))}
        </div>

        {/* Flash feedback — always reserved 30px so content doesn't shift */}
        <div style={{ height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
          {flash && (
            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: flash === 'correct' ? '#22c55e' : '#ef4444',
              letterSpacing: '0.05em',
              animation: 'fadeInUp 0.2s ease',
            }}>
              {flash === 'correct' ? 'CORRECT!' : 'WRONG'}
            </div>
          )}
        </div>

        {/* Main card */}
        {!speaking && currentItem && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px', overflow: 'auto' }}>
            {/* Question card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px',
              padding: '28px 24px',
              marginBottom: '12px',
            }}>
              {/* Language direction */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                <span style={{ fontSize: '18px' }}>🇬🇧</span>
                <span style={{ fontSize: '10px', color: 'rgba(148,163,184,0.25)', letterSpacing: '0.1em' }}>ENGLISH</span>
                <span style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '18px' }}>🇪🇸</span>
                <span style={{ fontSize: '10px', color: 'rgba(148,163,184,0.25)', letterSpacing: '0.1em' }}>SPANISH</span>
              </div>

              {/* Question text */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(148,163,184,0.3)', marginBottom: '12px', letterSpacing: '0.06em' }}>TRANSLATE THIS</div>
                <div style={{ fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 700, color: 'rgba(255,255,255,0.95)', fontStyle: 'italic', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
                  &ldquo;{currentItem.question}&rdquo;
                </div>
              </div>

              {/* Timer */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <QuestionTimer
                  running={timerRunning}
                  onTimeout={() => { setTimerRunning(false); playTimeUpSound(); handleAnswer(false) }}
                  onTick={(r) => { if (r <= 3 && r > 0) playTickSound() }}
                />
              </div>

              {/* Input */}
              <input
                ref={inputRef}
                type="text"
                autoComplete="off"
                onChange={handleInputChange}
                onKeyUp={handleKeyUp}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '20px',
                  fontWeight: 500,
                  textAlign: 'center',
                  padding: '12px 0',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit',
                }}
                placeholder="Type the translation..."
              />

              {/* Action buttons row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <AccentDrawer onInsert={(char) => { const i = inputRef.current; if (i) { const s = i.selectionStart ?? i.value.length; i.value = i.value.slice(0, s) + char + i.value.slice(s); i.focus() } }} inputRef={inputRef} />
                  <VoiceInput language={currentTopic?.voice ?? 'es-ES'} referenceText={answer}
                    onResult={(t) => { const i = inputRef.current; if (i) { i.value = t; if (t.trim().toLowerCase() === answer.toLowerCase()) { i.value = ''; handleAnswer(true) } else handleAnswer(false) } }} />
                </div>
                <button
                  onClick={() => { setAutoVoice((v) => !v) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', background: autoVoice ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${autoVoice ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}`, color: autoVoice ? 'rgba(34,197,94,0.8)' : 'rgba(148,163,184,0.3)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s ease' }}
                >
                  <Volume2 style={{ width: '14px', height: '14px' }} />
                  {autoVoice ? 'Auto On' : 'Auto Off'}
                </button>
              </div>
            </div>

            {/* Wrong answer modal */}
            {wrongAnswer && (
              <div style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(5,10,20,0.85)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(15,23,42,0.9))',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '20px',
                  padding: '32px 28px',
                  maxWidth: '400px', width: '100%',
                  textAlign: 'center',
                  boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                  animation: 'slideUp 0.2s ease',
                }}>
                  <div style={{ fontSize: '11px', color: 'rgba(239,68,68,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
                    Correct translation
                  </div>
                  <div style={{ fontSize: '14px', color: 'rgba(148,163,184,0.7)', marginBottom: '16px' }}>
                    of <em style={{ color: 'rgba(255,255,255,0.85)', fontStyle: 'normal', fontWeight: 600 }}>{currentItem?.question}</em>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                    {wrongAnswer}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(148,163,184,0.3)', marginBottom: '28px' }}>
                    Take your time to memorize
                  </div>
                  <button
                    onClick={() => { setWrongAnswer(null); proposeNext() }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setWrongAnswer(null); proposeNext() } }}
                    autoFocus
                    style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease' }}
                  >
                    Got it — next word
                  </button>
                  <div style={{ fontSize: '10px', color: 'rgba(148,163,184,0.2)', marginTop: '12px' }}>
                    or press Enter
                  </div>
                </div>
              </div>
            )}

            {/* Bottom actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingBottom: '20px' }}>
              <button
                onClick={handleReport}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', background: 'transparent', border: 'none', color: 'rgba(148,163,184,0.25)', fontSize: '11px', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                <Flag style={{ width: '12px', height: '12px' }} />
                Report
              </button>
              <button
                onClick={startListeningMode}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'transparent', border: 'none', color: 'rgba(148,163,184,0.25)', fontSize: '11px', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                <Volume2 style={{ width: '12px', height: '12px' }} />
                Listen to all
              </button>
              <button
                onClick={() => { setSessionAnswers({}); setCurrentItem(currentSet[0]); setFlash(null); setWrongAnswer(null); setTimerRunning(true) }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'transparent', border: 'none', color: 'rgba(239,68,68,0.3)', fontSize: '11px', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                Start over
              </button>
            </div>
          </div>
        )}

        {/* Listening mode */}
        {speaking && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', border: '2px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', animation: 'pulse 2s ease-in-out infinite' }}>
              <Volume2 style={{ width: '32px', height: '32px', color: 'rgba(59,130,246,0.6)' }} />
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.4)', marginBottom: '24px' }}>Listening mode active...</p>
            <button
              onClick={() => { setSpeaking(false); window.speechSynthesis.cancel() }}
              style={{ padding: '12px 32px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: 'rgba(239,68,68,0.7)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Stop
            </button>
          </div>
        )}
      </div>
    </>
  )


}
