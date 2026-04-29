import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionResult {
  isFinal: boolean
  0: SpeechRecognitionAlternative
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition
}

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor
    SpeechRecognition?: SpeechRecognitionConstructor
  }
}

interface SpeechHookOptions {
  language?: string
}

interface SpeechHookResult {
  transcript: string
  isListening: boolean
  isSupported: boolean
  error: string | null
  startListening: () => Promise<boolean>
  stopListening: () => void
  resetTranscript: () => void
}

const getSpeechRecognitionConstructor = () =>
  window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null

const mapSpeechError = (errorCode: string): string => {
  const errorMap: Record<string, string> = {
    aborted: 'El dictado fue cancelado.',
    'audio-capture': 'No se detecta microfono. Revise su dispositivo de audio.',
    network: 'No se pudo conectar al servicio de dictado. Revise internet y vuelva a intentar.',
    'not-allowed': 'Permiso de microfono bloqueado. Habilitelo en el navegador.',
    'service-not-allowed': 'El servicio de voz no esta permitido por el navegador.',
    'no-speech': 'No se detecto voz. Hable mas cerca del microfono.',
    'bad-grammar': 'No se pudo procesar el comando de voz.',
    'language-not-supported': 'El idioma de dictado no es compatible en este navegador.',
  }

  return errorMap[errorCode] ?? `Error de dictado: ${errorCode}`
}

const requestMicrophonePermission = async (): Promise<boolean> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    return true
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((track) => track.stop())
    return true
  } catch {
    return false
  }
}

export const useSpeechToText = (options: SpeechHookOptions = {}): SpeechHookResult => {
  const { language = 'es-ES' } = options
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef('')
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSupported = useMemo(() => Boolean(getSpeechRecognitionConstructor()), [])

  useEffect(() => {
    if (!isSupported) {
      return
    }

    const Recognition = getSpeechRecognitionConstructor()
    if (!Recognition) {
      return
    }

    const recognition = new Recognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language

    recognition.onresult = (event) => {
      let interimText = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        if (!result) {
          continue
        }
        const phrase = result[0]?.transcript ?? ''
        if (result.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${phrase}`.trim()
        } else {
          interimText += phrase
        }
      }

      setTranscript(`${finalTranscriptRef.current} ${interimText}`.trim())
    }

    recognition.onerror = (event) => {
      setError(mapSpeechError(event.error))
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [isSupported, language])

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      setError('El navegador no soporta reconocimiento de voz.')
      return false
    }

    const hasMicrophonePermission = await requestMicrophonePermission()
    if (!hasMicrophonePermission) {
      setError('Permiso de microfono denegado. Permita el acceso y vuelva a intentar.')
      return false
    }

    setError(null)
    finalTranscriptRef.current = ''
    setTranscript('')
    try {
      setIsListening(true)
      recognitionRef.current.start()
      return true
    } catch {
      setIsListening(false)
      setError('No se pudo iniciar el dictado. Espere un segundo y vuelva a intentar.')
      return false
    }
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = ''
    setTranscript('')
  }, [])

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
