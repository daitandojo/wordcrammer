'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { playCorrectSound, playIncorrectSound, playCompletionSound } from '@/lib/audio'
import { shuffleArray } from '@/lib/utils'
import EmptyState from '@/components/empty-state'

const QUIZ_SIZE = 40

export default function SentenceBuildPage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [topic, setTopic] = useState<{ topictitle: string; voice: string } | null>(null)

  const [items, setItems] = useState<Array<{ question: string; answer: string }>>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [tokens, setTokens] = useState<string[]>([])
  const [placed, setPlaced] = useState<string[]>([])
  const [remaining, setRemaining] = useState<string[]>([])
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
      const content: Array<{ question: string; answer: string }> = await contentRes.json()

      const t = topics.find((x: { topiccode: string }) => x.topiccode === code)
      setTopic(t ?? null)

      const selected = shuffleArray(content).slice(0, QUIZ_SIZE)
      setItems(selected)
      setLoading(false)
    }
    load()
  }, [code])

  useEffect(() => {
    if (items.length > 0 && currentIndex < items.length) {
      initRound(items[currentIndex])
    }
  }, [items, currentIndex])

  const initRound = (item: { question: string; answer: string }) => {
    const words = item.answer.split(/\s+/).filter(Boolean)
    setTokens(words)
    setPlaced([])
    setRemaining(shuffleArray(words))
    setShowFeedback(false)
    setWasCorrect(false)
  }

  const handleWordClick = (word: string, fromPlaced: boolean) => {
    if (showFeedback) return
    if (fromPlaced) {
      setPlaced((p) => p.filter((w) => w !== word))
      setRemaining((r) => [...r, word])
    } else {
      setRemaining((r) => r.filter((w) => w !== word))
      setPlaced((p) => [...p, word])
    }
  }

  const handleCheck = async () => {
    const correct = placed.join(' ') === items[currentIndex].answer
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
        question: items[currentIndex].question,
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
          gameType: 'sentence-building',
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
          <h2 className="text-2xl font-bold text-white mb-2">Sentence Building Complete!</h2>
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
            <button onClick={() => { setCurrentIndex(0); setScore(0); setDone(false); setItems(shuffleArray(items)) }}
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
            Sentence Building &mdash; {currentIndex + 1} of {items.length}
          </p>
          <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10 mb-6 text-center">
          <p className="text-xs text-slate-500 mb-4">Build the sentence for:</p>
          <div className="text-2xl font-bold text-white mb-6">&ldquo;{item.question}&rdquo;</div>

          <div className="min-h-[60px] flex flex-wrap justify-center gap-2 mb-6 p-3 bg-white/5 rounded-xl border-2 border-dashed border-white/10">
            {placed.length === 0 && !showFeedback && (
              <span className="text-slate-600 text-sm self-center">Click words below to build</span>
            )}
            {placed.map((word, idx) => (
              <button key={`${word}-${idx}`}
                onClick={() => handleWordClick(word, true)}
                disabled={showFeedback}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[36px] sm:min-h-[40px] ${
                  showFeedback
                    ? 'bg-blue-600/30 text-blue-200'
                    : 'bg-blue-600 text-white hover:bg-blue-500 cursor-pointer active:scale-[0.95]'
                }`}>
                {word}
              </button>
            ))}
          </div>

          {remaining.length > 0 && !showFeedback && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {remaining.map((word, idx) => (
                <button key={`${word}-${idx}`}
                  onClick={() => handleWordClick(word, false)}
                  className="px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium glass glass-hover text-slate-300 border border-white/5 transition-all active:scale-[0.95] min-h-[36px] sm:min-h-[40px]">
                  {word}
                </button>
              ))}
            </div>
          )}

          {showFeedback && (
            <div className="mb-4 animate-scale-in">
              {wasCorrect ? (
                <div className="text-green-400 text-base font-semibold">Correct!</div>
              ) : (
                <div className="text-red-400">
                  <p className="font-semibold text-sm">Incorrect</p>
                  <p className="text-slate-300 text-xs mt-1">
                    Correct order: <span className="text-white font-bold">{item.answer}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">
            Score: <span className="text-blue-400 font-bold">{score}</span>
          </span>
          {!showFeedback ? (
            <button onClick={handleCheck} disabled={placed.length !== tokens.length} className="btn-primary px-5 py-2 text-sm">
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
