'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Mic, Volume2, Loader2, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react'
import VoiceInput from '@/components/voice-input'

type Scenario = {
  id: string
  title: string
  icon: string
  description: string
  systemPrompt: string
  level: string
}

type Message = {
  role: 'ai' | 'user'
  text: string
  translation?: string
  pronunciationScore?: number
}

export default function ConversationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [aiThinking, setAiThinking] = useState(false)
  const [speakingMessage, setSpeakingMessage] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    fetch('/api/conversation/scenarios')
      .then((r) => r.json())
      .then((data) => {
        setScenarios(data.scenarios ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startScenario = async (scenario: Scenario) => {
    setSelectedScenario(scenario)
    setShowIntro(false)
    setMessages([])
    setAiThinking(true)

    // AI kicks off the conversation
    try {
      const res = await fetch('/api/ai/conversation-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: scenario.systemPrompt },
            { role: 'user', content: 'Hello! Start the conversation.' },
          ],
        }),
      })
      const data = await res.json()
      if (data.text) {
        setMessages([{ role: 'ai', text: data.text }])
        speakText(data.text)
      }
    } catch (e) { console.error('[Failed to start conversation]', e) }
    setAiThinking(false)
  }

  const speakText = async (text: string, lang = 'es-ES') => {
    try {
      const res = await fetch('/api/audio/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: lang }),
      })
      const data = await res.json()
      if (data.audio) {
        const blob = base64ToBlob(data.audio, 'audio/mpeg')
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.play()
      }
    } catch {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      window.speechSynthesis.speak(utterance)
    }
  }

  const base64ToBlob = (base64: string, type: string) => {
    const bytes = atob(base64)
    const arr = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
    return new Blob([arr], { type })
  }

  const handleVoiceResult = async (transcript: string) => {
    if (!selectedScenario) return

    const userMsg: Message = { role: 'user', text: transcript }
    setMessages((prev) => [...prev, userMsg])
    setAiThinking(true)

    try {
      const history = [
        { role: 'system' as const, content: selectedScenario.systemPrompt },
        ...messages.map((m) => ({
          role: (m.role === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user',
          content: m.text,
        })),
        { role: 'user' as const, content: transcript },
      ]

      const res = await fetch('/api/ai/conversation-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      const data = await res.json()
      const aiText = data.text ?? ''

      setMessages((prev) => [...prev, { role: 'ai', text: aiText }])
      speakText(aiText)
    } catch (e) { console.error('[Failed to send message]', e) }
    setAiThinking(false)
  }

  if (!session) {
    router.push('/login')
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-mesh">
      <div className="deco-blob deco-blob-1 animate-float" style={{ top: '10%', left: '-5%' }} />

      {showIntro ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-lg mx-auto pt-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl mb-4 shadow-lg">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Conversation Practice</h1>
              <p className="text-sm text-slate-400">Choose a scenario and start speaking</p>
            </div>

            <div className="space-y-3">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => startScenario(s)}
                  className="w-full glass rounded-xl p-4 border border-white/10 hover:bg-white/[0.06] transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{s.title}</p>
                      <p className="text-xs text-slate-500">{s.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{s.level}</span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="glass border-b border-white/10 px-4 py-3 flex items-center gap-3 shrink-0">
            <button onClick={() => setShowIntro(true)} className="p-1 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-slate-300">{selectedScenario?.icon}</span>
            <span className="text-sm font-medium text-white">{selectedScenario?.title}</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600/20 border border-blue-500/20 text-white'
                      : 'glass border border-white/10 text-slate-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  {(msg.pronunciationScore ?? 0) > 0 && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-yellow-400" />
                      <span className="text-[10px] text-yellow-400">Pronunciation: {msg.pronunciationScore}%</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {aiThinking && (
              <div className="flex justify-start">
                <div className="glass rounded-2xl px-4 py-3 border border-white/10">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="glass border-t border-white/10 px-4 py-3 shrink-0">
            <div className="max-w-lg mx-auto flex items-center gap-3">
              <VoiceInput
                language="es-ES"
                onResult={handleVoiceResult}
                disabled={aiThinking}
              />
              <div className="flex-1 text-xs text-slate-500 text-center">
                {aiThinking ? 'AI is thinking...' : 'Tap the mic and speak your answer'}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
