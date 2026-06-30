import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createClient } from '@/lib/supabase/server'
import { buildGeneratePrompt } from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('generation_count, is_subscribed')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  if (profile.generation_count >= 3 && !profile.is_subscribed) {
    return NextResponse.json({ error: 'limit_reached' }, { status: 402 })
  }

  const { topic, voice_id, platform, tone = 'default', preview_mode = false } = await request.json()

  const { data: voice } = await supabase
    .from('voices')
    .select('style_json, name')
    .eq('id', voice_id)
    .eq('user_id', user.id)
    .single()

  if (!voice?.style_json) return NextResponse.json({ error: 'Voice not found' }, { status: 404 })

  const [r1, r2, r3] = await Promise.all([1, 2, 3].map(variant =>
    generateText({
      model: anthropic('claude-sonnet-4-6'),
      prompt: buildGeneratePrompt({ topic, styleJson: voice.style_json, platform, tone, variant }),
    })
  ))

  const results = [
    { text: r1.text, variant: 1 },
    { text: r2.text, variant: 2 },
    { text: r3.text, variant: 3 },
  ]

  let generic: string | undefined
  if (preview_mode) {
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      prompt: `Напиши короткий пост о "${topic}" для LinkedIn. Нейтральный стиль, без личных особенностей. Только текст поста.`,
    })
    generic = text
  }

  if (!preview_mode) {
    const [{ error: insertError }, { error: updateError }] = await Promise.all([
      supabase.from('generations').insert({
        user_id: user.id,
        voice_id,
        topic,
        platform,
        tone,
        results,
      }),
      supabase.from('profiles').update({
        generation_count: profile.generation_count + 1,
      }).eq('id', user.id),
    ])

    if (insertError) console.error('Failed to save generation history:', insertError)
    if (updateError) console.error('Failed to update generation count:', updateError)
  }

  return NextResponse.json({ results, generic })
}
