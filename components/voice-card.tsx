interface StyleJson {
  tone?: string
  sentence_length?: string
  vocabulary?: string
  structure?: string
  signature_moves?: string[]
  emoji_usage?: string
  punctuation?: string
}

interface VoiceCardProps {
  styleJson: StyleJson
  name?: string
}

export function VoiceCard({ styleJson, name = 'Ваш голос' }: VoiceCardProps) {
  const attributes = [
    { label: 'Тон', value: styleJson.tone },
    { label: 'Длина', value: styleJson.sentence_length },
    { label: 'Подача', value: styleJson.vocabulary },
    { label: 'Структура', value: styleJson.structure },
    { label: 'Фишки', value: styleJson.signature_moves?.join(' · ') },
  ].filter(a => a.value)

  return (
    <div
      className="rounded-card p-6"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎙</span>
        <h3 className="font-semibold">{name}</h3>
      </div>
      <div className="space-y-2">
        {attributes.map(({ label, value }) => (
          <div key={label} className="flex gap-3 text-sm">
            <span className="text-text-muted w-24 shrink-0">{label}</span>
            <span className="text-text-primary">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
