import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createClient } from '@/lib/supabase/server'
import { buildAnalyzePrompt } from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { voice_id } = await request.json()

  if (!voice_id) {
    return NextResponse.json({ error: 'voice_id is required' }, { status: 400 })
  }

  const { data: examples } = await supabase
    .from('style_examples')
    .select('content')
    .eq('voice_id', voice_id)
    .eq('user_id', user.id)

  if (!examples || examples.length < 3) {
    return NextResponse.json({ error: 'Need at least 3 examples' }, { status: 400 })
  }

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    prompt: buildAnalyzePrompt(examples.map(e => e.content)),
  })

  let styleJson: object
  try {
    styleJson = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'Failed to parse style JSON' }, { status: 500 })
  }

  const { error: updateError } = await supabase
    .from('voices')
    .update({ style_json: styleJson })
    .eq('id', voice_id)
    .eq('user_id', user.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save style' }, { status: 500 })
  }

  return NextResponse.json({ styleJson })
}
