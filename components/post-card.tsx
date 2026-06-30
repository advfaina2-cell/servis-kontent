'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface PostCardProps {
  text: string
  variant: number
  voiceId: string
  topic: string
  platform: string
  tone: string
  onRefine: (action: 'shorten' | 'expand' | 'other_angle', text: string) => Promise<string>
}

export function PostCard({ text, variant, onRefine }: PostCardProps) {
  const [content, setContent] = useState(text)
  const [copied, setCopied] = useState(false)
  const [refining, setRefining] = useState<string | null>(null)

  async function handleCopy() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRefine(action: 'shorten' | 'expand' | 'other_angle') {
    setRefining(action)
    try {
      const result = await onRefine(action, content)
      setContent(result)
    } finally {
      setRefining(null)
    }
  }

  const actionLabels = {
    shorten: 'Короче',
    expand: 'Длиннее',
    other_angle: 'Другой угол',
  }

  return (
    <div
      className="rounded-card p-6 flex flex-col gap-4"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <p className="text-xs text-text-muted">Вариант {variant}</p>
      <p className="font-mono text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
        <Button
          size="sm"
          onClick={handleCopy}
          className="bg-accent hover:bg-accent-hover"
        >
          {copied ? '✓ Скопировано' : 'Копировать'}
        </Button>
        {(['shorten', 'expand', 'other_angle'] as const).map(action => (
          <Button
            key={action}
            size="sm"
            variant="outline"
            onClick={() => handleRefine(action)}
            disabled={refining !== null}
            className="border-white/10 text-text-muted hover:text-text-primary text-xs"
          >
            {refining === action ? '...' : actionLabels[action]}
          </Button>
        ))}
      </div>
    </div>
  )
}
