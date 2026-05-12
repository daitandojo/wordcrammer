import { describe, it, expect } from 'vitest'
import { calculateLevel, LEVEL_THRESHOLDS, XP_GAINS, getAchievements, ACHIEVEMENTS } from '../game-config'

describe('calculateLevel', () => {
  it('returns 1 for 0 XP', () => expect(calculateLevel(0)).toBe(1))
  it('returns 1 for threshold 0-99', () => expect(calculateLevel(50)).toBe(1))
  it('returns 2 at 100 XP', () => expect(calculateLevel(100)).toBe(2))
  it('returns 3 at 250 XP', () => expect(calculateLevel(250)).toBe(3))
  it('returns 5 at 1000 XP', () => expect(calculateLevel(1000)).toBe(5))
  it('returns 10 at 10000 XP', () => expect(calculateLevel(10000)).toBe(10))
  it('returns 20 at 60000 XP', () => expect(calculateLevel(60000)).toBe(20))
  it('returns 20 above max threshold', () => expect(calculateLevel(99999)).toBe(20))
  it('handles negative XP', () => expect(calculateLevel(-5)).toBe(1))
  it('handles NaN', () => expect(calculateLevel(NaN)).toBe(1))
  it('handles Infinity', () => expect(calculateLevel(Infinity)).toBe(20))
})

describe('LEVEL_THRESHOLDS', () => {
  it('has 20 levels', () => expect(LEVEL_THRESHOLDS.length).toBe(20))
  it('starts at 0', () => expect(LEVEL_THRESHOLDS[0]).toBe(0))
  it('ends at 60000', () => expect(LEVEL_THRESHOLDS[19]).toBe(60000))
  it('is monotonically increasing', () => {
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
      expect(LEVEL_THRESHOLDS[i]).toBeGreaterThan(LEVEL_THRESHOLDS[i - 1])
    }
  })
})

describe('XP_GAINS', () => {
  it('has all required keys', () => {
    expect(XP_GAINS).toHaveProperty('WORD_CORRECT_FIRST_TIME_IN_SESSION')
    expect(XP_GAINS).toHaveProperty('SESSION_COMPLETION_BASE')
    expect(XP_GAINS).toHaveProperty('GAME_CORRECT_ANSWER')
    expect(XP_GAINS).toHaveProperty('SESSION_PERFECT_BONUS_PERCENT')
  })
  it('has positive values', () => {
    for (const value of Object.values(XP_GAINS)) {
      expect(typeof value).toBe('number')
      expect(value).toBeGreaterThan(0)
    }
  })
})

describe('getAchievements', () => {
  it('returns empty for new user', () => expect(getAchievements(1, 0, 0)).toEqual([]))
  it('returns first_set after completing 1 set', () => {
    const earned = getAchievements(1, 1, 0)
    expect(earned).toContain('first_set')
  })
  it('returns scholar at level 5', () => {
    const earned = getAchievements(5, 0, 0)
    expect(earned).toContain('scholar')
  })
  it('returns linguist at level 10', () => {
    const earned = getAchievements(10, 0, 0)
    expect(earned).toContain('linguist')
  })
  it('returns streak_7 at 7-day streak', () => {
    const earned = getAchievements(1, 0, 7)
    expect(earned).toContain('streak_7')
  })
  it('returns master at level 20', () => {
    const earned = getAchievements(20, 30, 30)
    expect(earned).toContain('master')
    expect(earned).toContain('fiend')
    expect(earned).toContain('streak_30')
  })
  it('returns multiple achievements for high stats', () => {
    const earned = getAchievements(10, 15, 14)
    expect(earned.length).toBeGreaterThanOrEqual(4)
  })
})

describe('ACHIEVEMENTS', () => {
  it('all achievements have required fields', () => {
    for (const a of ACHIEVEMENTS) {
      expect(a).toHaveProperty('id')
      expect(a).toHaveProperty('label')
      expect(a).toHaveProperty('desc')
      expect(a).toHaveProperty('icon')
      expect(typeof a.minLevel).toBe('number')
      expect(typeof a.minSets).toBe('number')
      expect(typeof a.minStreak).toBe('number')
    }
  })
  it('has unique IDs', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('has 9 achievements defined', () => {
    expect(ACHIEVEMENTS.length).toBe(9)
  })
})
