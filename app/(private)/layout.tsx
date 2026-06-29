import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Onboarding redirect is handled per-page, not here,
  // because RSC does not expose the current pathname directly.

  return <>{children}</>
}
