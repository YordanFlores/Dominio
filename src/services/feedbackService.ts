export const playSuccessTone = () => {
  const audioContext = new window.AudioContext()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
  gainNode.gain.setValueAtTime(0.001, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + 0.05)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.32)

  oscillator.onended = () => {
    audioContext.close().catch(() => undefined)
  }
}

export const speakFeedback = (message: string, language = 'es-ES') => {
  if (!window.speechSynthesis) {
    return
  }

  const pickSpanishVoice = () => {
    const voices = window.speechSynthesis.getVoices()
    const exactPriority = ['es-ES', 'es-MX', 'es-US', 'es-419']

    for (const langCode of exactPriority) {
      const voice = voices.find((item) => item.lang.toLowerCase() === langCode.toLowerCase())
      if (voice) {
        return voice
      }
    }

    return voices.find((item) => item.lang.toLowerCase().startsWith('es'))
  }

  const speak = () => {
    const spanishVoice = pickSpanishVoice()

    const utterance = new SpeechSynthesisUtterance(message)
    utterance.lang = 'es-ES'
    if (spanishVoice) {
      utterance.voice = spanishVoice
      utterance.lang = spanishVoice.lang || language
    }
    utterance.rate = 1
    utterance.pitch = 1

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      speak()
      window.speechSynthesis.onvoiceschanged = null
    }
    return
  }

  speak()
}
