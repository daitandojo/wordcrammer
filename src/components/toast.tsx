'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Trophy, Flame } from 'lucide-react'

type ToastType = 'xp' | 'streak' | 'levelup' | 'error'

type Toast = {
  id: string
  type: ToastType
  message: string
}

const ToastContext = createContext<{ show: (type: ToastType, message: string) => void }>({
  show: () => {},
})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const icons = {
    xp: Sparkles,
    streak: Flame,
    levelup: Trophy,
    error: X,
  }

  const colors = {
    xp: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300',
    streak: 'border-orange-500/20 bg-orange-500/10 text-orange-300',
    levelup: 'border-purple-500/20 bg-purple-500/10 text-purple-300',
    error: 'border-red-500/20 bg-red-500/10 text-red-300',
  }

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-20 md:bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type]
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md ${colors[toast.type]} max-w-xs`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <p className="text-sm font-medium flex-1">{toast.message}</p>
                <button onClick={() => remove(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
