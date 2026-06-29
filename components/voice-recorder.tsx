'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  label?: string
}

export function VoiceRecorder({ onTranscript, label = 'Записать голосом' }: VoiceRecorderProps) {
  const [state, setState] = useState<'idle' | 'recording' | 'processing'>('idle')
  const [error, setError] = useState<string | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunks.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data)
      }

      recorder.onstop = async () => {
        setState('processing')
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('audio', blob, 'recording.webm')

        try {
          const res = await fetch('/api/transcribe', { method: 'POST', body: formData })
          const data = await res.json()
          if (data.transcript) {
            onTranscript(data.transcript)
          } else {
            setError('Не удалось распознать речь')
          }
        } catch {
          setError('Ошибка при обработке записи')
        } finally {
          setState('idle')
          stream.getTracks().forEach(t => t.stop())
        }
      }

      recorder.start()
      mediaRecorder.current = recorder
      setState('recording')
    } catch {
      setError('Нет доступа к микрофону')
    }
  }, [onTranscript])

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop()
  }, [])

  return (
    <div className="flex flex-col gap-2">
      {state === 'idle' && (
        <Button
          type="button"
          variant="outline"
          onClick={startRecording}
          className="border-white/10 hover:border-accent gap-2"
        >
          🎙 {label}
        </Button>
      )}
      {state === 'recording' && (
        <Button
          type="button"
          variant="outline"
          onClick={stopRecording}
          className="border-red-500 text-red-400 hover:bg-red-500/10 gap-2 animate-pulse"
        >
          ⏹ Остановить запись
        </Button>
      )}
      {state === 'processing' && (
        <Button type="button" variant="outline" disabled className="gap-2">
          ⏳ Распознаём речь...
        </Button>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  )
}
