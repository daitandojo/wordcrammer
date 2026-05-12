'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, HelpCircle } from 'lucide-react'
import EmptyState from '@/components/empty-state'
import { playCorrectSound, playIncorrectSound, playCompletionSound } from '@/lib/audio'
import { shuffleArray } from '@/lib/utils'

type WordItem = {
  id: number
  question: string
  answer: string
  topiccode: string
}

type ProgressMap = Record<string, { attempts: number; corrects: number }>

const QUIZ_SIZE = 40

export default function MultipleChoicePage({ params }: { params: Promise<{ code: string }> }) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [topic, setTopic] = useState<{ topictitle: string; voice: string } | null>(null)

  const [allItems, setAllItems] = useState<WordItem[]>([])
  const [progress, setProgress] = useState<ProgressMap>({})
  const [quizItems, setQuizItems] = useState<WordItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [options, setOptions] = useState<{ text: string; correct: boolean }[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [loading, setLoading] = useState(true)
  const [leveledUp, setLeveledUp] = useState(false)

  useEffect(() => {
    params.then((p) => setCode(p.code))
  }, [params])

  useEffect(() => {
    if (!code) return
    const load = async () => {
      const [topicsRes, contentRes, progressRes] = await Promise.all([
        fetch('/api/topics'),
        fetch(`/api/content?topiccode=${code}`),
        fetch(`/api/progress?topiccode=${code}`),
      ])
      const topics = await topicsRes.json()
      const content: WordItem[] = await contentRes.json()
      const prog: Array<{ question: string; attempts: string; corrects: string }> =
        await progressRes.json()

      const t = topics.find((x: { topiccode: string }) => x.topiccode === code)
      setTopic(t ?? null)

      const progMap: ProgressMap = {}
      for (const p of prog) {
        progMap[p.question] = { attempts: Number(p.attempts), corrects: Number(p.corrects) }
      }
      setProgress(progMap)

      const unmastered = content.filter((item) => {
        const p = progMap[item.question]
        return !p || p.corrects < 2
      })

      const shuffled = shuffleArray(unmastered).slice(0, QUIZ_SIZE)
      setAllItems(content)
      setQuizItems(shuffled)
      setLoading(false)
    }
    load()
  }, [code])

  const generateOptions = useCallback(
    async (correctItem: WordItem) => {
      const others = allItems
        .filter((i) => i.answer !== correctItem.answer && i.question !== correctItem.question)
        .map((i) => i.answer)
      const shuffledOthers = shuffleArray(others)
      const distractors: string[] = []

      for (let i = 0; i < 3; i++) {
        if (shuffledOthers[i]) distractors.push(shuffledOthers[i])
      }

      if (distractors.length < 3) {
        try {
          const res = await fetch('/api/ai/generate-distractors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              correctWord: correctItem.answer,
              targetLanguageKey: topic?.voice ?? 'en',
              numDistractors: 3 - distractors.length,
              excludedWords: [correctItem.answer, ...distractors],
            }),
          })
          const data = await res.json()
          if (data.success && data.distractors) {
            distractors.push(...data.distractors.slice(0, 3 - distractors.length))
          }
        } catch {
          // fallback: generate placeholder distractors
          while (distractors.length < 3) {
            distractors.push('???')
          }
        }
      }

      const opts = [
        { text: correctItem.answer, correct: true },
        ...distractors.map((d) => ({ text: d, correct: false })),
      ]
      setOptions(shuffleArray(opts))
    },
    [allItems, topic]
  )

  useEffect(() => {
    if (quizItems.length > 0 && currentIndex < quizItems.length) {
      generateOptions(quizItems[currentIndex])
    }
  }, [quizItems, currentIndex, generateOptions])

  const handleSelect = (idx: number) => {
    if (showFeedback) return
    setSelectedOption(idx)
    setShowFeedback(true)
    if (options[idx].correct) {
      setScore((s) => s + 1)
      playCorrectSound()
    } else {
      playIncorrectSound()
    }
  }

  const handleNext = async () => {
    if (selectedOption === null) return
    const item = quizItems[currentIndex]
    const correct = options[selectedOption].correct

    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topiccode: code,
        question: item.question,
        correct,
      }),
    })

    if (currentIndex + 1 >= quizItems.length) {
      playCompletionSound()
      const res = await fetch('/api/progress/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'multiple-choice',
          totalQuestions: quizItems.length,
          score,
          isPerfectSession: score === quizItems.length,
        }),
      })
      const xpData = await res.json()
      if (xpData.leveledUp) setLeveledUp(true)
      setDone(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setSelectedOption(null)
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
          <h2 className="text-2xl font-bold text-white mb-2">Practice Complete!</h2>
          <p className="text-slate-400 text-sm mb-2">
            {topic?.topictitle ?? code}
          </p>
          <div className="space-y-2 my-6">
            <p className="text-slate-400 text-sm">
              Score: <span className="text-blue-400 font-bold">{score}</span> / {quizItems.length}
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
            <button onClick={() => { setCurrentIndex(0); setScore(0); setDone(false); setSelectedOption(null); setShowFeedback(false); setQuizItems(shuffleArray(quizItems)) }}
              className="btn-primary px-5 py-2 text-sm">
              Play Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (quizItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <EmptyState
          mood="happy"
          title="All mastered!"
          description="You have mastered all phrases in this topic."
          actionLabel="Pick another topic"
          onAction={() => router.push('/sets')}
        />
      </div>
    )
  }

  const currentItem = quizItems[currentIndex]
  const progressPct = Math.round(((currentIndex + 1) / quizItems.length) * 100)

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-3 sm:px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <h2 className="text-sm sm:text-lg font-semibold text-white text-center">{topic?.topictitle ?? code}</h2>
          <p className="text-[10px] sm:text-xs text-slate-500 text-center">
            Multiple Choice &mdash; {currentIndex + 1} of {quizItems.length}
          </p>
          <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="flex justify-end mb-2">
          <button onClick={() => setShowHelp(!showHelp)} className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
            <HelpCircle className="w-3 h-3" />
            {showHelp ? 'Hide help' : 'How this works'}
          </button>
        </div>

        {showHelp && (
          <div className="glass rounded-xl p-3 mb-4 border border-blue-500/10 text-xs text-slate-400 animate-slide-up">
            <strong className="text-white">Multiple Choice</strong> tests recognition. You&apos;re shown a word and must pick the correct translation from four options. This is easier than typing — good for warming up or quick review sessions.
          </div>
        )}

        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-white/10 mb-6">
          <p className="text-[10px] sm:text-xs text-slate-500 mb-2 sm:mb-3 text-center">Translate this word:</p>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-6 sm:mb-8">
            &ldquo;{currentItem.question}&rdquo;
          </h3>

          <div className="space-y-2 sm:space-y-2.5">
            {options.map((opt, idx) => {
              let btnClass = 'w-full text-left px-3 sm:px-4 py-3 sm:py-3 rounded-xl border transition-all text-sm font-medium min-h-[48px] flex items-center'
              if (!showFeedback) {
                btnClass += ' glass glass-hover border-white/5 text-slate-200 hover:text-white hover:border-blue-500/50 cursor-pointer active:scale-[0.98]'
              } else if (opt.correct) {
                btnClass += ' bg-green-500/10 border-green-500/40 text-green-300'
              } else if (idx === selectedOption) {
                btnClass += ' bg-red-500/10 border-red-500/40 text-red-300'
              } else {
                btnClass += ' glass border-white/5 text-slate-600 opacity-50'
              }
              return (
                <button key={idx} onClick={() => handleSelect(idx)} className={btnClass} disabled={showFeedback}>
                  <span className="text-slate-600 mr-2 sm:mr-3 shrink-0">{String.fromCharCode(65 + idx)}.</span>
                  <span className="text-sm sm:text-base leading-tight">{opt.text}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-slate-400">
            Score: <span className="text-blue-400 font-bold">{score}</span>
          </span>
          {showFeedback && (
            <button onClick={handleNext} className="btn-primary px-4 sm:px-5 py-2 text-xs sm:text-sm">
              {currentIndex + 1 >= quizItems.length ? 'Finish' : 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
