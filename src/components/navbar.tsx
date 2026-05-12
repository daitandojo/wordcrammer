'use client'

import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Trophy, Menu, X, LogIn, LayoutDashboard, Keyboard, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@/components/user-provider'

const mobileLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cram', label: 'Cram', icon: Keyboard, primary: true },
  { href: '/analysis', label: 'Progress', icon: BarChart3 },
]

export default function Navbar() {
  const { data: session } = useSession()
  const { user: userStats } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <header
      className="lg:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      style={{
        background: 'rgba(5,10,20,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
      }}
    >
      <div className="flex items-center justify-between h-16 px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 transition-transform duration-200 group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #1fc85a, #16b84a)',
              boxShadow: '0 4px 12px rgba(31,200,90,0.25)',
            }}
          >
            W
          </div>
          <span className="text-sm font-semibold text-white">WordCrammer</span>
        </Link>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              {userStats && (
                <div
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(31,200,90,0.06)', border: '1px solid rgba(31,200,90,0.1)' }}
                >
                  <Trophy className="w-3.5 h-3.5" style={{ color: 'rgba(31,200,90,0.6)' }} />
                  <span className="text-[11px] font-medium text-white">Lv.{userStats.level}</span>
                  <span className="text-[10px]" style={{ color: 'rgba(148,163,184,0.4)' }}>
                    · {userStats.xp} XP
                  </span>
                </div>
              )}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'rgba(148,163,184,0.6)', background: menuOpen ? 'rgba(255,255,255,0.04)' : 'transparent' }}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="btn-primary px-4 py-2 text-xs flex items-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign in
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
            style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}
          >
            <div className="px-4 pb-4 pt-2 space-y-1">
              {mobileLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      background: link.primary ? 'rgba(31,200,90,0.06)' : 'transparent',
                      color: link.primary ? 'rgba(74,222,128,0.8)' : 'rgba(148,163,184,0.6)',
                      border: link.primary ? '1px solid rgba(31,200,90,0.08)' : '1px solid transparent',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
