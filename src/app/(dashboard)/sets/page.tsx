'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, ChevronRight, Loader2, Globe } from 'lucide-react'
import { useCramStore } from '@/store/cram-store'

type Topic = {
  topiccode: string
  topictitle: string
  itemcount: number
}

const LANGUAGE_GROUPS = [
  { code: 'ES', label: 'Spanish', flag: '🇪🇸', color: '#ef4444' },
  { code: 'FR', label: 'French', flag: '🇫🇷', color: '#3b82f6' },
  { code: 'IT', label: 'Italian', flag: '🇮🇹', color: '#22c55e' },
  { code: 'DE', label: 'German', flag: '🇩🇪', color: '#eab308' },
]

export default function SetsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLang, setActiveLang] = useState('ES')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [startingTopic, setStartingTopic] = useState<string | null>(null)
  const { setSet } = useCramStore()

  useEffect(() => {
    fetch('/api/topics')
      .then((r) => r.json())
      .then((data) => {
        setTopics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleStart = async (topiccode: string) => {
    if (!session?.user) {
      router.push('/login')
      return
    }
    setStartingTopic(topiccode)
    setCountdown(5)
  }

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      startCram()
      return
    }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const startCram = async () => {
    if (!startingTopic) return
    setCountdown(null)
    setStartingTopic(null)

    const res = await fetch(`/api/progress?action=generateset&topiccode=${startingTopic}&size=40`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      if (data.allDone) {
        return
      }
      const topic = topics.find((t) => t.topiccode === startingTopic)
      setSet(data.items, { topiccode: startingTopic, topictitle: topic?.topictitle ?? '', voice: '', itemcount: topic?.itemcount ?? 0 })
      router.push('/cram')
    }
  }

  const langTopics = topics.filter((t) => t.topiccode.startsWith(activeLang))

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'rgba(148,163,184,0.3)' }} />
      </div>
    )
  }

  return (
    <div style={{ padding: '48px 40px', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(5,10,20,0.92)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: 'center' }}
            >
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: '96px',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  color: 'white',
                  lineHeight: 1,
                  marginBottom: '16px',
                }}
              >
                {countdown === 0 ? 'GO' : countdown}
              </motion.div>
              <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {countdown === 0 ? 'Starting...' : 'Starting in'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'white',
            marginBottom: '8px',
            letterSpacing: '-0.01em',
          }}
        >
          Choose a language
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.45)' }}>
          Pick up where you left off, or start a new set from scratch
        </p>
      </div>

      {/* Language tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {LANGUAGE_GROUPS.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setActiveLang(lang.code)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              border: activeLang === lang.code
                ? `1px solid ${lang.color}40`
                : '1px solid rgba(255,255,255,0.06)',
              background: activeLang === lang.code
                ? `${lang.color}10`
                : 'rgba(255,255,255,0.02)',
              color: activeLang === lang.code ? lang.color : 'rgba(148,163,184,0.4)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Globe style={{ width: '14px', height: '14px' }} />
            {lang.label}
          </button>
        ))}
      </div>

      {/* Sets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLang}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {langTopics.map((topic, i) => (
              <motion.div
                key={topic.topiccode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <SetRow
                  topic={topic}
                  onStart={handleStart}
                  isStarting={startingTopic === topic.topiccode}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function SetRow({
  topic,
  onStart,
  isStarting,
}: {
  topic: Topic
  onStart: (topiccode: string) => void
  isStarting: boolean
}) {
  const group = LANGUAGE_GROUPS.find((g) => topic.topiccode.startsWith(g.code))
  const setNum = parseInt(topic.topiccode.slice(-3), 10)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
        marginBottom: '6px',
        transition: 'all 0.15s ease',
        gap: '16px',
      }}
    >
      {/* Set number badge */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 700,
          flexShrink: 0,
          background: group ? `${group.color}12` : 'rgba(255,255,255,0.04)',
          color: group ? group.color : 'rgba(148,163,184,0.5)',
          border: `1px solid ${group ? group.color + '20' : 'rgba(255,255,255,0.06)'}`,
        }}
      >
        {setNum}
      </div>

      {/* Title & description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'white', marginBottom: '2px' }}>
          {topic.topictitle}
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(148,163,184,0.35)' }}>
          {topic.itemcount} words
        </p>
      </div>

      {/* Start button */}
      <button
        onClick={() => onStart(topic.topiccode)}
        disabled={isStarting}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 18px',
          borderRadius: '12px',
          border: 'none',
          cursor: isStarting ? 'default' : 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          background: 'rgba(31,200,90,0.08)',
          color: 'rgba(74,222,128,0.8)',
          transition: 'all 0.15s ease',
          flexShrink: 0,
        }}
      >
        {isStarting ? (
          <Loader2 style={{ width: '14px', height: '14px' }} className="animate-spin" />
        ) : (
          <Play style={{ width: '14px', height: '14px' }} />
        )}
        Start
      </button>
    </div>
  )
}
