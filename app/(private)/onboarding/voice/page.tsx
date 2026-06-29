'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { VoiceCard } from '@/components/voice-card'
import { Button } from '@/components/ui/button'

export default function OnboardingVoicePage() {
  const router = useRouter()
  const params = useSearchParams()
  const voiceId = params.get('voice_id')

  const [state, setState] = useState<'analyzing' | 'done' | 'error'>('analyzing')
  const [styleJson, setStyleJson] = useState<object | null>(null)
  const [preview, setPreview] = useState<{ withVoice: string; withoutVoice: string } | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  useEffect(() => {
    if (!voiceId) return
    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voice_id: voiceId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.styleJson) {
          setStyleJson(data.styleJson)
          setState('done')
        } else {
          setState('error')
        }
      })
      .catch(() => setState('error'))
  }, [voiceId])

  async function loadPreview() {
    if (!voiceId) return
    setLoadingPreview(true)
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'утренние привычки продуктивных людей',
        voice_id: voiceId,
        platform: 'linkedin',
        tone: 'default',
        preview_mode: true,
      }),
    })
    const data = await res.json()
    setPreview({
      withVoice: data.results?.[0]?.text ?? '',
      withoutVoice: data.generic ?? '',
    })
    setLoadingPreview(false)
  }

  if (state === 'analyzing') {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-pulse">🎙</div>
          <p className="text-text-muted">Читаем ваши тексты...</p>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">Что-то пошло не так. Попробуйте снова.</p>
          <Button onClick={() => router.back()} variant="outline">← Назад</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
            <span className="text-accent">●●</span> Шаг 2 из 3
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Ваш голос</h1>
          <p className="text-text-muted mt-1 text-sm">Вот что мы поняли о вашем стиле</p>
        </div>

        {styleJson && <VoiceCard styleJson={styleJson as any} />}

        {!preview && (
          <Button
            variant="outline"
            onClick={loadPreview}
            disabled={loadingPreview}
            className="border-white/10 w-full"
          >
            {loadingPreview ? 'Генерируем пример...' : '👁 Посмотреть пример'}
          </Button>
        )}

        {preview && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-card bg-surface2 border border-white/10">
              <p className="text-xs text-text-muted mb-2">Без голоса</p>
              <p className="text-sm text-text-primary">{preview.withoutVoice}</p>
            </div>
            <div className="p-4 rounded-card border border-accent/30 bg-accent/5">
              <p className="text-xs text-accent mb-2">Ваш голос</p>
              <p className="text-sm text-text-primary">{preview.withVoice}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="border-white/10">
            ← Добавить ещё примеров
          </Button>
          <Button
            onClick={() => router.push('/onboarding/done')}
            className="flex-1 bg-accent hover:bg-accent-hover"
          >
            Похоже на меня →
          </Button>
        </div>
      </div>
    </div>
  )
}
