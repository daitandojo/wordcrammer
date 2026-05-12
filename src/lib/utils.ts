/**
 * Fisher-Yates shuffle. Returns a new shuffled array.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Slice an array into chunks of the given subset size and return the nth subset.
 */
export function getSubset<T>(items: T[], subsetId: number, subsetSize = 40): T[] {
  const start = (subsetId - 1) * subsetSize
  return items.slice(start, start + subsetSize)
}

/**
 * Calculate the number of subsets for a given item count.
 */
export function getSubsetCount(itemCount: number, subsetSize = 40): number {
  return Math.max(1, Math.ceil(itemCount / subsetSize))
}
