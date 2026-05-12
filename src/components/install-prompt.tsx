'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    ;(deferredPrompt as unknown as { prompt: () => Promise<void> }).prompt()
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-50 glass rounded-xl p-4 border border-white/10 shadow-2xl animate-slide-up max-w-sm mx-auto">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
          W
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">Install WordCrammer</p>
          <p className="text-xs text-slate-400">Add to your home screen for the best experience</p>
        </div>
        <button onClick={() => setShow(false)} className="p-1 text-slate-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <button onClick={handleInstall} className="btn-primary w-full justify-center mt-3 py-2 text-xs">
        <Download className="w-3.5 h-3.5" /> Install
      </button>
    </div>
  )
}
