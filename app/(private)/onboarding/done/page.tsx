import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function OnboardingDonePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase
    .from('profiles')
    .update({ has_completed_onboarding: true })
    .eq('id', user.id)

  const { data: profile } = await supabase
    .from('profiles')
    .select('generation_count')
    .eq('id', user.id)
    .single()

  const remaining = 3 - (profile?.generation_count ?? 0)
  const postWord = remaining === 1 ? 'пост' : remaining >= 2 && remaining <= 4 ? 'поста' : 'постов'

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="text-5xl">✅</div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Голос сохранён</h1>
          <p className="text-text-muted mt-2">
            Осталось {remaining} бесплатных {postWord}
          </p>
        </div>
        <Link href="/generate">
          <Button className="w-full bg-accent hover:bg-accent-hover">
            Написать первый пост →
          </Button>
        </Link>
      </div>
    </div>
  )
}
