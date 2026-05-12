'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, X, Search } from 'lucide-react'
import { accentGrouped } from '@/lib/accent-chars'

type AccentDrawerProps = {
  onInsert: (char: string) => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export default function AccentDrawer({ onInsert, inputRef }: AccentDrawerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const insertAndClose = (char: string) => {
    onInsert(char)
    inputRef?.current?.focus()
    setOpen(false)
  }

  const filtered = search
    ? accentGrouped
        .map((g) => ({
          ...g,
          chars: g.chars.filter(
            ([code, char]) =>
              char.toLowerCase().includes(search.toLowerCase()) ||
              code.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((g) => g.chars.length > 0)
    : accentGrouped

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

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 glass rounded-t-2xl border-t border-white/10 max-h-[60vh] flex flex-col"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-blue-400" />
                  Accent Characters
                </h3>
                <button onClick={() => setOpen(false)} className="p-1 text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="px-5 pt-3 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search characters..."
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Character grid — scrollable */}
              <div className="flex-1 overflow-y-auto px-5 pb-5">
                {filtered.map((group) => (
                  <div key={group.label} className="mb-4">
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-2">
                      {group.label}
                    </h4>
                    <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
                      {group.chars.map(([code, char]) => (
                        <button
                          key={code}
                          onClick={() => insertAndClose(char)}
                          className="flex flex-col items-center py-2 px-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all active:scale-95"
                        >
                          <span className="text-white text-lg font-medium">{char}</span>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5">{code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">No characters found</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
