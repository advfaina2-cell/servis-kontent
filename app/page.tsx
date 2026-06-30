import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            Посты в вашем голосе.<br />
            <span className="text-accent">Без копирайтера.</span>
          </h1>
          <p className="text-text-muted text-lg max-w-md mx-auto">
            Загрузите несколько своих постов — AI снимет ваш стиль и будет писать новые тексты так, как пишете вы.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register">
            <Button className="bg-accent hover:bg-accent-hover px-8 py-6 text-base">
              Начать бесплатно →
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="border-white/10 px-8 py-6 text-base">
              Войти
            </Button>
          </Link>
        </div>

        <p className="text-text-muted text-sm">3 поста бесплатно · карта не нужна</p>

        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
          {[
            { icon: '🎙', title: 'Голосовой ввод', desc: 'Наговорите тему или примеры — мы распознаем' },
            { icon: '✦', title: '3 варианта сразу', desc: 'Выбирайте лучший, не нажимая «попробуй ещё»' },
            { icon: '📱', title: 'Любая платформа', desc: 'LinkedIn, Telegram, Instagram, Twitter' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="text-center space-y-2">
              <div className="text-2xl">{icon}</div>
              <p className="font-medium text-sm">{title}</p>
              <p className="text-text-muted text-xs">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
