'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2, Plus, BookOpen, Trash2, Edit3, Play, ArrowLeft, Upload } from 'lucide-react'
import ModuleEditor from '@/components/module-editor'

type ProjectSet = { id: number; name: string; language: string; createdBy: string | null; createdAt: string; moduleCount: number }
type Module = { topiccode: string; topictitle: string | null; itemcount: number; sortOrder: number | null }

const LANG_NAMES: Record<string, string> = { ES: 'Spanish', FR: 'French', IT: 'Italian', DE: 'German' }
const ADMIN_EMAIL = 'reconozco@gmail.com'

export default function CurriculumPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.email === ADMIN_EMAIL
  const username = session?.user?.name ?? ''

  const [tab, setTab] = useState<'standard' | 'mine'>('mine')
  const [projectSets, setProjectSets] = useState<ProjectSet[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPs, setSelectedPs] = useState<ProjectSet | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [modulesLoading, setModulesLoading] = useState(false)
  const [editingModule, setEditingModule] = useState<{ code: string; title: string } | null>(null)
  const [contentItems, setContentItems] = useState<Array<{ id?: number; question: string; answer: string }>>([])
  const [showNewPs, setShowNewPs] = useState(false)
  const [newPsName, setNewPsName] = useState('')
  const [newPsLang, setNewPsLang] = useState('ES')

  const loadProjectSets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/projectsets')
      const data = await res.json()
      setProjectSets(data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { loadProjectSets() }, [loadProjectSets])

  const loadModules = useCallback(async (psId: number) => {
    setModulesLoading(true)
    try {
      const res = await fetch(`/api/projectsets/${psId}`)
      const data = await res.json()
      setModules(data.modules ?? [])
    } catch {}
    setModulesLoading(false)
  }, [])

  const handleSelectPs = async (ps: ProjectSet) => {
    setSelectedPs(ps)
    setEditingModule(null)
    await loadModules(ps.id)
  }

  const handleCreatePs = async () => {
    if (!newPsName.trim()) return
    try {
      await fetch('/api/projectsets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPsName.trim(), language: newPsLang }),
      })
      setShowNewPs(false)
      setNewPsName('')
      await loadProjectSets()
    } catch {}
  }

  const handleDeletePs = async (ps: ProjectSet) => {
    if (!confirm(`Delete "${ps.name}" and all its modules?`)) return
    try {
      await fetch(`/api/projectsets/${ps.id}`, { method: 'DELETE' })
      if (selectedPs?.id === ps.id) { setSelectedPs(null); setModules([]) }
      await loadProjectSets()
    } catch {}
  }

  const handleDeleteModule = async (code: string) => {
    if (!confirm('Delete this module?')) return
    try {
      await fetch(`/api/topics/${code}`, { method: 'DELETE' })
      if (selectedPs) await loadModules(selectedPs.id)
    } catch {}
  }

  const handleEditModule = async (code: string, title: string) => {
    setEditingModule({ code, title })
    try {
      const res = await fetch(`/api/topics/${code}`)
      const data = await res.json()
      const mapped = (data.content ?? []).map((c: { id: number; question: string; answer: string }) => ({
        id: c.id, question: c.question ?? '', answer: c.answer ?? '',
      }))
      setContentItems(mapped)
    } catch {}
  }

  const handleSaveModule = async (items: Array<{ id?: number; question: string; answer: string }>) => {
    if (!editingModule) return
    await fetch(`/api/topics/${editingModule.code}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bulk-content', items: items.map(({ question, answer }) => ({ question, answer })) }),
    })
  }

  const handleAddModule = async () => {
    if (!selectedPs) return
    const prefix = selectedPs.language
    const lastNum = modules.reduce((max, m) => {
      const num = parseInt(m.topiccode.slice(2), 10)
      return num > max ? num : max
    }, 0)
    const newCode = prefix + String(lastNum + 1).padStart(3, '0')
    try {
      await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topiccode: newCode,
          topictitle: `Module ${lastNum + 1}`,
          description: '',
          setimage: '',
          voice: prefix === 'ES' ? 'es-ES' : prefix === 'FR' ? 'fr-FR' : prefix === 'IT' ? 'it-IT' : 'de-DE',
          sortOrder: lastNum + 1,
          projectSetId: selectedPs.id,
        }),
      })
      await loadModules(selectedPs.id)
    } catch {}
  }

  const handleStartCram = (code: string, title: string) => {
    router.push(`/cram?topic=${code}&title=${encodeURIComponent(title)}`)
  }

  const filteredSets = projectSets.filter((ps) => {
    if (tab === 'standard') return !ps.createdBy
    return ps.createdBy === username
  })

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Loader2 style={{ width: 20, height: 20, color: 'rgba(148,163,184,0.2)', animation: 'spin 1s linear infinite' }} /></div>
  }

  if (editingModule) {
    return (
      <div style={{ minHeight: '100%', padding: '32px', maxWidth: '860px', margin: '0 auto' }}>
        <ModuleEditor
          items={contentItems}
          onSave={handleSaveModule}
          onBack={() => { setEditingModule(null); if (selectedPs) loadModules(selectedPs.id) }}
        />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100%', padding: 'clamp(32px, 5vw, 64px)', maxWidth: '920px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          {selectedPs ? (
            <button onClick={() => { setSelectedPs(null); setModules([]) }} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', background: 'transparent', border: 'none', color: 'rgba(148,163,184,0.3)', fontSize: '11px', cursor: 'pointer', marginBottom: '8px' }}>
              <ArrowLeft style={{ width: '12px', height: '12px' }} />
              Back to sets
            </button>
          ) : null}
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            {selectedPs ? selectedPs.name : 'Curriculum'}
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(148,163,184,0.35)' }}>
            {selectedPs
              ? `${modules.length} modules`
              : tab === 'standard' ? 'System-provided language curricula' : 'Your custom vocabulary sets'
            }
          </p>
        </div>
        {!selectedPs && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowNewPs(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.06)', color: 'rgba(96,165,250,0.8)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Plus style={{ width: '14px', height: '14px' }} /> New Set
            </button>
            <button onClick={() => router.push('/generate-set')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(250,204,21,0.1)', background: 'rgba(250,204,21,0.04)', color: 'rgba(250,204,21,0.5)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
              <Upload style={{ width: '14px', height: '14px' }} /> Import
            </button>
          </div>
        )}
      </div>

      {/* New Project Set form */}
      {showNewPs && (
        <div style={{ marginBottom: '24px', padding: '20px', borderRadius: '16px', background: 'rgba(59,130,246,0.03)', border: '1px solid rgba(59,130,246,0.08)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '10px', color: 'rgba(148,163,184,0.3)', marginBottom: '6px', letterSpacing: '0.05em' }}>SET NAME</label>
              <input value={newPsName} onChange={(e) => setNewPsName(e.target.value)} placeholder="e.g. My Spanish Verbs" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', color: 'white', fontSize: '13px', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: 'rgba(148,163,184,0.3)', marginBottom: '6px', letterSpacing: '0.05em' }}>LANGUAGE</label>
              <select value={newPsLang} onChange={(e) => setNewPsLang(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontSize: '13px', outline: 'none' }}>
                <option value="ES">Spanish</option>
                <option value="FR">French</option>
                <option value="IT">Italian</option>
                <option value="DE">German</option>
              </select>
            </div>
            <button onClick={handleCreatePs} disabled={!newPsName.trim()} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'rgba(59,130,246,0.15)', color: 'rgba(96,165,250,0.8)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Create</button>
            <button onClick={() => setShowNewPs(false)} style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: 'transparent', color: 'rgba(148,163,184,0.3)', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px' }}>
        {isAdmin && (
          <button onClick={() => setTab('standard')} style={{
            padding: '8px 20px', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: tab === 'standard' ? 600 : 400,
            background: tab === 'standard' ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: tab === 'standard' ? 'rgba(255,255,255,0.8)' : 'rgba(148,163,184,0.35)',
            transition: 'all 0.15s ease',
          }}>Standard</button>
        )}
        <button onClick={() => setTab('mine')} style={{
          padding: '8px 20px', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: tab === 'mine' ? 600 : 400,
          background: tab === 'mine' ? 'rgba(255,255,255,0.06)' : 'transparent',
          color: tab === 'mine' ? 'rgba(255,255,255,0.8)' : 'rgba(148,163,184,0.35)',
          transition: 'all 0.15s ease',
        }}>My Sets</button>
      </div>

      {/* Project Sets list */}
      {!selectedPs ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filteredSets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <BookOpen style={{ width: '40px', height: '40px', color: 'rgba(148,163,184,0.08)', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '15px', color: 'rgba(148,163,184,0.3)', marginBottom: '8px' }}>No sets yet</p>
              <p style={{ fontSize: '12px', color: 'rgba(148,163,184,0.2)', marginBottom: '20px' }}>Create your first custom set to get started.</p>
              <button onClick={() => setShowNewPs(true)} style={{ padding: '10px 24px', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.06)', color: 'rgba(96,165,250,0.8)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                + Create Set
              </button>
            </div>
          ) : (
            filteredSets.map((ps) => (
              <div key={ps.id} onClick={() => handleSelectPs(ps)} style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.15s ease',
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                  {ps.language === 'ES' ? '🇪🇸' : ps.language === 'FR' ? '🇫🇷' : ps.language === 'IT' ? '🇮🇹' : '🇩🇪'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.8)', marginBottom: '2px' }}>{ps.name}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(148,163,184,0.3)' }}>{ps.moduleCount} modules</p>
                </div>
                {!ps.createdBy && !tab.includes('mine') && (
                  <span style={{ fontSize: '10px', color: 'rgba(148,163,184,0.2)', padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)' }}>SYSTEM</span>
                )}
                {ps.createdBy === username && (
                  <button onClick={(e) => { e.stopPropagation(); handleDeletePs(ps) }} style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: 'none', color: 'rgba(239,68,68,0.3)', cursor: 'pointer' }}>
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Modules within selected Project Set */
        <div>
          {/* Add module button */}
          <div style={{ marginBottom: '16px' }}>
            <button onClick={handleAddModule} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.06)', color: 'rgba(96,165,250,0.7)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
              <Plus style={{ width: '14px', height: '14px' }} /> Add Module
            </button>
          </div>

          {modulesLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 style={{ width: 20, height: 20, color: 'rgba(148,163,184,0.2)', margin: '0 auto' }} /></div>
          ) : modules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(148,163,184,0.25)' }}>No modules yet. Add one to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {modules.map((m) => (
                <div key={m.topiccode} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(148,163,184,0.25)', width: '48px', flexShrink: 0 }}>{m.topiccode}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '2px' }}>{m.topictitle ?? 'Untitled'}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(148,163,184,0.25)' }}>{m.itemcount} words</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => handleEditModule(m.topiccode, m.topictitle ?? '')} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)', color: 'rgba(148,163,184,0.4)', fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}>
                      <Edit3 style={{ width: '11px', height: '11px' }} /> Edit
                    </button>
                    <button onClick={() => handleStartCram(m.topiccode, m.topictitle ?? '')} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '7px 14px', borderRadius: '8px', border: 'none', background: 'rgba(31,200,90,0.08)', color: 'rgba(74,222,128,0.7)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                      <Play style={{ width: '11px', height: '11px' }} /> Study
                    </button>
                    {(tab === 'mine' || isAdmin) && (
                      <button onClick={() => handleDeleteModule(m.topiccode)} style={{ padding: '7px', borderRadius: '8px', background: 'transparent', border: 'none', color: 'rgba(239,68,68,0.3)', cursor: 'pointer' }}>
                        <Trash2 style={{ width: '12px', height: '12px' }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
