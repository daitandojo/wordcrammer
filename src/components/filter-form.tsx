'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { useCramStore } from '@/store/cram-store'

const topicTags = [
  'greetings', 'numbers', 'food', 'family', 'time', 'directions',
  'shopping', 'weather', 'work', 'travel', 'health', 'home',
  'opinions', 'descriptions', 'requests',
]

const grammarTags = [
  'cardinal_number', 'ordinal_number', 'present_verb', 'past_verb',
  'future_verb', 'noun_phrase', 'adjective', 'adverb', 'preposition',
  'question_word', 'imperative', 'article_noun',
]

export default function FilterForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedGrammars, setSelectedGrammars] = useState<string[]>([])
  const [setFrom, setSetFrom] = useState(1)
  const [setTo, setSetTo] = useState(30)
  const [loading, setLoading] = useState(false)

  const toggleTag = (tag: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag])
  }

  const handleGenerate = async () => {
    if (!session?.user) { router.push('/login'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/progress/filtered-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: {
            topic_tags: selectedTopics.length > 0 ? selectedTopics : undefined,
            grammar_tags: selectedGrammars.length > 0 ? selectedGrammars : undefined,
            set_range: { from: setFrom, to: setTo },
          },
          size: 40,
        }),
      })
      const data = await res.json()
      if (data.allDone || data.items.length === 0) {
        alert('All items in this filter are mastered. Try a wider filter.')
        setLoading(false)
        return
      }
      useCramStore.getState().setSet(data.items, {
        topiccode: 'FILTER',
        topictitle: 'Filtered Practice',
        voice: 'es-ES',
        itemcount: data.items.length,
      })
      router.push('/cram')
    } catch {
      alert('Failed to generate set.')
      setLoading(false)
    }
  }

  const canGenerate = selectedTopics.length > 0 || selectedGrammars.length > 0 || setFrom !== 1 || setTo !== 30

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-slate-400 mb-2">Topic</p>
        <div className="flex flex-wrap gap-1.5">
          {topicTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag, selectedTopics, setSelectedTopics)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                selectedTopics.includes(tag)
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-white/5 text-slate-500 border border-white/5 hover:text-slate-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400 mb-2">Grammar</p>
        <div className="flex flex-wrap gap-1.5">
          {grammarTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag, selectedGrammars, setSelectedGrammars)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                selectedGrammars.includes(tag)
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-white/5 text-slate-500 border border-white/5 hover:text-slate-300'
              }`}
            >
              {tag.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-400 mb-1">Sets from</p>
          <select
            value={setFrom}
            onChange={(e) => setSetFrom(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n} className="bg-slate-800">
                SET{String(n).padStart(3, '0')}
              </option>
            ))}
          </select>
        </div>
        <span className="text-slate-600 mt-5">→</span>
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-400 mb-1">Sets to</p>
          <select
            value={setTo}
            onChange={(e) => setSetTo(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n} className="bg-slate-800">
                SET{String(n).padStart(3, '0')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !canGenerate}
        className="btn-primary w-full justify-center py-2 text-xs"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Generate Practice Set (40 cards)'}
      </button>
    </div>
  )
}
