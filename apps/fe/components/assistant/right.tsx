'use client'

import { useRef, useState } from 'react'
import { Mic, Minimize2, Send } from 'lucide-react'
import { FaAnglesLeft, FaKeyboard } from 'react-icons/fa6'

type AIResponse = {
  transcript?: string
  intent: string
  action_preview?: {
    action_type: string
    payload: any
  }
  message: string
}

type Props = Readonly<{ tripId: string }>

export default function Right({ tripId }: Readonly<Props>) {
  const [open, setOpen] = useState(false)
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice')
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [textValue, setTextValue] = useState('')
  const [resultText, setResultText] = useState<string | null>(null)
  const [actionPreview, setActionPreview] = useState<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const API = process.env.NEXT_PUBLIC_API_BASE!

  const handleAIResponse = (data: AIResponse) => {
    setResultText(data.message ?? data.transcript ?? '')
    setActionPreview(data.action_preview ?? null)
  }

  const handleChat = async () => {
    if (!textValue.trim()) return
    setLoading(true)

    try {
      const res = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textValue }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error("AI chat failed")

      handleAIResponse(data)
    } catch {
      setResultText('AI xử lý thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceStop = async () => {
    setLoading(true)
    try {
      const audioBlob = new Blob(chunksRef.current)
      const form = new FormData()
      form.append('file', audioBlob, 'voice')

      const res = await fetch(`${API}/ai/voice`, {
        method: 'POST',
        body: form,
      })

      const data = await res.json()
      if (!res.ok) throw new Error("AI voice failed")

      handleAIResponse(data)
    } catch {
      setResultText('Voice xử lý thất bại')
    } finally {
      setLoading(false)
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    const recorder = new MediaRecorder(stream)
    chunksRef.current = []

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = handleVoiceStop

    recorder.start()
    mediaRecorderRef.current = recorder
    setRecording(true)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  const confirmAction = async () => {
    if (!actionPreview) return

    setLoading(true)

    try {
      const createRes = await fetch(`${API}/ata/${tripId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionPreview),
      })

      const action = await createRes.json()
      if (!createRes.ok) throw new Error("AI confirm failed")

      await fetch(`${API}/ata/${action.id}/confirm`, {
        method: 'PATCH',
      })

      setResultText('Đã thêm vào lịch trình')
      setActionPreview(null)
    } catch {
      setResultText('Confirm thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
      <>
        {open && (
            <div className="pointer-events-none fixed inset-0 z-30 bg-black/25" />
        )}

        <aside
            className={`fixed z-40 right-6 top-6 bottom-12 w-135 transition-all duration-500 ${
                open
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-full opacity-0 pointer-events-none'
            }`}
        >
          <div className="relative flex h-full flex-col rounded-[35px] bg-black text-white">

            <div className="absolute left-4 top-4">
              <button
                  onClick={() => setOpen(false)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-950/60 text-orange-400"
              >
                <Minimize2 />
              </button>
            </div>

            <div className="flex-1 px-4 pt-20 space-y-4">
              {loading && <p>AI đang xử lý...</p>}
              {resultText && <p>{resultText}</p>}

              {actionPreview && (
                  <div className="rounded-xl bg-white/10 p-4 text-sm">
                    <p>AI đề xuất:</p>
                    <pre className="text-xs mt-2">
                  {JSON.stringify(actionPreview, null, 2)}
                </pre>
                    <button
                        onClick={confirmAction}
                        disabled={actionPreview?.action_type === 'SUGGEST'}
                        className="mt-3 rounded-lg bg-orange-600 px-4 py-2 disabled:opacity-40"
                    >
                      Confirm
                    </button>
                  </div>
              )}
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center gap-3 rounded-3xl bg-white/5 p-2">

                <button
                    onClick={() => {
                      if (inputMode === 'voice') {
                        if (recording) {
                          stopRecording()
                        } else {
                          startRecording()
                        }
                      } else {
                        setInputMode('voice')
                      }
                    }}
                    className={`flex items-center gap-3 rounded-full transition-all ${
                        inputMode === 'voice'
                            ? 'flex-1 bg-white/10 px-4 py-3'
                            : 'h-12 w-12 justify-center bg-orange-950/60'
                    }`}
                >
                  <Mic className={recording ? 'text-red-400' : 'text-white'} />
                  {inputMode === 'voice' && (
                      <span>
                    {recording ? 'Đang nghe…' : 'Nói với TripVN'}
                  </span>
                  )}
                </button>

                <button
                    onClick={() => setInputMode('text')}
                    className={`flex items-center gap-3 rounded-full transition-all ${
                        inputMode === 'text'
                            ? 'flex-1 bg-white/10 px-4 py-3'
                            : 'h-12 w-12 justify-center bg-orange-950/60'
                    }`}
                >
                  {inputMode === 'text' ? (
                      <>
                        <input
                            value={textValue}
                            onChange={e => setTextValue(e.target.value)}
                            placeholder="Nhập yêu cầu của bạn..."
                            className="flex-1 bg-transparent outline-none placeholder:text-white/40"
                        />
                        <Send
                            onClick={handleChat}
                            className="cursor-pointer"
                        />
                      </>
                  ) : (
                      <FaKeyboard />
                  )}
                </button>

              </div>
            </div>
          </div>
        </aside>

        {!open && (
            <button
                onClick={() => setOpen(true)}
                className="fixed right-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white"
            >
              <FaAnglesLeft size={18} />
            </button>
        )}
      </>
  )
}