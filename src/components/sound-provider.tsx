'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'

type SoundContextType = { soundOn: boolean }
const SoundContext = createContext<SoundContextType>({ soundOn: true })
export function useSound() { return useContext(SoundContext) }

export function SoundProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const resume = () => {
      const ctx = (window as unknown as Record<string, unknown>).__audioCtx as AudioContext | undefined
      if (ctx && ctx.state === 'suspended') ctx.resume()
      document.removeEventListener('click', resume)
      document.removeEventListener('touchstart', resume)
    }
    document.addEventListener('click', resume)
    document.addEventListener('touchstart', resume)
    return () => {
      document.removeEventListener('click', resume)
      document.removeEventListener('touchstart', resume)
    }
  }, [])
  return <SoundContext.Provider value={{ soundOn: true }}>{children}</SoundContext.Provider>
}
