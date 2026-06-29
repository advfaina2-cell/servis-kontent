import { getPlatformConfig } from './platform'

export function buildAnalyzePrompt(examples: string[]): string {
  const examplesText = examples.join('\n---\n')
  return `Ты — эксперт по анализу письменного стиля. Проанализируй эти тексты одного автора и верни JSON-объект с точным описанием его стиля.

ТЕКСТЫ АВТОРА:
${examplesText}

Верни ТОЛЬКО валидный JSON без лишних пояснений:
{
  "tone": "описание тона и манеры подачи",
  "sentence_length": "описание длины предложений",
  "vocabulary": "описание словарного запаса",
  "structure": "типичная структура текста",
  "signature_moves": ["характерный приём 1", "характерный приём 2"],
  "emoji_usage": "описание использования эмодзи",
  "punctuation": "особенности пунктуации"
}`
}

const TONE_MODIFIERS: Record<string, string> = {
  default: '',
  serious: 'Сделай тон чуть более серьёзным и формальным, но сохрани голос автора.',
  light: 'Сделай тон чуть легче и дружелюбнее, но сохрани голос автора.',
  bold: 'Сделай тон более дерзким и провокационным, но сохрани голос автора.',
}

const VARIANT_ANGLES = [
  'Первый вариант: стандартный подход к теме.',
  'Второй вариант: начни с неожиданного факта или риторического вопроса.',
  'Третий вариант: начни с личной истории или конкретного примера.',
]

export interface GenerateParams {
  topic: string
  styleJson: object
  platform: string
  tone: string
  variant: number
}

export function buildGeneratePrompt({ topic, styleJson, platform, tone, variant }: GenerateParams): string {
  const platformConfig = getPlatformConfig(platform)
  const toneModifier = TONE_MODIFIERS[tone] ?? ''
  const angle = VARIANT_ANGLES[(variant - 1) % 3]

  return `Ты — ghostwriter. Напиши пост на тему "${topic}" СТРОГО в стиле этого автора.

СТИЛЬ АВТОРА:
${JSON.stringify(styleJson, null, 2)}

ПЛАТФОРМА:
${platformConfig.instructions}

${toneModifier ? `ТОН: ${toneModifier}` : ''}

УГОЛ ПОДАЧИ: ${angle}

Верни ТОЛЬКО текст поста — без заголовка, без пояснений, без кавычек вокруг текста.`
}
