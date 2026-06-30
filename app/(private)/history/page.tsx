import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/copy-button'

function groupByDate(items: any[]) {
  return items.reduce((groups: Record<string, any[]>, item) => {
    const date = new Date(item.created_at).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long',
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(item)
    return groups
  }, {})
}

const platformLabel: Record<string, string> = {
  linkedin: 'LinkedIn', telegram: 'Telegram', instagram: 'Instagram', twitter: 'X',
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_subscribed')
    .eq('id', user.id)
    .single()

  if (!profile?.is_subscribed) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-4xl">🔒</div>
          <h2 className="font-semibold">История доступна на Pro</h2>
          <p className="text-text-muted text-sm">
            Все ваши посты сохраняются. Обновитесь, чтобы их видеть.
          </p>
          <Link href="/upgrade">
            <Button className="bg-accent hover:bg-accent-hover">Перейти на Pro — $1/мес</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { data: generations } = await supabase
    .from('generations')
    .select('id, topic, platform, results, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const groups = groupByDate(generations ?? [])

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">История постов</h1>
          <Link href="/generate" className="text-text-muted hover:text-text-primary text-sm">
            ← Генерировать
          </Link>
        </div>

        {Object.entries(groups).map(([date, items]) => (
          <div key={date} className="space-y-3">
            <p className="text-xs text-text-muted uppercase tracking-wider">{date}</p>
            {(items as any[]).map((gen) => {
              const firstResult = gen.results?.[0]
              return (
                <div
                  key={gen.id}
                  className="rounded-card p-4 border border-white/10 bg-surface1 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">{platformLabel[gen.platform] ?? gen.platform}</span>
                    <span className="text-xs text-text-muted">·</span>
                    <span className="text-xs text-text-muted">{gen.topic}</span>
                  </div>
                  {firstResult && (
                    <p className="text-sm text-text-primary line-clamp-3">
                      {firstResult.text}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <CopyButton
                      text={firstResult?.text ?? ''}
                      className="text-xs text-text-muted hover:text-text-primary"
                    />
                    <span className="text-text-muted text-xs">·</span>
                    <Link
                      href={`/generate?topic=${encodeURIComponent(gen.topic)}&platform=${gen.platform}`}
                      className="text-xs text-text-muted hover:text-accent"
                    >
                      Использовать снова
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {(!generations || generations.length === 0) && (
          <div className="text-center py-16 text-text-muted">
            <p>Ещё нет постов. <Link href="/generate" className="text-accent hover:underline">Создать первый →</Link></p>
          </div>
        )}
      </div>
    </div>
  )
}
