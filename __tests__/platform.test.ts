import { describe, it, expect } from 'vitest'
import { getPlatformConfig } from '@/lib/ai/platform'

describe('getPlatformConfig', () => {
  it('returns LinkedIn config with 3000 char limit', () => {
    const config = getPlatformConfig('linkedin')
    expect(config.maxChars).toBe(3000)
    expect(config.instructions).toContain('LinkedIn')
  })

  it('returns Twitter config with 280 char limit', () => {
    const config = getPlatformConfig('twitter')
    expect(config.maxChars).toBe(280)
    expect(config.instructions).toContain('280')
  })

  it('returns Telegram config with no char limit', () => {
    const config = getPlatformConfig('telegram')
    expect(config.maxChars).toBe(0)
  })

  it('returns Instagram config with hashtags instruction', () => {
    const config = getPlatformConfig('instagram')
    expect(config.instructions).toContain('хэштег')
  })
})
