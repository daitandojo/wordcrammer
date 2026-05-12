'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Volume2, Flag, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useToast } from '@/components/toast'
import AccentDrawer from '@/components/accent-drawer'
import VoiceInput from '@/components/voice-input'
import QuestionTimer from '@/components/question-timer'
import CramCompletion from '@/components/cram-completion'
import CramOnboarding from '@/components/cram-onboarding'
import { useCramStore } from '@/store/cram-store'
import { ProgressTrack } from '@/components/progress-track'
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

const languageFlags: [string, string][] = [
  ['FR', '🇫🇷'], ['GB', '🇬🇧'], ['ES', '🇪🇸'], ['NL', '🇳🇱'],
  ['UK', '🇺🇦'], ['TR', '🇹🇷'], ['DE', '🇩🇪'], ['DK', '🇩🇰'],
  ['SE', '🇸🇪'], ['NO', '🇳🇴'], ['IT', '🇮🇹'],
]

export default function CramPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const { currentSet: storeSet, currentTopic: storeTopic, setSet, addError, clear } = useCramStore()

  const [currentSet, setCurrentSet] = useState<CramItem[]>(storeSet)
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(storeTopic)
  const [currentItem, setCurrentItem] = useState<CramItem | null>(null)
  const [revealAnswer, setRevealAnswer] = useState(false)
  const [wordReported, setWordReported] = useState(false)
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)
  const [xpGained, setXpGained] = useState(0)
  const [leveledUp, setLeveledUp] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showBriefing, setShowBriefing] = useState(true)
  const [briefingCount, setBriefingCount] = useState(3)
  const [flash, setFlash] = useState<'correct' | 'incorrect' | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [pronunciationScore, setPronunciationScore] = useState<{ score: number; words: Array<{ word: string; accuracyScore: number }> } | null>(null)
  const [timerRunning, setTimerRunning] = useState(false)
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | null>(null)
  const [sessionErrors, setSessionErrors] = useState<Array<{ question: string; answer: string; topic_tag: string | null; grammar_tag: string | null }>>([])
  const [aiFeedback, setAiFeedback] = useState<string | null>(null)

  const totalSize = currentSet.length
  const mastered = currentSet.filter((i) => i.corrects >= 2 && !Number(i.reported)).length
  const remaining = currentSet.filter((i) => i.corrects < 2 && !Number(i.reported)).length

  useEffect(() => {
    if (storeSet.length === 0 && storeTopic === null) { router.push('/sets'); return }
    setCurrentSet(storeSet)
    setCurrentTopic(storeTopic)
    setReady(true)
    if (!sessionStorage.getItem('wc_cram_onboarded')) setShowOnboarding(true)
  }, [router, storeSet, storeTopic])

  useEffect(() => {
    if (ready && currentSet.length > 0) setCurrentItem(currentSet[0])
  }, [ready, currentSet])

  useEffect(() => {
    if (ready && !showOnboarding && !showBriefing) inputRef.current?.focus()
  }, [ready, showOnboarding, showBriefing, currentItem])

  useEffect(() => {
    if (!showBriefing && !showOnboarding) {
      const t = setTimeout(() => setShowBriefing(false), 0)
      return () => clearTimeout(t)
    }
  }, [showBriefing, showOnboarding])

  useEffect(() => {
    if (done) {
      confetti({ particleCount: 120, spread: 120, origin: { y: 0.6 }, colors: ['#22c55e', '#3b82f6', '#eab308', '#a78bfa'] })
    }
  }, [done])

  const speakText = useCallback((text: string, lang = 'en-GB', rate = 1) => {
    if (!text || typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find((v) => v.lang === lang)
    if (voice) utterance.voice = voice
    utterance.rate = rate
    window.speechSynthesis.speak(utterance)
  }, [])

  const saveProgress = useCallback(async (question: string, correct: boolean) => {
    if (!currentTopic) return
    setSaveStatus('saving')
    try { await fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topiccode: currentTopic.topiccode, question, correct }) }) } catch (e) { console.error('[Failed to save progress]', e) }
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus(null), 1500)
  }, [currentTopic])

  const proposeNext = useCallback(() => {
    const itemsLeft = currentSet.filter((i) => i.corrects < 2 && !Number(i.reported))
    if (itemsLeft.length === 0) { setDone(true); return }

    const candidates = itemsLeft.filter((i) => i.question !== currentItem?.question)
    const pool = candidates.length > 0 ? candidates : itemsLeft
    const item = pool[Math.floor(Math.random() * pool.length)]

    if (item) {
      setCurrentItem(item)
      setRevealAnswer(false)
      setWordReported(Number(item.reported) === 1)
      setFlash(null)
      setTimerRunning(true)
    }
  }, [currentSet, currentItem])

  const handleAnswer = useCallback((correct: boolean) => {
    if (!currentItem) return
    setTimerRunning(false)

    setCurrentSet((prev) => prev.map((item) => {
      if (item.question === currentItem.question) {
        return { ...item, attempts: item.attempts + 1, corrects: correct ? item.corrects + 1 : Math.max(0, item.corrects - 1) }
      }
      return item
    }))

    saveProgress(currentItem.question, correct)

    if (correct) {
      playCorrectSound()
      hapticSuccess()
      speakText(currentItem.answer, currentTopic?.voice ?? 'en-GB')
      setFlash('correct')
      playSparkle()
      const id = Date.now()
      setSparkles((prev) => [...prev, { id, x: Math.random() * 60 + 20, y: Math.random() * 30 + 30 }])
      setTimeout(() => setSparkles((prev) => prev.filter((s) => s.id !== id)), 800)
      setTimeout(() => proposeNext(), 400)
    } else {
      playIncorrectSound()
      hapticError()
      setFlash('incorrect')
      setRevealAnswer(true)
      // Track error for AI feedback
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
      if (!revealAnswer) handleAnswer(false)
      else proposeNext()
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
      const totalAttempts = currentSet.reduce((p, i) => p + Number(i.attempts), 0)
      await fetch('/api/progress/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topiccode: currentTopic?.topiccode, topictitle: currentTopic?.topictitle, score: mastered, totalItems: currentSet.length, xpEarned: earnedXp, attempts: totalAttempts }) })
    } catch (e) { console.error('[Failed to save session]', e) }
    // Check if first completed set — award referral XP if referred
    if (mastered > 0 && currentSet.filter((i) => Number(i.corrects) >= 2).length > 0) {
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
  }, [currentSet, mastered, remaining, toast, currentTopic, sessionErrors])

  const proposeNextWrapper = useCallback(() => {
    if (remaining <= 0) {
      playCompletionSound()
      // Track completed set count for rate prompt
      const current = Number(sessionStorage.getItem('wc_completed_sets') ?? '0')
      sessionStorage.setItem('wc_completed_sets', String(current + 1))
      awardSessionXp()
      setDone(true)
      return
    }
    proposeNext()
  }, [remaining, awardSessionXp, proposeNext])

  const handleReport = async () => {
    if (!currentItem || !currentTopic) return
    try { await fetch('/api/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'report', topiccode: currentTopic.topiccode, question: currentItem.question }) }); setWordReported(true) } catch (e) { console.error('[Failed to report content]', e) }
  }

  const getFlag = (voice: string): string => {
    const country = voice.split('-')[1] ?? ''
    const combo = languageFlags.find((f) => f[0] === country)
    return combo ? combo[1] : ''
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
    const totalAttempts = currentSet.reduce((p, i) => p + Number(i.attempts), 0)
    let absorption = 13 - (3 * totalAttempts) / Math.max(mastered, 1)
    if (isNaN(absorption)) absorption = 0
    absorption = Math.round(absorption * 10) / 10 + 1

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
      />
    )
  }

  const flag = getFlag(currentTopic.voice ?? '')
  const answer = currentItem?.answer ?? ''
  const accentTips = answer ? getAccentTips(answer) : []

  return (
    <>
      {showOnboarding && (
        <CramOnboarding onDismiss={dismissOnboarding} />
      )}

      <div className="min-h-[80vh] flex flex-col items-center justify-start sm:justify-center px-3 sm:px-4 py-4 sm:py-8">
        <div className="w-full max-w-xl">
          <div className="text-center mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-base font-semibold text-white">{currentTopic.topictitle}</h2>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="text-[10px] sm:text-xs text-slate-500">
                {currentTopic.topiccode} · {currentItem?.topic_tag && <span className="text-blue-400">{currentItem.topic_tag}</span>}
                {currentItem?.grammar_tag && <span className="text-slate-600"> · {currentItem.grammar_tag}</span>}
              </span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                parseInt(currentTopic.topiccode.slice(3)) <= 10
                  ? 'text-green-400 bg-green-500/10'
                  : parseInt(currentTopic.topiccode.slice(3)) <= 20
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-purple-400 bg-purple-500/10'
              }`}>
                {parseInt(currentTopic.topiccode.slice(3)) <= 10 ? 'Essential' : parseInt(currentTopic.topiccode.slice(3)) <= 20 ? 'Important' : 'Advanced'}
              </span>
            </div>
            {/* Mini journey progress */}
            <div className="flex items-center justify-center gap-3 mt-2 text-[9px] text-slate-600">
              <span>{mastered}/{totalSize} mastered</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>{remaining} remaining</span>
            </div>
            <div className="w-full max-w-xs mx-auto bg-white/5 rounded-full h-1 mt-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-300"
                style={{ width: `${(mastered / totalSize) * 100}%` }} />
            </div>
          </div>

          <div className="glass rounded-xl p-3 sm:p-4 border border-white/5 mb-4 sm:mb-6">
            <ProgressTrack items={currentSet} currentQuestion={currentItem?.question} />
            {saveStatus && (
              <div className="text-center mt-1">
                <span className={`text-[9px] transition-all ${saveStatus === 'saving' ? 'text-slate-500' : 'text-green-400'}`}>
                  {saveStatus === 'saving' ? 'Saving...' : 'Saved ✓'}
                </span>
              </div>
            )}
          </div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {sparkles.map((s) => (
              <motion.div key={s.id} initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: 0, x: (s.x - 50) * 3, y: -100 }} transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.6)]" style={{ left: `${s.x}%`, top: `${s.y}%` }} />
            ))}
          </div>

          {flash && <div role="alert" className={`text-center text-sm font-semibold mb-2 animate-scale-in ${flash === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{flash === 'correct' ? 'Correct!' : 'Incorrect'}</div>}

          {!speaking && currentItem && (
            <>
              <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 mb-3">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <button onClick={() => speakText(currentItem.question, 'en-GB')} className="hidden sm:inline-flex p-1.5 rounded-lg text-blue-400 hover:text-blue-300" aria-label="Hear the word">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold italic text-white/90 text-center">&ldquo;{currentItem.question}&rdquo;</span>
                </div>

                <div className="flex items-center justify-center gap-2 mb-3 sm:hidden">
                  <button onClick={() => speakText(currentItem.question, 'en-GB')} className="p-1.5 rounded-lg text-blue-400" aria-label="Hear the word"><Volume2 className="w-4 h-4" /></button>
                  <span className="text-xs text-slate-500">{flag}</span>
                </div>

                <input ref={inputRef} type="text" autoComplete="off" onChange={handleInputChange} onKeyUp={handleKeyUp}
                  className="w-full bg-transparent text-white text-center text-xl sm:text-2xl font-medium placeholder-slate-600 focus:outline-none border-b-2 border-white/10 focus:border-brand/50 pb-2 transition-colors"
                  placeholder="Type the translation..." />

                <div className="flex items-center justify-center mt-3 gap-2">
                  <QuestionTimer running={timerRunning} onTimeout={() => { setTimerRunning(false); playTimeUpSound(); if (!revealAnswer && currentItem) handleAnswer(false) }} onTick={(r) => { if (r <= 3 && r > 0) playTickSound() }} />
                  <span className="text-[10px] text-slate-600">seconds</span>
                </div>
              </div>

              {revealAnswer && (
                <div className="glass rounded-xl p-4 border border-white/10 text-center animate-scale-in mb-3">
                  <div className="text-lg sm:text-xl font-bold text-white mb-1">{flag} {answer}</div>
                  {accentTips.length > 0 && <p className="text-[10px] sm:text-xs text-slate-500">Tip: {accentTips.join(', ')}</p>}
                </div>
              )}

              {pronunciationScore && (
                <div className="glass rounded-xl p-3 mb-3 border border-yellow-500/10 animate-slide-up">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Pronunciation</span>
                    <span className={pronunciationScore.score >= 70 ? 'text-green-400' : pronunciationScore.score >= 40 ? 'text-yellow-400' : 'text-red-400'}>{pronunciationScore.score}%</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {pronunciationScore.words.map((w, i) => (
                      <span key={i} className="text-xs flex items-center gap-1">
                        <span className="text-white">{w.word}</span>
                        <span className={w.accuracyScore >= 70 ? 'text-green-400' : w.accuracyScore >= 40 ? 'text-yellow-400' : 'text-red-400'}>{w.accuracyScore}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AccentDrawer onInsert={(char) => { const i = inputRef.current; if (i) { const s = i.selectionStart ?? i.value.length; i.value = i.value.slice(0, s) + char + i.value.slice(s); i.focus() } }} inputRef={inputRef} />
                  <VoiceInput language={currentTopic?.voice ?? 'es-ES'} referenceText={answer}
                    onResult={(t) => { const i = inputRef.current; if (i) { i.value = t; if (t.trim().toLowerCase() === answer.toLowerCase()) { i.value = ''; handleAnswer(true) } else handleAnswer(false) } }} />
                </div>
                <button onClick={handleReport} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium min-h-[36px] transition-all ${wordReported ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
                  <Flag className="w-3 h-3" />{wordReported ? 'Reported' : 'Report'}
                </button>
              </div>
            </>
          )}

          {speaking && (
            <div className="glass rounded-xl p-6 border border-white/10 text-center animate-slide-up">
              <div className="animate-pulse text-3xl mb-4">{flag || '🔊'}</div>
              <p className="text-slate-400 text-xs sm:text-sm mb-4">Listening mode active...</p>
              <button onClick={() => { setSpeaking(false); window.speechSynthesis.cancel() }} className="btn-danger px-5 py-2.5 text-xs sm:text-sm min-h-[44px]">Stop</button>
            </div>
          )}

          <div className="flex justify-center mt-3">
            <button onClick={startListeningMode} className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Listen to full set
            </button>
          </div>
        </div>
      </div>
    </>
  )


}
