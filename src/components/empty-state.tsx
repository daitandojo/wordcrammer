'use client'

import Crammy from '@/components/crammy'

type CrammyMood = 'idle' | 'happy' | 'celebrating'

type Props = {
  mood?: CrammyMood
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export default function EmptyState({ mood = 'idle', title, description, actionLabel, onAction, className = '' }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <Crammy mood={mood} size={80} />
      <h3 className="text-base font-semibold text-white mt-4 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary px-5 py-2 text-sm">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
