export type Platform = 'linkedin' | 'telegram' | 'instagram' | 'twitter'

export interface PlatformConfig {
  instructions: string
  maxChars: number
  formatHint: string
}

const CONFIGS: Record<Platform, PlatformConfig> = {
  linkedin: {
    instructions: 'Это пост для LinkedIn. До 3000 символов. Используй короткие абзацы с пустыми строками между ними. Профессиональный контекст, но личный тон.',
    maxChars: 3000,
    formatHint: 'Короткие абзацы, без хэштегов или с 2–3 в конце',
  },
  telegram: {
    instructions: 'Это пост для Telegram-канала. Длина свободная. Авторский формат, можно эмодзи для структуры.',
    maxChars: 0,
    formatHint: 'Свободный формат, авторский стиль',
  },
  instagram: {
    instructions: 'Это пост для Instagram. Добавь 5–10 хэштегов в конце поста через пробел. Визуальный, эмоциональный язык.',
    maxChars: 2200,
    formatHint: '5–10 хэштегов в конце',
  },
  twitter: {
    instructions: 'Это твит для Twitter/X. СТРОГО до 280 символов. Первая строка — сильный хук. Никаких хэштегов.',
    maxChars: 280,
    formatHint: 'До 280 символов, хук в первой строке',
  },
}

export function getPlatformConfig(platform: string): PlatformConfig {
  return CONFIGS[platform as Platform] ?? CONFIGS.telegram
}
