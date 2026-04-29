import { Mic, MicOff } from 'lucide-react'
import { AccessibleButton } from './ui/AccessibleButton'

interface VoiceRecorderProps {
  isListening: boolean
  isSupported: boolean
  transcript: string
  onStart: () => void
  onStop: () => void
}

export const VoiceRecorder = ({
  isListening,
  isSupported,
  transcript,
  onStart,
  onStop,
}: VoiceRecorderProps) => (
  <div className="space-y-4">
    <AccessibleButton
      variant={isListening ? 'danger' : 'primary'}
      fullWidth
      onClick={isListening ? onStop : onStart}
      disabled={!isSupported}
      aria-label={isListening ? 'Detener dictado' : 'Iniciar dictado de voz'}
    >
      {isListening ? (
        <MicOff className="h-8 w-8" aria-hidden="true" />
      ) : (
        <Mic className="h-8 w-8" aria-hidden="true" />
      )}
      {isListening ? 'Detener dictado' : 'Iniciar dictado de voz'}
    </AccessibleButton>

    <div className="rounded-xl border-2 border-slate-500 bg-slate-900 p-4">
      <p className="mb-2 text-[22px] font-semibold text-white">Texto capturado</p>
      <p className="min-h-[80px] text-[20px] text-slate-100">
        {transcript || 'Presione el boton y dicte productos del inventario.'}
      </p>
    </div>
  </div>
)
