'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Home, BookOpen, Keyboard, BarChart3, LayoutDashboard } from 'lucide-react'

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/sets', label: 'Topics', icon: BookOpen },
  { href: '/cram', label: 'Cram', icon: Keyboard, primary: true },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analysis', label: 'Progress', icon: BarChart3 },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const visibleTabs = tabs.filter((t) => {
    if (t.href === '/dashboard' || t.href === '/analysis' || (t.primary)) return !!session
    return true
  })

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-16 px-2">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 min-h-[44px] justify-center ${
                active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute -top-0.5 w-8 h-0.5 bg-blue-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 ${tab.primary ? 'w-6 h-6' : ''}`} />
              <span className="text-[10px] font-medium truncate">{tab.label}</span>
              {tab.primary && (
                <motion.div
                  className="absolute -top-0.5 w-10 h-10 rounded-full bg-blue-500/5 -z-10"
                  animate={active ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring' }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
