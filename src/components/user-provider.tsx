'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type UserData = {
  username: string
  firstname: string
  xp: number
  level: number
  streak: number
  targetLanguage: string
  sourceLanguage: string
  email?: string
  referralCode?: string
  referralUrl?: string
  referredCount?: number
}

const langNames: Record<string, string> = {
  es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', nl: 'Dutch', pt: 'Portuguese',
  da: 'Danish', sv: 'Swedish', nb: 'Norwegian', fi: 'Finnish', pl: 'Polish', hu: 'Hungarian',
  el: 'Greek', ro: 'Romanian', ar: 'Arabic', he: 'Hebrew', ja: 'Japanese', zh: 'Chinese',
  id: 'Indonesian', uk: 'Ukrainian',
}

export function getLangName(code: string) { return langNames[code] ?? 'Spanish' }

type UserContextType = {
  user: UserData | null
  loading: boolean
  refresh: () => void
}

const UserContext = createContext<UserContextType>({ user: null, loading: true, refresh: () => {} })

export function useUser() {
  return useContext(UserContext)
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const [meRes, referralRes] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/referral'),
      ])
      if (meRes.ok) {
        const data = await meRes.json()
        let referralData = { referralCode: '', shareUrl: '', referredCount: 0 }
        if (referralRes.ok) referralData = await referralRes.json()

        setUser({
          username: data.username ?? '',
          firstname: data.firstname ?? '',
          xp: data.xp ?? 0,
          level: data.level ?? 1,
          streak: data.streak ?? 0,
          targetLanguage: data.targetLanguage ?? 'es',
          sourceLanguage: data.sourceLanguage ?? 'en',
          email: data.email,
          referralCode: referralData.referralCode,
          referralUrl: referralData.shareUrl,
          referredCount: referralData.referredCount,
        })
      }
    } catch (e) { console.error('[Failed to fetch user]', e) }
    setLoading(false)
  }

  useEffect(() => { fetchUser() }, [])

  return (
    <UserContext.Provider value={{ user, loading, refresh: fetchUser }}>
      {children}
    </UserContext.Provider>
  )
}
