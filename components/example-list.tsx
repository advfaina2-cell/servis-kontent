'use client'

import { Button } from '@/components/ui/button'

interface Example {
  id: string
  content: string
  source: 'paste' | 'audio' | 'file'
}

interface ExampleListProps {
  examples: Example[]
  onDelete: (id: string) => void
}

export function ExampleList({ examples, onDelete }: ExampleListProps) {
  if (examples.length === 0) return null

  return (
    <div className="space-y-2 mt-4">
      <p className="text-sm text-text-muted">Примеры ({examples.length}):</p>
      {examples.map((ex) => (
        <div
          key={ex.id}
          className="flex items-start gap-3 p-3 rounded-input border border-white/10 bg-surface2 group"
        >
          <span className="text-lg">{ex.source === 'audio' ? '🎙' : '📝'}</span>
          <p className="flex-1 text-sm text-text-primary line-clamp-2">{ex.content}</p>
          <button
            type="button"
            onClick={() => onDelete(ex.id)}
            className="text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
