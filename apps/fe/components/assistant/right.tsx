'use client'

import { useRef, useState } from 'react'
import { Mic, Minimize2, Send } from 'lucide-react'
import { FaAnglesLeft, FaKeyboard } from 'react-icons/fa6'

type VoiceResponse = {
  transcript: string
  intent: string
  action_preview?: any
  message: string
}

export default function Right() {
  const [open, setOpen] = useState(false)
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice')
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultText, setResultText] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const getMimeType = () => {
    if (globalThis.window === undefined) return undefined

    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      return 'audio/webm;codecs=opus'
    }

    if (MediaRecorder.isTypeSupported('audio/mp4')) {
      return 'audio/mp4'
    }

    return undefined
  }

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    const recorder = new MediaRecorder(stream, {
      mimeType: getMimeType(),
    })

    chunksRef.current = []

    recorder.ondataavailable = e => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    recorder.onstop = async () => {
      setLoading(true)
      try {
        const audioBlob = new Blob(chunksRef.current)
        const form = new FormData()
        form.append('file', audioBlob, 'voice')

        const res = await fetch(
            process.env.NEXT_PUBLIC_API_BASE + '/ai/voice',
            {
              method: 'POST',
              body: form,
            }
        )

        const data = (await res.json()) as VoiceResponse

        if (!res.ok) {
          throw new Error('voice_failed')
        }

        setResultText(data.transcript)
      } catch {
        setResultText('Không có dữ liệu phù hợp trong hệ thống')
      } finally {
        setLoading(false)
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
    }

    recorder.start()
    mediaRecorderRef.current = recorder
    setRecording(true)
  }

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return
    recorder.stop()
    setRecording(false)
  }

  const handleVoiceClick = () => {
    if (inputMode !== 'voice') {
      setInputMode('voice')
      return
    }
    recording ? stopRecording() : startRecording()
  }

  return (
      <>
        {open && (
            <div
                className="pointer-events-none fixed inset-0 z-30 bg-black/25"
                aria-hidden
            />
        )}

        <aside
            className={`
          fixed z-40 right-6 top-6 bottom-12 w-135
          transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]
          ${open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}
        `}
        >
          <div className="relative flex h-full w-full flex-col rounded-[35px] bg-black">
            <div className="absolute left-4 top-4 z-10">
              <button
                  onClick={() => setOpen(false)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-950/60 text-orange-400 hover:bg-orange-950/80"
              >
                <Minimize2 className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 px-4 pt-20 text-white/80">
              {loading && <p>AI đang xử lý dữ liệu…</p>}
              {resultText && <p>{resultText}</p>}
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center gap-3 rounded-3xl bg-white/5 p-2">
                <button
                    onClick={handleVoiceClick}
                    className={`
                  flex items-center gap-3 overflow-hidden rounded-full transition-all
                  ${inputMode === 'voice' ? 'flex-1 bg-white/10 px-4 py-3' : 'h-12 w-12 justify-center bg-orange-950/60'}
                `}
                >
                  <Mic
                      className={`h-6 w-6 ${
                          recording ? 'text-red-400' : 'text-white'
                      }`}
                  />
                  {inputMode === 'voice' && (
                      <span className="text-white/80">
                    {recording ? 'Đang nghe…' : 'Nói với TripVN'}
                  </span>
                  )}
                </button>

                <button
                    onClick={() => setInputMode('text')}
                    className={`
                  flex items-center gap-3 overflow-hidden rounded-full transition-all
                  ${inputMode === 'text' ? 'flex-1 bg-white/10 px-4 py-3' : 'h-12 w-12 justify-center bg-orange-950/60'}
                `}
                >
                  {inputMode === 'text' ? (
                      <>
                        <input
                            placeholder="Nhập yêu cầu của bạn..."
                            className="flex-1 bg-transparent text-white outline-none placeholder:text-white/40"
                        />
                        <Send className="h-6 w-6 text-white" />
                      </>
                  ) : (
                      <FaKeyboard className="h-6 w-6 text-orange-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {!open && (
            <button
                onClick={() => setOpen(true)}
                className="fixed right-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
            >
              <FaAnglesLeft size={18} />
            </button>
        )}
      </>
  )
}
