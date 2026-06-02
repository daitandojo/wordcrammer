'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(0)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setSidebarWidth(detail.width)
    }
    window.addEventListener('sidebar-change', handler)
    return () => window.removeEventListener('sidebar-change', handler)
  }, [])

  return (
    <div
      className="flex-1 flex flex-col min-w-0 overflow-hidden"
      style={{ paddingLeft: sidebarWidth, transition: 'padding-left 0.22s cubic-bezier(0.22,1,0.36,1)' }}
    >
      <Navbar />
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
        {children}
      </main>
    </div>
  )
}