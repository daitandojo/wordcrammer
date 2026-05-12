'use client'

import { type ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  variant?: 'glass' | 'accent' | 'elevated' | 'flat'
  className?: string
  onClick?: () => void
}

export function Card({ children, variant = 'glass', className = '', onClick }: CardProps) {
  const styles: Record<string, string> = {
    glass: 'glass rounded-xl',
    accent: 'glass rounded-xl border-l-4 border-l-blue-500',
    elevated: 'bg-slate-800 rounded-xl shadow-2xl border border-slate-700',
    flat: 'bg-slate-800/50 rounded-xl border border-slate-700/50',
  }

  return (
    <div
      onClick={onClick}
      className={`${styles[variant]} ${onClick ? 'cursor-pointer hover:scale-[1.01] transition-transform duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-6 py-4 border-b border-white/5 ${className}`}>{children}</div>
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}
