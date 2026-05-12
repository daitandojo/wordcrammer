'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function LiveCounter() {
  const [stats, setStats] = useState({ totalUsers: 0, totalPhrases: 0, phrasesToday: 0 })

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.totalUsers) setStats({ totalUsers: data.totalUsers, totalPhrases: data.totalPhrases ?? 0, phrasesToday: data.phrasesToday ?? 0 })
      })
      .catch(() => {})
  }, [])

  if (stats.totalUsers === 0) return null

  return (
    <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-500">
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <strong className="text-slate-300">{stats.totalUsers.toLocaleString()}</strong> crammers
      </motion.span>
      <span className="w-1 h-1 rounded-full bg-slate-600" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <strong className="text-slate-300">{stats.totalPhrases.toLocaleString()}</strong> phrases
      </motion.span>
      <span className="w-1 h-1 rounded-full bg-slate-600" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <strong className="text-slate-300">{stats.phrasesToday.toLocaleString()}</strong> phrases today
      </motion.span>
    </div>
  )
}
