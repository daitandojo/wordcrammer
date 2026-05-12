'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { playCorrectSound, playIncorrectSound, playCompletionSound } from '@/lib/audio'
import { shuffleArray } from '@/lib/utils'
import EmptyState from '@/components/empty-state'

const QUIZ_SIZE = 40

export default function GapTextsPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [topic, setTopic] = useState<{ topictitle: string; voice: string } | null>(null)

  const [items, setItems] = useState<Array<{ question: string; answer: string }>>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [wordBank, setWordBank] = useState<string[]>([])
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
      const content: Array<{ question: string; answer: string }> = await contentRes.json()

      const t = topics.find((x: { topiccode: string }) => x.topiccode === code)
      setTopic(t ?? null)

      const selected = shuffleArray(content).slice(0, QUIZ_SIZE)
      setItems(selected)

      const allAnswers = shuffleArray(content.map((i) => i.answer))
      setWordBank(allAnswers.slice(0, 20))

      setLoading(false)
    }
    load()
  }, [code])

  const handleCheck = async () => {
    const item = items[currentIndex]
    const correct = selectedAnswer === item.answer
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

  const handleNext = async () => {
    if (currentIndex + 1 >= items.length) {
      playCompletionSound()
      const res = await fetch('/api/progress/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'gap-texts',
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
      setSelectedAnswer(null)
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
          <h2 className="text-2xl font-bold text-white mb-2">Fill the Gaps Complete!</h2>
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
            <button onClick={() => { setCurrentIndex(0); setScore(0); setDone(false); setSelectedAnswer(null); setShowFeedback(false); setItems(shuffleArray(items)) }}
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
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white text-center">{topic?.topictitle ?? code}</h2>
          <p className="text-xs text-slate-500 text-center">
            Fill the Gap &mdash; {currentIndex + 1} of {items.length}
          </p>
          <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10 mb-6 text-center">
          <p className="text-xs text-slate-500 mb-4">Complete the translation:</p>

          <div className="text-2xl font-bold text-white mb-2">&ldquo;{item.question}&rdquo;</div>

          <div className="flex items-center justify-center gap-3 mt-6 mb-6">
            <span className="text-lg text-slate-500">=</span>
            <div className="glass border-2 border-dashed border-white/10 rounded-xl px-6 py-3 min-w-[120px]">
              {selectedAnswer ? (
                <span className="text-white font-semibold text-lg">{selectedAnswer}</span>
              ) : (
                <span className="text-slate-600 text-sm">select below</span>
              )}
            </div>
          </div>

          {showFeedback && (
            <div className="mb-4 animate-scale-in">
              {wasCorrect ? (
                <div className="text-green-400 text-base font-semibold">Correct!</div>
              ) : (
                <div className="text-red-400">
                  <p className="font-semibold text-sm">Incorrect</p>
                  <p className="text-slate-300 text-xs mt-1">
                    Answer: <span className="text-white font-bold">{item.answer}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-2 mb-6 overflow-x-auto pb-2 -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-thin">
          {wordBank.map((word, idx) => {
            const isSelected = selectedAnswer === word
            const isDisabled = showFeedback || isSelected
            return (
              <button key={idx}
                onClick={() => !isDisabled && setSelectedAnswer(word)}
                disabled={isDisabled}
                className={`shrink-0 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-[0.95] min-h-[36px] sm:min-h-[40px] ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'glass glass-hover text-slate-300 border border-white/5'
                } disabled:opacity-40 disabled:cursor-not-allowed`}>
                {word}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">
            Score: <span className="text-blue-400 font-bold">{score}</span>
          </span>
          {!showFeedback ? (
            <button onClick={handleCheck} disabled={!selectedAnswer} className="btn-primary px-5 py-2 text-sm">
              Check
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary px-5 py-2 text-sm">
              {currentIndex + 1 >= items.length ? 'Finish' : 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
