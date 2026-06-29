'use client'

import { signIn } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useActionState } from 'react'

export default function LoginPage() {
  const [state, action] = useActionState(async (_: unknown, formData: FormData) => {
    return await signIn(formData)
  }, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="w-full max-w-sm p-8 rounded-card border border-white/10 bg-surface1">
        <h1 className="text-2xl font-semibold mb-6 tracking-tight">Войти</h1>
        <form action={action} className="space-y-4">
          <Input name="email" type="email" placeholder="Email" required className="bg-surface2 border-white/10" />
          <Input name="password" type="password" placeholder="Пароль" required className="bg-surface2 border-white/10" />
          {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
          <Button type="submit" className="w-full bg-accent hover:bg-accent-hover">Войти</Button>
        </form>
        <p className="mt-4 text-sm text-text-muted text-center">
          Нет аккаунта?{' '}
          <Link href="/register" className="text-accent hover:underline">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}
