'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { replaceAccentChars } from '@/lib/accent-chars'

const DEMO_PHRASES = [
  { question: 'hello', answer: 'hola' },
  { question: 'thank you', answer: 'gracias' },
  { question: 'goodbye', answer: 'adiós' },
  { question: 'please', answer: 'por favor' },
  { question: 'yes', answer: 'sí' },
]

export default function DemoMode({ onComplete }: { onComplete: () => void }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [done, setDone] = useState(false)

  const phrase = DEMO_PHRASES[step]
  const isLast = step >= DEMO_PHRASES.length - 1

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = replaceAccentChars(e.target.value)
    setInput(val)
    if (val.trim().toLowerCase() === phrase.answer.toLowerCase()) {
      setFeedback('correct')
      setTimeout(() => {
        if (isLast) { setDone(true); return }
        setStep((s) => s + 1)
        setInput('')
        setFeedback(null)
      }, 600)
    }
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-8 max-w-md w-full text-center border border-white/10">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-white mb-2">You just crammed 5 phrases!</h2>
        <p className="text-sm text-slate-400 mb-6">Imagine what you can do with 1,200.</p>
        <button onClick={onComplete} className="btn-primary w-full justify-center py-2.5 text-sm">
          Sign up free — continue where you left off
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 sm:p-8 max-w-md w-full border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-slate-500">Demo · {step + 1} of {DEMO_PHRASES.length}</span>
        <div className="flex gap-1">
          {DEMO_PHRASES.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? 'bg-green-500' : 'bg-white/10'}`} />)}
        </div>
      </div>
      <div className="text-center mb-4">
        <p className="text-xs text-slate-500 mb-2">Type the translation:</p>
        <p className="text-2xl font-bold italic text-white">&ldquo;{phrase.question}&rdquo;</p>
      </div>
      <input
        type="text"
        value={input}
        onChange={handleInput}
        autoComplete="off"
        autoFocus
        className="w-full bg-transparent text-white text-center text-xl font-medium placeholder-slate-600 focus:outline-none border-b-2 border-white/10 focus:border-brand/50 pb-2 transition-colors"
        placeholder="Type here..."
      />
      {feedback === 'incorrect' && <p className="text-xs text-red-400 text-center mt-2">Not quite. Keep typing!</p>}
      <p className="text-xs text-slate-600 text-center mt-4">Type the answer — it checks as you type.</p>
    </motion.div>
  )
}
