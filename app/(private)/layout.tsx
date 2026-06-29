import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  const { data: profile } = await supabase
    .from('profiles')
    .select('has_completed_onboarding')
    .eq('id', user.id)
    .single()

  const isOnboarding = pathname.startsWith('/onboarding')

  if (!profile?.has_completed_onboarding && !isOnboarding) {
    redirect('/onboarding/upload')
  }

  if (profile?.has_completed_onboarding && isOnboarding) {
    redirect('/generate')
  }

  return <>{children}</>
}
