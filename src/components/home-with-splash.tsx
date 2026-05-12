'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SplashScreen from '@/components/splash-screen'
import Welcome from '@/components/welcome'
import ReasonsToCram from '@/components/reasons-to-cram'
import LearnVocabNow from '@/components/learn-vocab-now'
import WhatToLearn from '@/components/what-to-learn'
import HistoryForm from '@/components/history-form'

export default function HomeWithSplash() {
  const [splashDone, setSplashDone] = useState(false)

  const handleSplashComplete = useCallback(() => setSplashDone(true), [])

  return (
    <>
      <AnimatePresence>
        {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {splashDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Welcome />
            <ReasonsToCram />
            <LearnVocabNow />
            <WhatToLearn />
            <HistoryForm />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
