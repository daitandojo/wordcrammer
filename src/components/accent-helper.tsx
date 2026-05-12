'use client'

import { useState, useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'
import { accentGrouped } from '@/lib/accent-chars'

export default function AccentHelper() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all glass glass-hover text-slate-400 hover:text-white"
        title="Accent keyboard (Ctrl+K)"
      >
        <Keyboard className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Accents</span>
        <kbd className="hidden sm:inline text-[10px] text-slate-600 bg-slate-800 px-1 rounded">Ctrl+K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative glass rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-white/10 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-blue-400" />
                Accent Character Reference
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Type the shortcut to insert the character. For example, typing <code className="text-blue-400 bg-slate-800 px-1 rounded">/e</code> produces <code className="text-white">é</code>.
            </p>

            <div className="space-y-4">
              {accentGrouped.map((group) => (
                <div key={group.label}>
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-2">
                    {group.label}
                  </h4>
                  <div className="grid grid-cols-5 gap-1.5">
                    {group.chars.map(([code, char]) => (
                      <div
                        key={code}
                        className="bg-slate-800/50 rounded-lg px-2 py-1.5 text-center border border-white/5"
                      >
                        <span className="text-white text-sm font-medium">{char}</span>
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-600 mt-4 text-center">
              Press <kbd className="text-slate-400 bg-slate-800 px-1 rounded text-[10px]">Ctrl+K</kbd> to toggle this panel
            </p>
          </div>
        </div>
      )}

    </>
  )
}
