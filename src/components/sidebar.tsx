'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@/components/user-provider'
import {
  LayoutDashboard, BarChart3, Settings,
  Keyboard, ChevronLeft,
  LogOut, Sparkles, FileText,
} from 'lucide-react'
import { calculateLevel, LEVEL_THRESHOLDS } from '@/lib/game-config'

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sets', label: 'Topics', icon: Sparkles },
  { href: '/analysis', label: 'Progress', icon: BarChart3 },
]

const moreNav = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/blog', label: 'Blog', icon: FileText },
]

const practiceModes = [
  { href: '/cram', label: 'Flashcards', icon: Keyboard },
]

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center" style={{ paddingLeft: '12px', marginBottom: '8px' }}>
      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(148,163,184,0.45)' }}>
        {label}
      </span>
    </div>
  )
}

function NavLink({
  href,
  icon: Icon,
  label,
  collapsed,
  active,
  small,
}: {
  href: string
  icon: React.ElementType
  label: string
  collapsed: boolean
  active: boolean
  small?: boolean
}) {
  return (
    <Link
      href={href}
      className="group flex items-center w-full"
      style={{
        padding: small ? '8px 12px' : '9px 12px',
        borderRadius: '10px',
        color: active ? '#4ade80' : 'rgba(226,232,240,0.6)',
        gap: '14px',
        transition: 'all 0.15s ease',
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
          style={{ background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.4)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <Icon
        className="shrink-0 transition-transform duration-200 group-hover:scale-110"
        style={{ width: small ? 16 : 17, height: small ? 16 : 17 }}
      />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.12 }}
            className="text-sm font-medium truncate"
            style={{ color: active ? '#4ade80' : 'rgba(226,232,240,0.7)' }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { user: userStats } = useUser()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const xpPercent = (() => {
    if (!userStats) return 0
    const lvl = calculateLevel(userStats.xp)
    const cur = LEVEL_THRESHOLDS[lvl - 1] ?? 0
    const next = LEVEL_THRESHOLDS[lvl] ?? cur + 1000
    return Math.min(Math.max(((userStats.xp - cur) / (next - cur)) * 100, 0), 100)
  })()

  return (
    <aside
      className="hidden lg:flex flex-col h-dvh transition-all duration-300"
      style={{
        width: collapsed ? '72px' : '240px',
        background: 'rgba(5,10,20,0.95)',
        backdropFilter: 'blur(28px)',
        borderRight: '1px solid rgba(255,255,255,0.03)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center shrink-0"
        style={{
          height: '64px',
          padding: '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.03)',
        }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5 group min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 transition-transform duration-200 group-hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #1fc85a, #16b84a)',
              boxShadow: '0 4px 12px rgba(31,200,90,0.25)',
            }}
          >
            W
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-semibold text-white whitespace-nowrap overflow-hidden"
              >
                WordCrammer
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-lg transition-all duration-200 shrink-0"
          style={{ color: 'rgba(148,163,184,0.3)' }}
          aria-label={collapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronLeft
            className="w-4 h-4 transition-transform duration-300"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto space-y-7">
        {/* Main section */}
        <div>
          <SectionLabel label="Main" />
          <div className="space-y-1">
            {mainNav.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                collapsed={collapsed}
                active={isActive(item.href)}
              />
            ))}
          </div>
        </div>

        {/* Practice section */}
        <div>
          <SectionLabel label="Practice" />
          <div className="space-y-1">
            {practiceModes.map((mode) => (
              <NavLink
                key={mode.href}
                href={mode.href}
                icon={mode.icon}
                label={mode.label}
                collapsed={collapsed}
                active={isActive(mode.href)}
              />
            ))}
          </div>
        </div>

        {/* More section */}
        <div>
          <SectionLabel label="More" />
          <div className="space-y-1">
            {moreNav.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                collapsed={collapsed}
                active={isActive(item.href)}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom area */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', padding: '16px 12px' }}>
        <div>
          {!collapsed && userStats && (
            <div style={{ marginBottom: '12px' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1fc85a, #16b84a)' }}
                >
                  {(userStats.firstname || userStats.username || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {userStats.firstname || userStats.username || 'User'}
                  </p>
                  <p className="text-[11px]" style={{ color: 'rgba(148,163,184,0.35)' }}>
                    Lv.{userStats.level}
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '10px', height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                <motion.div
                  style={{
                    height: '100%',
                    borderRadius: '9999px',
                    background: 'linear-gradient(90deg, #1fc85a, #4ade80)',
                    width: `${xpPercent}%`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: 'rgba(148,163,184,0.25)' }}>
                {userStats.xp.toLocaleString()} XP
              </p>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="flex items-center w-full"
            style={{
              padding: '9px 12px',
              borderRadius: '10px',
              color: 'rgba(148,163,184,0.25)',
              fontSize: '13px',
              gap: '14px',
              transition: 'color 0.15s ease',
            }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
