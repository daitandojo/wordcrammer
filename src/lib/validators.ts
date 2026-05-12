import { z } from 'zod'

export const progressSchema = z.object({
  topiccode: z.string().length(6),
  question: z.string().max(18),
  correct: z.boolean(),
})

export const createTopicSchema = z.object({
  topiccode: z.string().length(6).toUpperCase(),
  topictitle: z.string().min(10).max(30),
  description: z.string().min(10),
  setimage: z.string().url().startsWith('http'),
  voice: z.string().min(3),
  setdata: z.string().min(1),
})

export const reportContentSchema = z.object({
  topiccode: z.string().length(6),
  question: z.string().max(18),
})

export const xpAwardSchema = z.object({
  gameType: z.enum(['flashcard-cram', 'multiple-choice', 'listen-type', 'gap-texts', 'sentence-building', 'guided-writing']),
  totalQuestions: z.number().int().positive(),
  score: z.number().int().min(0),
  isPerfectSession: z.boolean().optional(),
})

export const sttSchema = z.object({
  audio: z.string().min(1),
  language: z.string().optional(),
})

export const ttsSchema = z.object({
  text: z.string().min(1).max(500),
  language: z.string().optional(),
  voice: z.string().optional(),
})

export const pronunciationSchema = z.object({
  audio: z.string().min(1),
  referenceText: z.string().min(1).max(100),
  language: z.string().optional(),
})

export const challengeSchema = z.object({
  targetUsername: z.string().min(1).max(6),
  topiccode: z.string().length(6),
})

export const conversationSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })).min(1),
})
