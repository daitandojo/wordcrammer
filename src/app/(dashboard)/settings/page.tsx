'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Settings, LogOut, ChevronRight, Globe, Target, Bell, Volume2, Trash2, Loader2 } from 'lucide-react'

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

export default function SettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [language, setLanguage] = useState('es')
  const [dailyGoal, setDailyGoal] = useState('1')
  const [soundOn, setSoundOn] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users/me').then((r) => r.json()).then((data) => {
      if (data.targetLanguage) setLanguage(data.targetLanguage)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    if (!confirm('Delete your account and all progress? This cannot be undone.')) return
    if (!confirm('Are you sure? All your XP, streaks, and progress will be permanently deleted.')) return
    try {
      await fetch(`/api/users/${session?.user?.name}`, { method: 'DELETE' })
      signOut()
    } catch (e) { console.error('[Failed to delete account]', e) }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
  }

  return (
    <div className="app-main p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 mb-4">
          <Settings className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-sm text-slate-500">Customize your learning experience</p>
      </div>

      <div className="space-y-4">
        <div className="glass rounded-2xl p-5 border border-white/10">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Learning</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-blue-400" />
                <div><p className="text-sm text-white">Target Language</p></div>
              </div>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                {languages.map((l) => (<option key={l.code} value={l.code}>{l.flag} {l.name}</option>))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-indigo-400" />
                <div><p className="text-sm text-white">Daily Goal</p><p className="text-xs text-slate-500">Sets per day</p></div>
              </div>
              <select value={dailyGoal} onChange={(e) => setDailyGoal(e.target.value)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                <option value="1">1 set</option><option value="2">2 sets</option><option value="3">3 sets</option><option value="99">No limit</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/10">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Preferences</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-green-400" />
                <div><p className="text-sm text-white">Sound Effects</p></div>
              </div>
              <div onClick={() => setSoundOn(!soundOn)} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${soundOn ? 'bg-blue-500' : 'bg-white/10'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${soundOn ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-yellow-400" />
                <div><p className="text-sm text-white">Daily Reminders</p><p className="text-xs text-slate-500">Push notification if you miss a day</p></div>
              </div>
              <div onClick={() => setNotifications(!notifications)} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${notifications ? 'bg-blue-500' : 'bg-white/10'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </label>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-red-500/10">
          <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-4">Danger Zone</h3>
          <button onClick={handleDelete} className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm">
            <Trash2 className="w-4 h-4" />
            Delete Account and All Data
          </button>
        </div>

        <div className="text-center pt-2">
          <button onClick={() => signOut()} className="inline-flex items-center gap-2 px-4 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
