'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Globe, Bell, Volume2, Trash2, Loader2, Star, X } from 'lucide-react'
import { useToast } from '@/components/toast'

const languages = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' }, { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' }, { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' }, { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' }, { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'nb', name: 'Norwegian', flag: '🇳🇴' }, { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' }, { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'el', name: 'Greek', flag: '🇬🇷' }, { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' }, { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' }, { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' }, { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
]

const publicVapidKey = 'BMrkFdQpAbYqKPXt7JTqG6eFNXiCJq3GRD2As2F1J4sWxVTqHdYBJCXFnKpPq7TqVq3YqXpAbKqPXt7JTqG6eFNX'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44,
        height: 26,
        borderRadius: 9999,
        background: on ? 'rgba(31,200,90,0.8)' : 'rgba(255,255,255,0.08)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'white',
          transition: 'left 0.2s ease',
        }}
      />
    </button>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const toast = useToast()
  const [language, setLanguage] = useState('es')
  const [soundOn, setSoundOn] = useState(true)
  const [notifications, setNotifications] = useState(false)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default')
  const [loading, setLoading] = useState(true)
  const [ratingOpen, setRatingOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  useEffect(() => {
    fetch('/api/users/me').then((r) => r.json()).then((data) => {
      if (data.targetLanguage) setLanguage(data.targetLanguage)
      setLoading(false)
    }).catch(() => setLoading(false))
    if ('Notification' in window) setNotifPermission(Notification.permission)
  }, [])

  const handleNotifToggle = async (on: boolean) => {
    if (on) {
      if (!('Notification' in window)) {
        toast.show('error', 'Notifications not supported')
        return
      }
      if (Notification.permission === 'denied') {
        toast.show('error', 'Notifications blocked in browser settings')
        return
      }
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission()
        setNotifPermission(perm)
        if (perm !== 'granted') return
      }
      try {
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
        setNotifications(true)
        toast.show('xp', 'Reminders enabled')
      } catch { toast.show('error', 'Failed to enable') }
    } else {
      try {
        await fetch('/api/push/unsubscribe', { method: 'POST' })
        setNotifications(false)
      } catch {}
    }
  }

  const handleRating = (stars: number) => {
    setRating(stars)
    if (stars >= 4) {
      window.open('https://chromewebstore.google.com', '_blank')
    }
    setRatingSubmitted(true)
    setTimeout(() => setRatingOpen(false), 2000)
  }

  const handleDelete = async () => {
    if (!confirm('Delete your account and all progress? This cannot be undone.')) return
    if (!confirm('Are you sure? All XP, streaks, and progress will be permanently deleted.')) return
    try {
      await fetch(`/api/users/${session?.user?.name}`, { method: 'DELETE' })
      signOut()
    } catch (e) { console.error('[Failed to delete]', e) }
  }

  const notifStatus = (() => {
    if (notifPermission === 'denied') return 'Blocked'
    if (notifications) return 'On'
    return 'Off'
  })()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Loader2 style={{ width: 20, height: 20, color: 'rgba(148,163,184,0.2)', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100%', background: '#050a14' }}>
      <div style={{ padding: '48px 40px', maxWidth: '560px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', letterSpacing: '-0.01em', marginBottom: '4px' }}>
            Settings
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(148,163,184,0.45)' }}>
            Customize your experience
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Language */}
          <div style={{ padding: '20px 24px', borderRadius: '16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(148,163,184,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Language
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Globe style={{ width: 16, height: 16, color: 'rgba(59,130,246,0.6)', flexShrink: 0 }} />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(226,232,240,0.8)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} style={{ background: '#0a0f1a' }}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, color: 'rgba(148,163,184,0.2)' }}>
                <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Notifications */}
          <div style={{ padding: '20px 24px', borderRadius: '16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(148,163,184,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Notifications
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bell style={{ width: 16, height: 16, color: 'rgba(234,179,8,0.5)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(226,232,240,0.8)' }}>Daily reminders</p>
                  {notifPermission === 'denied' && (
                    <p style={{ fontSize: '11px', color: 'rgba(239,68,68,0.5)' }}>Blocked — allow in browser settings</p>
                  )}
                </div>
              </div>
              <Toggle on={notifications && notifPermission === 'granted'} onChange={handleNotifToggle} />
            </div>
          </div>

          {/* Sound */}
          <div style={{ padding: '20px 24px', borderRadius: '16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(148,163,184,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Sound
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Volume2 style={{ width: 16, height: 16, color: 'rgba(31,200,90,0.5)', flexShrink: 0 }} />
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(226,232,240,0.8)' }}>Sound effects</p>
              </div>
              <Toggle on={soundOn} onChange={setSoundOn} />
            </div>
          </div>

          {/* Rate */}
          <div style={{ padding: '20px 24px', borderRadius: '16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(148,163,184,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Feedback
            </p>
            <button
              onClick={() => setRatingOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Star style={{ width: 16, height: 16, color: 'rgba(234,179,8,0.5)', flexShrink: 0 }} />
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(226,232,240,0.8)' }}>Rate WordCrammer</p>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'rgba(148,163,184,0.2)' }}>
                <path d="M4 2.5L7.5 6l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Rating modal */}
          {ratingOpen && (
            <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>How's WordCrammer?</p>
                <button onClick={() => setRatingOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.3)', display: 'flex' }}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
              {!ratingSubmitted ? (
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => handleRating(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                      <Star
                        style={{
                          width: 28,
                          height: 28,
                          color: s <= rating ? '#eab308' : 'rgba(148,163,184,0.15)',
                          fill: s <= rating ? '#eab308' : 'none',
                          transition: 'all 0.1s ease',
                        }}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'rgba(74,222,128,0.7)', textAlign: 'center' }}>
                  {rating >= 4 ? 'Thanks! Opening store page...' : 'Thanks for your feedback!'}
                </p>
              )}
            </div>
          )}

          {/* Sign out */}
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => signOut()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'rgba(148,163,184,0.25)',
                transition: 'color 0.15s ease',
                padding: '8px',
              }}
            >
              Sign out
            </button>
          </div>

          {/* Danger zone */}
          <div style={{ marginTop: '24px', padding: '20px 24px', borderRadius: '16px', background: 'rgba(239,68,68,0.02)', border: '1px solid rgba(239,68,68,0.08)' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(239,68,68,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Danger Zone
            </p>
            <button
              onClick={handleDelete}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(239,68,68,0.04)',
                border: '1px solid rgba(239,68,68,0.1)',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'rgba(239,68,68,0.5)',
                transition: 'all 0.15s ease',
              }}
            >
              <Trash2 style={{ width: 14, height: 14 }} />
              Delete account
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
