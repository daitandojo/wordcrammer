'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const onOffline = () => setOffline(true)
    const onOnline = () => setOffline(false)
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    setOffline(!navigator.onLine)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="fixed top-14 left-0 right-0 z-50 bg-yellow-600/90 backdrop-blur-sm text-white text-xs text-center py-2 px-4 flex items-center justify-center gap-2">
      <WifiOff className="w-3.5 h-3.5" />
      You're offline — progress will sync when reconnected
    </div>
  )
}
