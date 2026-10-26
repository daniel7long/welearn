import { useCallback, useEffect, useRef, useState } from 'react'

/** Downscale a photo so a handful of them fit comfortably in localStorage. */
export async function photoToDataURL(file: File, maxSide = 720): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Could not read that image.'))
      img.src = url
    })
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.7)
  } finally {
    URL.revokeObjectURL(url)
  }
}

const blobToDataURL = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })

export const MAX_RECORD_SECONDS = 60

/** Minimal voice-note recorder built on MediaRecorder. */
export function useRecorder() {
  const [state, setState] = useState<'idle' | 'recording' | 'done'>('idle')
  const [seconds, setSeconds] = useState(0)
  const [audio, setAudio] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()
  const rec = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const timer = useRef<number | undefined>(undefined)

  const cleanup = useCallback(() => {
    window.clearInterval(timer.current)
    rec.current?.stream.getTracks().forEach((t) => t.stop())
  }, [])
  useEffect(() => cleanup, [cleanup])

  const stop = useCallback(() => {
    if (rec.current && rec.current.state !== 'inactive') rec.current.stop()
  }, [])

  const start = useCallback(async () => {
    setError(undefined)
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Voice recording isn’t supported in this browser.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const r = new MediaRecorder(stream)
      chunks.current = []
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
      r.onstop = async () => {
        cleanup()
        const blob = new Blob(chunks.current, { type: r.mimeType || 'audio/webm' })
        try {
          setAudio(await blobToDataURL(blob))
          setState('done')
        } catch {
          setError('Could not save the recording.')
          setState('idle')
        }
      }
      rec.current = r
      r.start()
      setSeconds(0)
      setState('recording')
      timer.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_RECORD_SECONDS) stop()
          return s + 1
        })
      }, 1000)
    } catch {
      setError('Microphone access was blocked. Allow it in your browser to record.')
    }
  }, [cleanup, stop])

  const discard = useCallback(() => {
    setAudio(undefined)
    setSeconds(0)
    setState('idle')
  }, [])

  return { state, seconds, audio, error, start, stop, discard }
}
