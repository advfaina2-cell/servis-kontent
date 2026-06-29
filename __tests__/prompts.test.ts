import { describe, it, expect } from 'vitest'
import { buildAnalyzePrompt, buildGeneratePrompt } from '@/lib/ai/prompts'

describe('buildAnalyzePrompt', () => {
  it('includes all example texts in the prompt', () => {
    const examples = ['Привет мир', 'Второй пост']
    const prompt = buildAnalyzePrompt(examples)
    expect(prompt).toContain('Привет мир')
    expect(prompt).toContain('Второй пост')
  })

  it('instructs Claude to return JSON', () => {
    const prompt = buildAnalyzePrompt(['example'])
    expect(prompt).toContain('JSON')
    expect(prompt).toContain('tone')
    expect(prompt).toContain('signature_moves')
  })
})

describe('buildGeneratePrompt', () => {
  const params = {
    topic: 'про прокрастинацию',
    styleJson: { tone: 'прямой', sentence_length: 'короткие' },
    platform: 'linkedin',
    tone: 'default',
    variant: 1,
  }

  it('includes the topic', () => {
    const prompt = buildGeneratePrompt(params)
    expect(prompt).toContain('про прокрастинацию')
  })

  it('includes the style JSON', () => {
    const prompt = buildGeneratePrompt(params)
    expect(prompt).toContain('прямой')
  })

  it('includes platform instructions', () => {
    const prompt = buildGeneratePrompt(params)
    expect(prompt).toContain('LinkedIn')
  })

  it('uses different angles for different variant numbers', () => {
    const p1 = buildGeneratePrompt({ ...params, variant: 1 })
    const p2 = buildGeneratePrompt({ ...params, variant: 2 })
    expect(p1).not.toBe(p2)
  })
})
