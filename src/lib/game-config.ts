export const REQUIRED_CORRECT_STREAK_TO_MASTER_SESSION = 2
export const DEFAULT_SUBSET_SIZE = 36

export const XP_GAINS = {
  WORD_CORRECT_FIRST_TIME_IN_SESSION: 5,
  WORD_MASTERY_SRS: 10,
  SESSION_COMPLETION_BASE: 20,
  SESSION_PERFECT_BONUS_PERCENT: 0.25,
  GAME_CORRECT_ANSWER: 2,
}

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5000, 7000, 10000,
  15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000,
]

export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

export interface Achievement {
  id: string; label: string; desc: string; icon: string
  minLevel: number; minSets: number; minStreak: number
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_set', label: 'First Set', desc: 'Complete your first cram session', icon: '🎯', minLevel: 0, minSets: 1, minStreak: 0 },
  { id: 'scholar', label: 'Scholar', desc: 'Reach Level 5', icon: '📚', minLevel: 5, minSets: 0, minStreak: 0 },
  { id: 'linguist', label: 'Linguist', desc: 'Reach Level 10', icon: '🌍', minLevel: 10, minSets: 0, minStreak: 0 },
  { id: 'polyglot', label: 'Polyglot', desc: 'Reach Level 15', icon: '🗣️', minLevel: 15, minSets: 0, minStreak: 0 },
  { id: 'master', label: 'Master', desc: 'Reach Level 20', icon: '👑', minLevel: 20, minSets: 0, minStreak: 0 },
  { id: 'dedicated', label: 'Dedicated', desc: 'Complete 10 sets', icon: '💪', minLevel: 0, minSets: 10, minStreak: 0 },
  { id: 'fiend', label: 'Cram Fiend', desc: 'Complete 30 sets', icon: '🔥', minLevel: 0, minSets: 30, minStreak: 0 },
  { id: 'streak_7', label: 'Week Warrior', desc: '7-day streak', icon: '📅', minLevel: 0, minSets: 0, minStreak: 7 },
  { id: 'streak_30', label: 'Monthly Master', desc: '30-day streak', icon: '🏆', minLevel: 0, minSets: 0, minStreak: 30 },
]

export function getAchievements(level: number, completedSets: number, streak: number): string[] {
  return ACHIEVEMENTS.filter((a) => {
    if (a.minLevel > 0 && level < a.minLevel) return false
    if (a.minSets > 0 && completedSets < a.minSets) return false
    if (a.minStreak > 0 && streak < a.minStreak) return false
    return true
  }).map((a) => a.id)
}
