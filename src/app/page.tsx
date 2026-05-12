import type { Metadata } from 'next'
import HomeWithSplash from '@/components/home-with-splash'
import Leaderboard from '@/components/leaderboard'

export const metadata: Metadata = {
  title: 'WordCrammer - Learn Languages with AI-Powered Flash Cards',
  description:
    'Master vocabulary in 20 languages with WordCrammer. Free AI-powered flash cards using spaced repetition. 40 cards per session, 2 correct answers = mastered.',
  openGraph: {
    title: 'WordCrammer - Learn Languages with AI',
    description:
      'Master vocabulary in 20 languages with AI-powered flash cards. Free, fast, and remarkably effective.',
  },
}

export default function Home() {
  return (
    <>
      <Leaderboard />
      <HomeWithSplash />
    </>
  )
}
