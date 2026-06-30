import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCheckoutUrl } from '@/lib/lemonsqueezy'
import { Button } from '@/components/ui/button'

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_subscribed, generation_count')
    .eq('id', user.id)
    .single()

  if (profile?.is_subscribed) redirect('/generate')

  const checkoutUrl = getCheckoutUrl(user.email ?? '')

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Выберите план</h1>
          <p className="text-text-muted mt-2 text-sm">
            Использовано {profile?.generation_count ?? 0} из 3 бесплатных постов
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-card p-6 border border-white/10 bg-surface1 space-y-4">
            <div>
              <p className="font-semibold">Free</p>
              <p className="text-2xl font-bold mt-1">$0</p>
            </div>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>✓ 3 поста</li>
              <li>✓ 1 голос</li>
              <li>✓ Голосовой ввод</li>
              <li className="opacity-40">✗ История</li>
            </ul>
          </div>

          <div className="rounded-card p-6 border border-accent/40 bg-accent/5 space-y-4 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-accent text-white text-xs px-3 py-1 rounded-full">
                Рекомендуем
              </span>
            </div>
            <div>
              <p className="font-semibold">Pro</p>
              <p className="text-2xl font-bold mt-1">$1<span className="text-sm font-normal text-text-muted">/мес</span></p>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="text-text-primary">✓ Безлимит постов</li>
              <li className="text-text-primary">✓ До 5 голосов</li>
              <li className="text-text-primary">✓ Голосовой ввод</li>
              <li className="text-text-primary">✓ История генераций</li>
            </ul>
          </div>
        </div>

        <a href={checkoutUrl} className="block">
          <Button className="w-full bg-accent hover:bg-accent-hover py-6 text-base">
            Перейти на Pro — $1/мес →
          </Button>
        </a>

        <p className="text-center text-xs text-text-muted">
          Отменить можно в любой момент. Оплата через Lemon Squeezy.
        </p>
      </div>
    </div>
  )
}
