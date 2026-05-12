'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Volume2 } from 'lucide-react'
import EmptyState from '@/components/empty-state'
import { playCorrectSound, playIncorrectSound, playCompletionSound } from '@/lib/audio'
import { shuffleArray } from '@/lib/utils'
import AccentHelper from '@/components/accent-helper'
import { replaceAccentChars } from '@/lib/accent-chars'

const QUIZ_SIZE = 40

export default function ListenTypePage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState('')
  const [topic, setTopic] = useState<{ topictitle: string; voice: string } | null>(null)

  const [items, setItems] = useState<Array<{ question: string; answer: string; topiccode: string }>>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [input, setInput] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [leveledUp, setLeveledUp] = useState(false)

  useEffect(() => {
    params.then((p) => setCode(p.code))
  }, [params])

  useEffect(() => {
    if (!code) return
    const load = async () => {
      const [topicsRes, contentRes] = await Promise.all([
        fetch('/api/topics'),
        fetch(`/api/content?topiccode=${code}`),
      ])
      const topics = await topicsRes.json()
      const content: Array<{ question: string; answer: string; topiccode: string }> =
        await contentRes.json()

      const t = topics.find((x: { topiccode: string }) => x.topiccode === code)
      setTopic(t ?? null)

      const shuffled = shuffleArray(content).slice(0, QUIZ_SIZE)
      setItems(shuffled)
      setLoading(false)
    }
    load()
  }, [code])

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus()
      speakWord()
    }
  }, [loading, currentIndex])

  const speakWord = (word?: string) => {
    const text = word ?? items[currentIndex]?.question
    const voice = topic?.voice ?? 'en-GB'
    if (!text || typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    const v = voices.find((v) => v.lang === voice)
    if (v) utterance.voice = v
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(replaceAccentChars(e.target.value))
  }

  const handleCheck = async () => {
    const item = items[currentIndex]
    const correct = input.trim().toLowerCase() === item.answer.toLowerCase()
    setWasCorrect(correct)
    setShowFeedback(true)

    if (correct) {
      setScore((s) => s + 1)
      playCorrectSound()
    } else {
      playIncorrectSound()
    }

    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topiccode: code,
        question: item.question,
        correct,
      }),
    })
  }

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showFeedback) handleNext()
      else if (input.trim()) handleCheck()
    }
  }

  const handleNext = async () => {
    if (currentIndex + 1 >= items.length) {
      playCompletionSound()
      const res = await fetch('/api/progress/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'listen-type',
          totalQuestions: items.length,
          score,
          isPerfectSession: score === items.length,
        }),
      })
      const xpData = await res.json()
      if (xpData.leveledUp) setLeveledUp(true)
      setDone(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setInput('')
      setShowFeedback(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="glass rounded-2xl p-8 max-w-md w-full text-center border border-white/10 animate-scale-in">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Listen & Type Complete!</h2>
          <p className="text-slate-400 text-sm mb-2">{topic?.topictitle ?? code}</p>
          <div className="space-y-2 my-6">
            <p className="text-slate-400 text-sm">
              Score: <span className="text-blue-400 font-bold">{score}</span> / {items.length}
            </p>
          </div>
          {leveledUp && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl mb-4 text-sm font-medium">
              Level up! 🎊
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/sets')} className="btn-secondary px-5 py-2 text-sm">
              Back to Topics
            </button>
            <button onClick={() => { setCurrentIndex(0); setScore(0); setDone(false); setShowFeedback(false); setInput(''); setItems(shuffleArray(items)) }}
              className="btn-primary px-5 py-2 text-sm">
              Play Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <EmptyState mood="idle" title="No phrases yet" description="Try a different set or generate one with AI." actionLabel="Browse sets" onAction={() => router.push('/sets')} />
      </div>
    )
  }

  const item = items[currentIndex]
  const progressPct = Math.round(((currentIndex + 1) / items.length) * 100)

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-3 sm:px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <h2 className="text-sm sm:text-lg font-semibold text-white text-center">{topic?.topictitle ?? code}</h2>
          <p className="text-[10px] sm:text-xs text-slate-500 text-center">
            Listen & Type &mdash; {currentIndex + 1} of {items.length}
          </p>
          <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="glass rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-white/10 mb-6 text-center">
          <p className="text-[10px] sm:text-xs text-slate-500 mb-4">Listen to the word and type what you hear:</p>

          <button onClick={() => speakWord()}
            className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:scale-110 transition-all mb-5 sm:mb-6"
            title="Play again">
            <Volume2 className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>

          {showFeedback && (
            <div className="mb-4 animate-scale-in">
              {wasCorrect ? (
                <div className="text-green-400 text-sm sm:text-base font-semibold">Correct!</div>
              ) : (
                <div className="text-red-400">
                  <p className="font-semibold text-xs sm:text-sm">Incorrect</p>
                  <p className="text-slate-300 text-[11px] sm:text-xs mt-1">
                    Answer: <span className="text-white font-bold">{item.answer}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          <input ref={inputRef} type="text" value={input} onChange={handleInput} onKeyUp={handleKeyUp}
            disabled={showFeedback} autoComplete="off"
            className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-base sm:text-lg placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 transition-all"
            placeholder="Type what you hear..." />

          {!showFeedback && (
            <div className="flex items-center justify-center mt-3">
              <AccentHelper />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-slate-400">
            Score: <span className="text-blue-400 font-bold">{score}</span>
          </span>
          {!showFeedback ? (
            <button onClick={handleCheck} disabled={!input.trim()} className="btn-primary px-4 sm:px-5 py-2 text-xs sm:text-sm">
              Check
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary px-4 sm:px-5 py-2 text-xs sm:text-sm">
              {currentIndex + 1 >= items.length ? 'Finish' : 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
