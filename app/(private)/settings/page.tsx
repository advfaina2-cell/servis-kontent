import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: examples }, { data: voices }] = await Promise.all([
    supabase.from('profiles').select('generation_count, is_subscribed, language').eq('id', user.id).single(),
    supabase.from('style_examples').select('id, content, source, created_at').eq('user_id', user.id).order('created_at'),
    supabase.from('voices').select('id, name, is_default').eq('user_id', user.id),
  ])

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-xl mx-auto px-6 py-12 space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Настройки</h1>
          <Link href="/generate" className="text-text-muted hover:text-text-primary text-sm">← Назад</Link>
        </div>

        {/* Voice section */}
        <section className="space-y-4">
          <h2 className="font-medium">Мой голос</h2>
          <p className="text-sm text-text-muted">
            {examples?.length ?? 0} примеров загружено
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(examples ?? []).map((ex) => (
              <div key={ex.id} className="flex items-start gap-3 p-3 rounded-input bg-surface2 border border-white/10">
                <span className="text-sm">{ex.source === 'audio' ? '🎙' : '📝'}</span>
                <p className="text-xs text-text-muted line-clamp-2 flex-1">{ex.content}</p>
              </div>
            ))}
          </div>
          <Link href="/onboarding/upload">
            <Button variant="outline" className="border-white/10 text-sm">
              + Добавить примеры
            </Button>
          </Link>
        </section>

        {/* Account section */}
        <section className="space-y-4 pt-6 border-t border-white/10">
          <h2 className="font-medium">Аккаунт</h2>
          <p className="text-sm text-text-muted">{user.email}</p>
          <form action={signOut}>
            <Button variant="outline" className="border-white/10 text-sm text-red-400 hover:text-red-300">
              Выйти
            </Button>
          </form>
        </section>

        {/* Subscription section */}
        <section className="space-y-4 pt-6 border-t border-white/10">
          <h2 className="font-medium">Подписка</h2>
          {profile?.is_subscribed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-accent text-sm font-medium">Pro</span>
                <span className="text-text-muted text-xs">— активна</span>
              </div>
              <a
                href="https://app.lemonsqueezy.com/my-orders"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-muted hover:text-text-primary underline"
              >
                Управлять подпиской →
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-text-muted">
                Free · Использовано {profile?.generation_count ?? 0} из 3 постов
              </p>
              <Link href="/upgrade">
                <Button className="bg-accent hover:bg-accent-hover text-sm">
                  Перейти на Pro — $1/мес
                </Button>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
