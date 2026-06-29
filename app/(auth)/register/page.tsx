'use client'

import { signUp } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useActionState } from 'react'

export default function RegisterPage() {
  const [state, action] = useActionState(async (_: unknown, formData: FormData) => {
    return await signUp(formData)
  }, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="w-full max-w-sm p-8 rounded-card border border-white/10 bg-surface1">
        <h1 className="text-2xl font-semibold mb-2 tracking-tight">Создать аккаунт</h1>
        <p className="text-text-muted text-sm mb-6">3 поста бесплатно, карта не нужна</p>
        <form action={action} className="space-y-4">
          <Input name="email" type="email" placeholder="Email" required className="bg-surface2 border-white/10" />
          <Input name="password" type="password" placeholder="Пароль (мин. 6 символов)" required minLength={6} className="bg-surface2 border-white/10" />
          {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
          <Button type="submit" className="w-full bg-accent hover:bg-accent-hover">Начать бесплатно</Button>
        </form>
        <p className="mt-4 text-sm text-text-muted text-center">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-accent hover:underline">Войти</Link>
        </p>
      </div>
    </div>
  )
}
