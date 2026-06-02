'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, Sparkles, Globe, Target, Zap } from 'lucide-react'
import { useCramStore } from '@/store/cram-store'

const languages = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'nb', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
]

const goals = [
  { id: 'travel', label: 'Travel Prep', desc: 'Survival phrases for your next trip', icon: Globe },
  { id: 'exam', label: 'School / Exam', desc: 'Ace your language test', icon: Target },
  { id: 'work', label: 'Work', desc: 'Professional vocabulary for the workplace', icon: Briefcase },
  { id: 'fun', label: 'Just for Fun', desc: 'Learn at your own pace', icon: Sparkles },
]

function Briefcase() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect x="2" y="6" width="20" height="14" rx="2" />
    </svg>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [selectedLang, setSelectedLang] = useState('es')
  const [selectedGoal, setSelectedGoal] = useState('travel')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    // Save language preference
    try {
      await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLanguage: selectedLang, goal: selectedGoal }),
      })
    } catch (e) { console.error('[Failed to save language preference]', e) }
    // Try to start the first set
    try {
      const res = await fetch(`/api/progress?action=generateset&topiccode=SET001&size=40`)
      const data = await res.json()
      if (!data.allDone && data.items.length > 0) {
        useCramStore.getState().setSet(data.items, {
          topiccode: 'SET001',
          topictitle: 'Top 40 Most Useful Everyday Phrases',
          voice: `${selectedLang}-${selectedLang.toUpperCase()}`,
          itemcount: data.items.length,
        })
      }
    } catch (e) { console.error('[Failed to generate first set]', e) }
    router.push('/cram')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center px-4 sm:px-6 py-10 relative overflow-hidden bg-mesh">
      <div className="deco-blob deco-blob-1 animate-float" style={{ top: '10%', left: '-5%' }} />
      <div className="deco-blob deco-blob-2 animate-float-delayed" style={{ top: '60%', right: '-10%' }} />

      <div className="w-full max-w-lg flex-1 flex flex-col">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mt-6 mb-8">
          {[0, 1, 2].map((s) => (
            <div key={s} className={`h-1 rounded-full transition-all duration-300 ${s <= step ? 'w-8 bg-blue-500' : 'w-4 bg-white/10'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="lang"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center flex flex-col flex-1"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 mb-4 mt-8">
                <Globe className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">What language?</h1>
              <p className="text-sm text-slate-400 mb-6">Choose the language you want to learn</p>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-8 max-h-64 overflow-y-auto pb-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      selectedLang === lang.code
                        ? 'glass-blue border-blue-500/30 ring-1 ring-blue-500/30'
                        : 'glass border-white/5 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-[10px] text-slate-400">{lang.name}</span>
                  </button>
                ))}
              </div>

              <button onClick={() => setStep(1)} className="btn-primary px-8 py-2.5 text-sm">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center flex flex-col flex-1"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 mt-8">
                <Target className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">What&apos;s your goal?</h1>
              <p className="text-sm text-slate-400 mb-6">This helps us tailor your experience</p>

              <div className="space-y-3 mb-8">
                {goals.map((g) => {
                  const Icon = g.icon
                  const selected = selectedGoal === g.id
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGoal(g.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all ${
                        selected
                          ? 'glass-blue border-blue-500/30 ring-1 ring-blue-500/30'
                          : 'glass border-white/5 hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{g.label}</p>
                        <p className="text-xs text-slate-500">{g.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={() => setStep(0)} className="btn-secondary px-5 py-2.5 text-sm">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => setStep(2)} className="btn-primary px-8 py-2.5 text-sm">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center flex flex-col flex-1"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl mb-4 mt-8 shadow-lg">
                W
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">You&apos;re all set!</h1>
              <p className="text-sm text-slate-400 mb-6">Ready to start your first cram session</p>

              <div className="glass rounded-xl p-5 border border-white/10 mb-8 text-left">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-slate-300">Learning <strong className="text-white">{languages.find((l) => l.code === selectedLang)?.name}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Target className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="text-slate-300">Goal: <strong className="text-white">{goals.find((g) => g.id === selectedGoal)?.label}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span className="text-slate-300">Starting with <strong className="text-white">SET001</strong> — 40 essential phrases</span>
                  </div>
                </div>
              </div>

              <div className="glass rounded-xl p-3 mb-6 border border-yellow-500/10">
                <p className="text-xs text-slate-500">
                  ⏱️ <strong className="text-slate-200">~20 min</strong> per set · 10 sets (200 min) for basic fluency
                </p>
              </div>

              <button onClick={handleStart} disabled={loading} className="btn-primary px-8 py-3 text-base font-semibold w-full justify-center">
                {loading ? 'Starting...' : 'Start Your First Cram!'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="flex gap-3 justify-center mt-4">
                <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3" /> Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
