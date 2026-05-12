'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wand2, Loader2, Plus } from 'lucide-react'

export default function GenerateSetPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [numWords, setNumWords] = useState(40)
  const [sourceLang, setSourceLang] = useState('en')
  const [targetLang, setTargetLang] = useState('es')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Array<{
    originalWord: string
    translatedWord: string
    exampleSentenceOriginal: string
    exampleSentenceTranslated: string
  }> | null>(null)

  const languages = [
    { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' }, { code: 'nl', name: 'Dutch' },
    { code: 'pt', name: 'Portuguese' }, { code: 'da', name: 'Danish' },
    { code: 'sv', name: 'Swedish' }, { code: 'nb', name: 'Norwegian' },
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/ai/generate-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: prompt.trim(),
          numWords,
          sourceLanguageKey: sourceLang,
          targetLanguageKey: targetLang,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.words)
      } else {
        setError(data.error || 'Generation failed')
      }
    } catch {
      setError('Failed to connect to AI service')
    }
    setLoading(false)
  }

  const handleSaveAsSet = async () => {
    if (!result || result.length === 0) return
    const code = `GEN${Math.random().toString(36).slice(2, 5).toUpperCase()}`
    const setdata = result.map((w) => `${w.originalWord}|${w.translatedWord}`).join('\n')

    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topiccode: code,
          topictitle: prompt.trim().slice(0, 30),
          description: `AI-generated: ${prompt.trim().slice(0, 200)}`,
          setimage: 'https://placehold.co/200x80/1e293b/60a5fa?text=AI',
          voice: `${targetLang}-${targetLang.toUpperCase()}`,
          setdata,
        }),
      })
      if (res.ok) {
        router.push('/sets')
      } else {
        setError('Failed to save set')
      }
    } catch {
      setError('Failed to save set')
    }
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 mb-4">
            <Wand2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Generate a Set with AI</h1>
          <p className="text-sm text-slate-500">Describe what vocabulary you want, and the AI will create a custom set.</p>
        </div>

        <div className="glass rounded-2xl p-6 border border-white/10 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Source language</label>
              <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                {languages.map((l) => (<option key={l.code} value={l.code}>{l.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Target language</label>
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                {languages.map((l) => (<option key={l.code} value={l.code}>{l.name}</option>))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-1">Describe the vocabulary you want</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="e.g. 40 common cooking verbs in present tense"
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">Number of words</label>
              <input type="number" min={5} max={50} value={numWords}
                onChange={(e) => setNumWords(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <button onClick={handleGenerate} disabled={loading || !prompt.trim()}
              className="btn-primary mt-5 px-5 py-2 text-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-3 animate-slide-up">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{result.length} phrases generated</p>
              <button onClick={handleSaveAsSet} className="btn-primary px-4 py-1.5 text-xs">
                <Plus className="w-3 h-3" />
                Save as Set
              </button>
            </div>

            <div className="glass rounded-xl border border-white/10 overflow-hidden">
              <div className="max-h-[50vh] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-white/5 text-slate-500">
                    <tr>
                      <th className="px-4 py-2 text-left w-1/4">Source</th>
                      <th className="px-4 py-2 text-left w-1/4">Target</th>
                      <th className="px-4 py-2 text-left w-1/4">Example (source)</th>
                      <th className="px-4 py-2 text-left w-1/4">Example (target)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.map((w, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-2 text-white font-medium">{w.originalWord}</td>
                        <td className="px-4 py-2 text-slate-300">{w.translatedWord}</td>
                        <td className="px-4 py-2 text-slate-500">{w.exampleSentenceOriginal}</td>
                        <td className="px-4 py-2 text-slate-500">{w.exampleSentenceTranslated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
