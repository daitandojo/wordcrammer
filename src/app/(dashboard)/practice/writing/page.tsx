'use client'

import { useState } from 'react'
import { Loader2, Sparkles, Wand2 } from 'lucide-react'

export default function GuidedWritingPage() {
  const [userText, setUserText] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('en')
  const [targetLanguage, setTargetLanguage] = useState('es')
  const [suggestedVocab, setSuggestedVocab] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    correctedText: string
    vocabularySuggestions: Array<{ word: string; translation: string; reason: string }>
    feedbackSummary: string
  } | null>(null)
  const [error, setError] = useState('')

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'da', name: 'Danish' },
    { code: 'sv', name: 'Swedish' },
    { code: 'nb', name: 'Norwegian' },
    { code: 'fi', name: 'Finnish' },
    { code: 'pl', name: 'Polish' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'el', name: 'Greek' },
    { code: 'ro', name: 'Romanian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'he', name: 'Hebrew' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'id', name: 'Indonesian' },
    { code: 'uk', name: 'Ukrainian' },
  ]

  const handleSubmit = async () => {
    if (!userText.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/ai/writing-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userText: userText.trim(),
          targetLanguageKey: targetLanguage,
          sourceLanguageKey: sourceLanguage,
          suggestedVocabulary: suggestedVocab
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.suggestions)
      } else {
        setError(data.error || 'AI writing analysis failed')
      }
    } catch {
      setError('Failed to connect. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Guided Writing</h1>
        <p className="text-slate-400 text-center mb-8">
          Write in your target language and get AI-powered corrections and suggestions.
        </p>

        <div className="glass rounded-2xl p-6 border border-white/10 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">I write in</label>
              <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                {languages.map((l) => (<option key={l.code} value={l.code}>{l.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">My native language</label>
              <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                {languages.map((l) => (<option key={l.code} value={l.code}>{l.name}</option>))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Your text <span className="text-slate-600">(in your target language)</span>
            </label>
            <textarea value={userText} onChange={(e) => setUserText(e.target.value)} rows={6}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="Write a paragraph, a few sentences, or even just one sentence..." />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Vocabulary to practice <span className="text-slate-600">(optional, comma-separated)</span>
            </label>
            <input type="text" value={suggestedVocab} onChange={(e) => setSuggestedVocab(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="e.g. restaurant, menu, waiter" />
          </div>

          <button onClick={handleSubmit} disabled={loading || !userText.trim()} className="btn-primary px-6 py-2.5">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Get Suggestions'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 animate-slide-up">
            <div className="glass rounded-2xl p-6 border border-green-500/20">
              <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">Corrected Text</h3>
              <p className="text-white leading-relaxed text-sm">{result.correctedText}</p>
            </div>

            {result.vocabularySuggestions.length > 0 && (
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">Vocabulary Suggestions</h3>
                <div className="space-y-3">
                  {result.vocabularySuggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-white text-sm font-medium">{s.word}</p>
                        <p className="text-slate-400 text-xs">{s.translation}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{s.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3">Feedback</h3>
              <p className="text-slate-300 leading-relaxed text-sm">{result.feedbackSummary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
