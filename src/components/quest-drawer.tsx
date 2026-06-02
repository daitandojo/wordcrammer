'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/toast'

type Quest = {
  id: string
  label: string
  icon: string
  done: boolean
  xp: number
}

export default function QuestDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    if (!open) return
    fetch('/api/progress/quests')
      .then((r) => r.json())
      .then((data) => {
        if (data.quests) setQuests(data.quests)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [open])

  const doneCount = quests.filter((q) => q.done).length
  const totalXP = quests.reduce((acc, q) => acc + (q.done ? q.xp : 0), 0)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(5,10,20,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '320px',
              zIndex: 60,
              background: 'rgba(8,14,28,0.98)',
              backdropFilter: 'blur(28px)',
              borderRight: '1px solid rgba(255,255,255,0.04)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 20px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'white', marginBottom: '2px' }}>
                  Daily Quests
                </h2>
                <p style={{ fontSize: '12px', color: 'rgba(148,163,184,0.35)' }}>
                  {doneCount}/{quests.length} complete
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(148,163,184,0.4)',
                }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* XP summary */}
            {quests.length > 0 && (
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(148,163,184,0.4)' }}>Available XP</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(234,179,8,0.8)' }}>
                    {totalXP} XP
                  </span>
                </div>
              </div>
            )}

            {/* Quests list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {loading ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'rgba(148,163,184,0.2)' }}>Loading...</p>
                </div>
              ) : quests.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: 'rgba(148,163,184,0.3)', marginBottom: '4px' }}>No quests today</p>
                  <p style={{ fontSize: '11px', color: 'rgba(148,163,184,0.2)' }}>Check back tomorrow</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {quests.map((q) => (
                    <div
                      key={q.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: q.done ? 'rgba(31,200,90,0.04)' : 'rgba(255,255,255,0.025)',
                        border: q.done
                          ? '1px solid rgba(31,200,90,0.1)'
                          : '1px solid rgba(255,255,255,0.04)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '18px', lineHeight: 1 }}>{q.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: q.done ? 'rgba(31,200,90,0.6)' : 'rgba(226,232,240,0.7)',
                            textDecoration: q.done ? 'line-through' : 'none',
                            marginBottom: '2px',
                          }}
                        >
                          {q.label}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span style={{ fontSize: '11px', color: 'rgba(234,179,8,0.6)' }}>{q.xp} XP</span>
                        {q.done && <CheckCircle2 style={{ width: 14, height: 14, color: 'rgba(31,200,90,0.5)' }} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
