# VoicePost

AI-сервис, который генерирует посты для соцсетей в личном стиле пользователя.

## Стек

- Next.js 16 (App Router) + TypeScript
- Supabase (Auth + PostgreSQL + RLS)
- Vercel AI SDK + Claude (анализ стиля, генерация постов)
- OpenAI Whisper (голосовая транскрипция)
- Lemon Squeezy ($1/мес подписка)
- shadcn/ui + Tailwind CSS
- Vitest

## Разработка

```bash
npm install
npm run dev
```

Скопируйте `.env.example` в `.env.local` и заполните ключи (Supabase, Anthropic, OpenAI, Lemon Squeezy).

Выполните `supabase/migrations/001_initial.sql` в Supabase SQL Editor перед первым запуском.

## Тесты

```bash
npx vitest run
```
