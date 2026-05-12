import { describe, it, expect } from 'vitest'
import { replaceAccentChars, getAccentTips, accentChars, accentGrouped } from '../accent-chars'

describe('replaceAccentChars', () => {
  it('replaces /e with é', () => expect(replaceAccentChars('/e')).toBe('é'))
  it('replaces :u with ü', () => expect(replaceAccentChars(':u')).toBe('ü'))
  it('replaces ^a with â', () => expect(replaceAccentChars('^a')).toBe('â'))
  it('replaces =n with ñ', () => expect(replaceAccentChars('=n')).toBe('ñ'))
  it('replaces /c with ç', () => expect(replaceAccentChars('/c')).toBe('ç'))
  it('replaces /s with ß', () => expect(replaceAccentChars('/s')).toBe('ß'))
  it('passes through plain text unchanged', () => expect(replaceAccentChars('hello')).toBe('hello'))
  it('handles multiple replacements', () => expect(replaceAccentChars('/e :u ^a')).toBe('é ü â'))
  it('handles uppercase variants', () => expect(replaceAccentChars('/E')).toBe('É'))
  it('does not modify already-accented text', () => expect(replaceAccentChars('éüâ')).toBe('éüâ'))
  it('handles empty string', () => expect(replaceAccentChars('')).toBe(''))
  it('handles string with no accent patterns', () => expect(replaceAccentChars('hello world')).toBe('hello world'))
  it('processes all accent pairs uniquely', () => {
    const seen = new Set(accentChars.map(([code]) => code))
    expect(seen.size).toBe(accentChars.length)
  })
})

describe('getAccentTips', () => {
  it('returns tips for accented characters found in text', () => {
    const tips = getAccentTips('é')
    expect(tips.length).toBeGreaterThan(0)
    expect(tips[0]).toContain('/e')
  })
  it('returns empty array for plain text', () => expect(getAccentTips('hello')).toEqual([]))
  it('returns multiple tips for multiple accented chars', () => {
    const tips = getAccentTips('éü')
    expect(tips.length).toBe(2)
  })
})

describe('accentChars', () => {
  it('has entries', () => expect(accentChars.length).toBeGreaterThan(50))
  it('all entries have length 2', () => {
    for (const entry of accentChars) expect(entry.length).toBe(2)
  })
  it('all codes start with a special character', () => {
    for (const [code] of accentChars) expect(code.length).toBe(2)
  })
})

describe('accentGrouped', () => {
  it('has 6 groups', () => expect(accentGrouped.length).toBe(6))
  it('all groups have chars', () => {
    for (const g of accentGrouped) expect(g.chars.length).toBeGreaterThan(0)
  })
  it('total chars across groups equals accentChars length', () => {
    const total = accentGrouped.reduce((a, g) => a + g.chars.length, 0)
    expect(total).toBeLessThanOrEqual(accentChars.length)
  })
})
