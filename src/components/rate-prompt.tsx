'use client'

import { useState, useEffect } from 'react'
import { Star, X } from 'lucide-react'

export default function RatePrompt() {
  const [show, setShow] = useState(false)
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const lastPrompted = localStorage.getItem('wc_rate_prompted')
    if (lastPrompted) {
      const daysSince = (Date.now() - Number(lastPrompted)) / 86400000
      if (daysSince < 30) return // Only prompt once per 30 days
    }
    // Show after completing set 5 or 15
    const completedSets = Number(sessionStorage.getItem('wc_completed_sets') ?? '0')
    if (completedSets === 5 || completedSets === 15) {
      setShow(true)
    }
  }, [])

  const handleRate = async (stars: number) => {
    setRating(stars)
    if (stars >= 4) {
      // Redirect to app store / rating
      window.open('https://chromewebstore.google.com', '_blank')
      setSubmitted(true)
    } else if (stars >= 1) {
      // Show feedback textarea
      setSubmitted(true)
    }
    localStorage.setItem('wc_rate_prompted', String(Date.now()))
    setTimeout(() => setShow(false), 1500)
  }

  if (!show) return null

  return (
    <div className="glass rounded-xl p-4 border border-white/10 shadow-2xl mb-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {!submitted ? (
            <>
              <p className="text-sm font-medium text-white mb-1">Enjoying WordCrammer?</p>
              <p className="text-xs text-slate-400 mb-3">Tap a star to rate us:</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => handleRate(s)} className="p-1 hover:scale-110 transition-transform">
                    <Star className={`w-6 h-6 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-green-400">Thanks for your feedback! 🙏</p>
          )}
        </div>
        <button onClick={() => setShow(false)} className="p-1 text-slate-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
