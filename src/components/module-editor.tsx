'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Save, Plus, Trash2, Upload } from 'lucide-react'

type WordPair = { id?: number; question: string; answer: string }

type Props = {
  items: WordPair[]
  onSave: (items: WordPair[]) => Promise<void>
  onBack?: () => void
}

export default function ModuleEditor({ items, onSave, onBack }: Props) {
  const [rows, setRows] = useState<WordPair[]>(items.length > 0 ? items : [{ question: '', answer: '' }])
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingCell, setEditingCell] = useState<{ row: number; col: 'question' | 'answer' } | null>(null)
  const [showPaste, setShowPaste] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (items.length > 0) setRows(items)
  }, [items])

  const updateCell = useCallback((idx: number, field: 'question' | 'answer', value: string) => {
    setRows((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
    setDirty(true)
  }, [])

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, { question: '', answer: '' }])
    setDirty(true)
  }, [])

  const removeRow = useCallback((idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx))
    setDirty(true)
  }, [])

  const handleSave = useCallback(async () => {
    const cleaned = rows.filter((r) => r.question.trim() && r.answer.trim())
    if (cleaned.length === 0) return
    setSaving(true)
    await onSave(cleaned)
    setDirty(false)
    setSaving(false)
  }, [rows, onSave])

  const handlePaste = useCallback(() => {
    const lines = pasteText.trim().split('\n').filter(Boolean)
    const parsed = lines.map((line) => {
      const sep = line.includes('|') ? '|' : '\t'
      const [q, a] = line.split(sep)
      return { question: (q ?? '').trim(), answer: (a ?? '').trim() }
    }).filter((p) => p.question && p.answer)
    if (parsed.length === 0) return
    setRows(parsed)
    setDirty(true)
    setShowPaste(false)
    setPasteText('')
  }, [pasteText])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onBack && (
            <button onClick={onBack} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: 'rgba(148,163,184,0.5)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
              ← Back
            </button>
          )}
          <button onClick={addRow} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.06)', color: 'rgba(96,165,250,0.7)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
            <Plus style={{ width: '12px', height: '12px' }} /> Add
          </button>
          <button onClick={() => setShowPaste(!showPaste)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(250,204,21,0.15)', background: 'rgba(250,204,21,0.06)', color: 'rgba(250,204,21,0.7)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
            <Upload style={{ width: '12px', height: '12px' }} /> Paste
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(148,163,184,0.3)' }}>{rows.filter(r => r.question && r.answer).length} word pairs</span>
          {dirty && (
            <button onClick={handleSave} disabled={saving} style={{
              display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 18px', borderRadius: '10px',
              border: 'none', background: 'rgba(31,200,90,0.12)', color: 'rgba(74,222,128,0.9)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}>
              <Save style={{ width: '12px', height: '12px' }} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Paste area */}
      {showPaste && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderRadius: '12px', background: 'rgba(250,204,21,0.03)', border: '1px solid rgba(250,204,21,0.08)' }}>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste word|translation pairs, one per line..."
            rows={6}
            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontFamily: 'monospace', resize: 'vertical', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handlePaste} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.15)', color: 'rgba(250,204,21,0.7)', fontSize: '12px', cursor: 'pointer' }}>Replace all</button>
            <button onClick={() => { setShowPaste(false); setPasteText('') }} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(148,163,184,0.3)', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Spreadsheet */}
      <div style={{ flex: 1, overflow: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <th style={{ width: '40px', padding: '10px 8px', color: 'rgba(148,163,184,0.3)', fontWeight: 500, fontSize: '11px', textAlign: 'center' }}>#</th>
              <th style={{ padding: '10px 8px', color: 'rgba(148,163,184,0.4)', fontWeight: 600, fontSize: '11px', textAlign: 'left', letterSpacing: '0.05em' }}>QUESTION</th>
              <th style={{ padding: '10px 8px', color: 'rgba(148,163,184,0.4)', fontWeight: 600, fontSize: '11px', textAlign: 'left', letterSpacing: '0.05em' }}>ANSWER</th>
              <th style={{ width: '40px', padding: '10px 8px' }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '6px 8px', color: 'rgba(148,163,184,0.2)', fontSize: '11px', textAlign: 'center', verticalAlign: 'top' }}>{idx + 1}</td>
                <td style={{ padding: '4px 8px', verticalAlign: 'top' }}>
                  <input
                    value={row.question}
                    onChange={(e) => updateCell(idx, 'question', e.target.value)}
                    style={{ width: '100%', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '13px', padding: '6px 4px', outline: 'none', fontFamily: 'inherit' }}
                    placeholder="English word..."
                  />
                </td>
                <td style={{ padding: '4px 8px', verticalAlign: 'top' }}>
                  <input
                    value={row.answer}
                    onChange={(e) => updateCell(idx, 'answer', e.target.value)}
                    style={{ width: '100%', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '13px', padding: '6px 4px', outline: 'none', fontFamily: 'inherit' }}
                    placeholder="Translation..."
                  />
                </td>
                <td style={{ padding: '4px 8px', textAlign: 'center', verticalAlign: 'top' }}>
                  <button onClick={() => removeRow(idx)} style={{ padding: '4px', background: 'transparent', border: 'none', color: 'rgba(239,68,68,0.3)', cursor: 'pointer' }}>
                    <Trash2 style={{ width: '12px', height: '12px' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
