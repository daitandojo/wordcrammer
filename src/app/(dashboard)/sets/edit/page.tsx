'use client'

import { useEffect, useState } from 'react'

type Topic = {
  topiccode: string
  topictitle: string
  setimage: string | null
  voice: string | null
  description: string | null
  itemcount: number
}

export default function EditSetsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [topiccode, setTopicCode] = useState('')
  const [topictitle, setTopicTitle] = useState('')
  const [description, setDescription] = useState('')
  const [voice, setVoice] = useState('')
  const [setimage, setSetImage] = useState('')
  const [setdata, setSetData] = useState('')
  const [saveEnabled, setSaveEnabled] = useState(false)

  useEffect(() => {
    fetch('/api/topics')
      .then((r) => r.json())
      .then((data) => {
        setTopics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const valid =
      topiccode.length === 6 &&
      topictitle.length >= 10 &&
      description.length >= 10 &&
      setimage.startsWith('http') &&
      voice.length >= 3 &&
      setdata.includes('|')
    setSaveEnabled(valid)
  }, [topiccode, topictitle, description, voice, setimage, setdata])

  const handleLoad = async (code: string) => {
    setLoading(true)
    const res = await fetch(`/api/topics/${code}`)
    if (res.ok) {
      const data = await res.json()
      setTopicCode(data.topic.topiccode)
      setTopicTitle(data.topic.topictitle ?? '')
      setDescription(data.topic.description ?? '')
      setVoice(data.topic.voice ?? '')
      setSetImage(data.topic.setimage ?? '')
      const contentStr = data.content
        .map((c: { question: string; answer: string }) => `${c.question}|${c.answer}`)
        .join('\n')
      setSetData(contentStr)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!saveEnabled) return
    setSaving(true)
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topiccode, topictitle, description, setimage, voice, setdata }),
      })
      if (res.ok) {
        const refreshed = await fetch('/api/topics').then((r) => r.json())
        setTopics(refreshed)
      }
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!topiccode) return
    const res = await fetch(`/api/topics/${topiccode}`, { method: 'DELETE' })
    if (res.ok) {
      setTopicCode('')
      setTopicTitle('')
      setDescription('')
      setVoice('')
      setSetImage('')
      setSetData('')
      const refreshed = await fetch('/api/topics').then((r) => r.json())
      setTopics(refreshed)
    }
  }

  const handleClone = async () => {
    if (!topiccode) return
    const cloneCode = topiccode + 'C'
    try {
      const res = await fetch(`/api/topics/${topiccode}`)
      if (!res.ok) return
      const data = await res.json()
      const items = data.content.map((c: { question: string; answer: string }) => `${c.question}|${c.answer}`).join('\n')
      await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topiccode: cloneCode,
          topictitle: (data.topic.topictitle ?? 'Cloned Set').slice(0, 30),
          description: `Clone of ${topiccode}`,
          setimage: data.topic.setimage ?? '',
          voice: data.topic.voice ?? 'es-ES',
          setdata: items,
        }),
      })
      const refreshed = await fetch('/api/topics').then((r) => r.json())
      setTopics(refreshed)
      setTopicCode(cloneCode)
    } catch (e) { console.error('[Failed to clone set]', e) }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopicCode(e.target.value.toUpperCase().slice(0, 6))
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopicTitle(e.target.value.slice(0, 30))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white text-center mb-2">
        Edit or Create a Set
      </h1>
      <p className="text-slate-400 text-center mb-8 max-w-2xl mx-auto">
        A set can have unlimited items to cram. Just add a topic code, title, description, and upload your list!
      </p>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Existing Sets</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {topics.map((t) => (
              <button
                key={t.topiccode}
                onClick={() => handleLoad(t.topiccode)}
                className="w-full text-left glass rounded-xl p-3 border border-white/5 hover:bg-white/[0.08] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-mono text-sm">{t.topiccode}</span>
                  <span className="text-xs text-slate-600">({t.itemcount})</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{t.topictitle}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                {setimage && (
                  <img
                    src={setimage}
                    alt="Set preview"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Image URL</label>
                  <input type="text" value={setimage} onChange={(e) => setSetImage(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Set description"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleLoad(topiccode)} className="btn-secondary flex-1 py-2 text-sm">
                    Load
                  </button>
                  <button onClick={handleSave} disabled={!saveEnabled || saving}
                    className="btn-primary flex-1 py-2 text-sm">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={handleClone} disabled={!topiccode} className="btn-secondary flex-1 py-2 text-sm">
                    Clone
                  </button>
                  <button onClick={handleDelete} className="btn-danger flex-1 py-2 text-sm">
                    Delete
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Topic Code (6 chars)</label>
                    <input
                      type="text"
                      value={topiccode}
                      onChange={handleCodeChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                      placeholder="FRENCH1"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Title (max 30 chars)</label>
                    <input
                      type="text"
                      value={topictitle}
                      onChange={handleTitleChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Basic French Vocabulary"
                      maxLength={30}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Voice</label>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a voice...</option>
                    <option value="fr-FR">French (France)</option>
                    <option value="es-ES">Spanish (Spain)</option>
                    <option value="de-DE">German (Germany)</option>
                    <option value="it-IT">Italian (Italy)</option>
                    <option value="nl-NL">Dutch (Netherlands)</option>
                    <option value="pt-PT">Portuguese (Portugal)</option>
                    <option value="da-DK">Danish (Denmark)</option>
                    <option value="sv-SE">Swedish (Sweden)</option>
                    <option value="nb-NO">Norwegian (Norway)</option>
                    <option value="fi-FI">Finnish (Finland)</option>
                    <option value="pl-PL">Polish (Poland)</option>
                    <option value="hu-HU">Hungarian (Hungary)</option>
                    <option value="el-GR">Greek (Greece)</option>
                    <option value="ro-RO">Romanian (Romania)</option>
                    <option value="ar-SA">Arabic (Saudi Arabia)</option>
                    <option value="he-IL">Hebrew (Israel)</option>
                    <option value="ja-JP">Japanese (Japan)</option>
                    <option value="zh-CN">Chinese (China)</option>
                    <option value="id-ID">Indonesian (Indonesia)</option>
                    <option value="uk-UA">Ukrainian (Ukraine)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Set Data (one item per line: question|answer)
                  </label>
                  <textarea
                    value={setdata}
                    onChange={(e) => setSetData(e.target.value)}
                    rows={14}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      'the beer|la cerveza\nthe cyclist|le cycliste\nthe house|la maison\n\nUse | or * to separate question and answer'
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
