'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, X } from 'lucide-react'

const publicVapidKey = 'BMrkFdQpAbYqKPXt7JTqG6eFNXiCJq3GRD2As2F1J4sWxVTqHdYBJCXFnKpPq7TqVq3YqXpAbKqPXt7JTqG6eFNX'

export default function PushPrompt() {
  const [show, setShow] = useState(false)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    // Show after 3rd set completion milestone
    const prompted = sessionStorage.getItem('wc_push_prompted')
    if (!prompted && 'Notification' in window && Notification.permission === 'default') {
      setShow(true)
    }
    if (Notification.permission === 'denied') setDenied(true)
  }, [])

  const handleSubscribe = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setDenied(true); return }

      const sw = await navigator.serviceWorker.ready
      const sub = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })

      setShow(false)
      sessionStorage.setItem('wc_push_prompted', '1')
    } catch {}
  }

  const handleDismiss = () => {
    setShow(false)
    sessionStorage.setItem('wc_push_prompted', '1')
  }

  if (!show || denied) return null

  return (
    <div className="glass rounded-xl p-4 border border-white/10 shadow-2xl mb-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-white">Never lose your streak</p>
          <p className="text-xs text-slate-400">Get a daily reminder to practice. You can change this anytime in Settings.</p>
        </div>
        <button onClick={handleDismiss} className="p-1 text-slate-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={handleDismiss} className="btn-secondary flex-1 py-1.5 text-xs">Not now</button>
        <button onClick={handleSubscribe} className="btn-primary flex-1 py-1.5 text-xs">Enable reminders</button>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}
