'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { VoiceRecorder } from '@/components/voice-recorder'
import { ExampleList } from '@/components/example-list'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Example {
  id: string
  content: string
  source: 'paste' | 'audio' | 'file'
}

function parsePastedPosts(text: string): string[] {
  return text
    .split(/---+/)
    .map(s => s.trim())
    .filter(s => s.length > 20)
}

export default function OnboardingUploadPage() {
  const router = useRouter()
  const [examples, setExamples] = useState<Example[]>([])
  const [pasteText, setPasteText] = useState('')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function addExample(content: string, source: Example['source']) {
    setExamples(prev => [...prev, { id: crypto.randomUUID(), content, source }])
  }

  function handlePasteAdd() {
    const posts = parsePastedPosts(pasteText)
    posts.forEach(p => addExample(p, 'paste'))
    setPasteText('')
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      parsePastedPosts(text).forEach(p => addExample(p, 'file'))
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleAnalyze() {
    if (examples.length < 3) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: voice } = await supabase
        .from('voices')
        .insert({ user_id: user.id, name: 'Мой голос', is_default: true })
        .select()
        .single()

      if (!voice) return

      await supabase.from('style_examples').insert(
        examples.map(ex => ({
          user_id: user.id,
          voice_id: voice.id,
          content: ex.content,
          source: ex.source,
        }))
      )

      router.push(`/onboarding/voice?voice_id=${voice.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
            <span className="text-accent">●</span> Шаг 1 из 3
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Добавьте примеры своих текстов</h1>
          <p className="text-text-muted mt-1 text-sm">
            Минимум 3 примера. Чем больше — тем точнее голос.
          </p>
        </div>

        <VoiceRecorder
          label="Записать голосом"
          onTranscript={(text) => addExample(text, 'audio')}
        />

        <div className="space-y-2">
          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={'Вставьте свои посты сюда.\nРазделяйте их через ---\n\n---\n\nВторой пост здесь'}
            rows={6}
            className="bg-surface2 border-white/10 font-mono text-sm resize-none"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handlePasteAdd}
            disabled={pasteText.trim().length <= 20}
            className="border-white/10"
          >
            Добавить из текста
          </Button>
        </div>

        <div>
          <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
          <Button
            type="button"
            variant="ghost"
            onClick={() => fileRef.current?.click()}
            className="text-text-muted text-sm"
          >
            📎 Загрузить .txt файл
          </Button>
        </div>

        <ExampleList
          examples={examples}
          onDelete={(id) => setExamples(prev => prev.filter(e => e.id !== id))}
        />

        <Button
          onClick={handleAnalyze}
          disabled={examples.length < 3 || saving}
          className="w-full bg-accent hover:bg-accent-hover disabled:opacity-40"
        >
          {saving ? 'Сохраняем...' : `Анализировать мой стиль → (${examples.length}/3 минимум)`}
        </Button>
      </div>
    </div>
  )
}
