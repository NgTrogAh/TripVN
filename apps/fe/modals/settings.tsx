'use client'

import { useEffect, useRef, useState } from 'react'
import AnimatedList, { AnimatedItem } from '@/components/ui/AnimatedList'

type SettingsProps = {
  readonly open: boolean
  readonly onCloseAction: () => void
}

export default function Settings({ open, onCloseAction }: SettingsProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const cornerHeaderRef = useRef<HTMLHeadingElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)

  const [showCenterHeader, setShowCenterHeader] = useState(false)

  useEffect(() => {
    if (!cornerHeaderRef.current || !scrollRef.current) return

    const observer = new IntersectionObserver(([entry]) => setShowCenterHeader(!entry.isIntersecting), { root: scrollRef.current, threshold: 1 })

    observer.observe(cornerHeaderRef.current)
    return () => observer.disconnect()
  }, [open])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseAction()
    }

    const onMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onCloseAction()
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onMouseDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [open, onCloseAction])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/65">
      <div className="flex h-full items-center justify-center">
        <div ref={modalRef} className="relative h-[82vh] w-270 max-w-[80vw] overflow-hidden rounded-[40px] bg-[#141414]">
          <AnimatedList className="relative h-full w-full" showGradients={true}>
            <div ref={scrollRef} className="relative h-full overflow-y-auto no-scrollbar px-5 pb-25 pt-0.5 text-white">
              <h1 ref={cornerHeaderRef} className="mb-10 text-[30px]">
                Cài đặt
              </h1>

              <SettingsSection title="TÙY CHỈNH">
                <SettingItem label="Tiền tệ" value="Đồng Việt Nam" />
                <SettingItem label="Đơn vị khoảng cách" value="Kilômét" />
                <SettingItem label="Ngôn ngữ" value="Tiếng Việt" />
              </SettingsSection>

              <SettingsSection title="QUẢN LÝ">
                <SettingItem label="Danh sách chuyến đi" value="5 chuyến" />
                <SettingItem label="Nhật ký du lịch" value="Bật" />
              </SettingsSection>
              <SettingsSection title="TÙY CHỈNH">
                <SettingItem label="Tiền tệ" value="Đồng Việt Nam" />
                <SettingItem label="Đơn vị khoảng cách" value="Kilômét" />
                <SettingItem label="Ngôn ngữ" value="Tiếng Việt" />
              </SettingsSection>

              <SettingsSection title="QUẢN LÝ">
                <SettingItem label="Danh sách chuyến đi" value="5 chuyến" />
                <SettingItem label="Nhật ký du lịch" value="Bật" />
              </SettingsSection>
              <SettingsSection title="TÙY CHỈNH">
                <SettingItem label="Tiền tệ" value="Đồng Việt Nam" />
                <SettingItem label="Đơn vị khoảng cách" value="Kilômét" />
                <SettingItem label="Ngôn ngữ" value="Tiếng Việt" />
              </SettingsSection>
            </div>

            {showCenterHeader && (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-40">
                <div className="absolute inset-x-0 top-0 h-30 bg-linear-to-b from-[#141414] via-[#141414]/80 to-transparent" />
                <div className="relative flex h-20 items-center justify-center">
                  <span className="text-[15px] text-white/90">Cài đặt</span>
                </div>
              </div>
            )}
          </AnimatedList>
        </div>
      </div>
    </div>
  )
}

function SettingsSection({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="mb-4 pl-10 text-[12px] tracking-[0.30em] text-white/30">{title}</div>
      <div className="overflow-hidden rounded-[25px] bg-white/4">{children}</div>
    </div>
  )
}

function SettingItem({ label, value }: { readonly label: string; readonly value?: string }) {
  return (
    <AnimatedItem id={label}>
      <button type="button" className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-white/6">
        <span className="text-[15px] text-white/95">{label}</span>
        {value && <span className="text-[13px] text-white/40">{value}</span>}
      </button>
    </AnimatedItem>
  )
}
