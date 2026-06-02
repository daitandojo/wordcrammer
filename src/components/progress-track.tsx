'use client'

import { useState } from 'react'

type ProgressTrackProps = {
  items: Array<{ id: number; question: string; corrects: number; attempts: number }>
  currentQuestion?: string
  sessionAnswers?: Record<string, { correctCount: number; wrongCount: number }>
}

export default function ProgressTrack({ items, currentQuestion, sessionAnswers = {} }: ProgressTrackProps) {
  const totalCols = 8
  const rows = 5

  const ids = items.map((i) => i.id)
  console.log('[ProgressTrack]', items.length, 'items, first 5 ids:', ids.slice(0, 5), 'sessionAnswers keys:', Object.keys(sessionAnswers))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }} role="progressbar" aria-valuenow={items.length}>
      {Array.from({ length: rows }).map((_, rowIdx) => {
        return (
          <div key={rowIdx} style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {Array.from({ length: totalCols }).map((_, colIdx) => {
              const globalIdx = rowIdx * totalCols + colIdx
              const item = items[globalIdx]
              if (!item) return <div key={colIdx} style={{ width: '13px', height: '10px' }} />

              const sa = sessionAnswers[item.id]
              const isMastered = sa && sa.correctCount >= 2
              const isCorrect = sa?.correctCount === 1
              const isWrong = (sa?.wrongCount ?? 0) > 0
              const isActive = item.question === currentQuestion

              if (isMastered) {
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {colIdx > 0 && <div style={{ width: '3px', height: '1px', background: 'rgba(255,255,255,0.02)' }} />}
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.03)', background: 'transparent', flexShrink: 0 }} />
                  </div>
                )
              }

              let bg = 'rgba(255,255,255,0.04)'
              let border = '2px solid rgba(255,255,255,0.08)'
              let shadow = 'none'
              if (isCorrect) {
                bg = 'rgba(59,130,246,0.35)'
                border = '2px solid rgba(59,130,246,0.5)'
                shadow = '0 0 6px rgba(59,130,246,0.2)'
              } else if (isWrong) {
                bg = 'rgba(239,68,68,0.35)'
                border = '2px solid rgba(239,68,68,0.5)'
                shadow = '0 0 6px rgba(239,68,68,0.2)'
              }
              if (isActive) {
                shadow = '0 0 0 2px rgba(59,130,246,0.4), 0 0 8px rgba(59,130,246,0.2)'
              }

              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {colIdx > 0 && (
                    <div style={{
                      width: '3px',
                      height: '1px',
                      background: isCorrect ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
                    }} />
                  )}
                  <div
                    title={`${globalIdx + 1}: ${isCorrect ? '1 correct' : isWrong ? 'wrong' : 'new'} (id=${item.id})`}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: bg,
                      border,
                      boxShadow: shadow,
                      transition: 'all 0.3s ease',
                      cursor: 'default',
                      flexShrink: 0,
                      transform: isActive ? 'scale(1.25)' : 'scale(1)',
                    }}
                  />
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}