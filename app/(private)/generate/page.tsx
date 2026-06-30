'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { VoiceRecorder } from '@/components/voice-recorder'
import { PostCard } from '@/components/post-card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'twitter', label: 'X / Twitter' },
]

const TONES = [
  { id: 'default', label: 'Как обычно' },
  { id: 'serious', label: 'Серьёзнее' },
  { id: 'light', label: 'Легче' },
  { id: 'bold', label: 'Дерзко' },
]

interface GenerationResult { text: string; variant: number }

export default function GeneratePage() {
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('linkedin')
  const [tone, setTone] = useState('default')
  const [results, setResults] = useState<GenerationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voiceId, setVoiceId] = useState<string | null>(null)
  const [generationCount, setGenerationCount] = useState(0)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const urlTopic = searchParams.get('topic')
    const urlPlatform = searchParams.get('platform')
    if (urlTopic) setTopic(urlTopic)
    if (urlPlatform) setPlatform(urlPlatform)

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const [{ data: voice }, { data: profile }] = await Promise.all([
        supabase.from('voices').select('id').eq('user_id', user.id).eq('is_default', true).single(),
        supabase.from('profiles').select('generation_count, is_subscribed').eq('id', user.id).single(),
      ])
      if (voice) setVoiceId(voice.id)
      if (profile) {
        setGenerationCount(profile.generation_count)
        setIsSubscribed(profile.is_subscribed)
      }
    })
  }, [])

  async function handleGenerate() {
    if (!topic.trim() || !voiceId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, voice_id: voiceId, platform, tone }),
      })
      const data = await res.json()
      if (data.error === 'limit_reached') {
        setError('limit_reached')
        return
      }
      if (data.results) {
        setResults(prev => [...data.results, ...prev])
        setGenerationCount(c => c + 1)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRefine(action: string, text: string): Promise<string> {
    const actionPrompts: Record<string, string> = {
      shorten: `Сократи этот пост вдвое, сохраняя смысл и голос автора:\n\n${text}`,
      expand:  `Расширь этот пост в полтора раза, добавь детали, сохраняя голос автора:\n\n${text}`,
      other_angle: `Перепиши этот пост с другого угла, сохраняя тему и голос автора:\n\n${text}`,
    }
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: actionPrompts[action],
        voice_id: voiceId,
        platform,
        tone,
        preview_mode: true,
      }),
    })
    const data = await res.json()
    return data.results?.[0]?.text ?? text
  }

  const remaining = Math.max(0, 3 - generationCount)
  const limitReached = !isSubscribed && generationCount >= 3

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">VoicePost</h1>
          <div className="flex items-center gap-4">
            {!isSubscribed && (
              <span className="text-sm text-text-muted">
                Осталось: <span className="text-accent">{remaining}</span> из 3
              </span>
            )}
            <Link href="/settings" className="text-text-muted hover:text-text-primary text-sm">⚙</Link>
            <Link href="/history" className="text-text-muted hover:text-text-primary text-sm">История</Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="О чём пишем? Расскажите тему — идею, тезис или просто «про прокрастинацию»"
              rows={3}
              className="bg-surface1 border-white/10 resize-none pr-12"
            />
            <div className="absolute bottom-3 right-3">
              <VoiceRecorder
                label=""
                onTranscript={text => setTopic(t => t ? `${t} ${text}` : text)}
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`px-3 py-1.5 rounded-input text-sm border transition-colors ${
                  platform === p.id
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'border-white/10 text-text-muted hover:border-white/30'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {TONES.map(t => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                  tone === t.id
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'border-white/10 text-text-muted hover:border-white/30'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {limitReached ? (
            <div className="p-4 rounded-card border border-accent/30 bg-accent/5 text-center space-y-3">
              <p className="text-sm">Вы использовали все бесплатные посты</p>
              <Link href="/upgrade">
                <Button className="bg-accent hover:bg-accent-hover">Перейти на Pro — $1/мес</Button>
              </Link>
            </div>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={!topic.trim() || loading || !voiceId}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-40 text-base py-6"
            >
              {loading ? 'Пишем...' : '✦ Написать 3 поста'}
            </Button>
          )}

          {error === 'limit_reached' && (
            <p className="text-red-400 text-sm text-center">Лимит бесплатных генераций исчерпан</p>
          )}
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-text-muted text-sm">Результаты</h2>
              {!limitReached && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="text-text-muted text-xs"
                >
                  + Ещё 3 варианта
                </Button>
              )}
            </div>
            {results.map((r, i) => (
              <PostCard
                key={i}
                text={r.text}
                variant={r.variant}
                voiceId={voiceId ?? ''}
                topic={topic}
                platform={platform}
                tone={tone}
                onRefine={handleRefine}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
