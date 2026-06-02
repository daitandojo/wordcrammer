import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CramItem = {
  id: number; topiccode: string; question: string; answer: string
  questiontype: string; reported: string | null
  topic_tag: string | null; grammar_tag: string | null
  attempts: number; corrects: number
}

type Topic = { topiccode: string; topictitle: string; voice: string; itemcount: number }

type CramStore = {
  currentSet: CramItem[]
  currentTopic: Topic | null
  sessionErrors: Array<{ question: string; answer: string; topic_tag: string | null; grammar_tag: string | null }>
  setSet: (items: CramItem[], topic: Topic) => void
  clear: () => void
  addError: (err: { question: string; answer: string; topic_tag: string | null; grammar_tag: string | null }) => void
}

export const useCramStore = create<CramStore>()(
  persist(
    (set) => ({
      currentSet: [],
      currentTopic: null,
      sessionErrors: [],
      setSet: (items, topic) => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('wc_cram_set', JSON.stringify(items))
          sessionStorage.setItem('wc_cram_topic', JSON.stringify(topic))
        }
        set({ currentSet: items, currentTopic: topic, sessionErrors: [] })
      },
      clear: () => {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('wc_cram_set')
          sessionStorage.removeItem('wc_cram_topic')
        }
        set({ currentSet: [], currentTopic: null, sessionErrors: [] })
      },
      addError: (err) => set((s) => ({ sessionErrors: [...s.sessionErrors, err].slice(0, 10) })),
    }),
    { name: 'wc-cram-storage' }
  )
)
