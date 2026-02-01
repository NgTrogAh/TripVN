'use client'

import { useState } from 'react'
import { Minimize2, Settings2 } from 'lucide-react'
import { FaAnglesRight } from 'react-icons/fa6'
import Settings from '@//modals/settings'
import type { WorkspaceMode } from '@/types/ui'
import Footer from './footer/footer'

export default function Left() {
  const [open, setOpen] = useState(true)
  const [openSettings, setOpenSettings] = useState(false)
  const [mode, setMode] = useState<WorkspaceMode>('overview')

  return (
    <>
      {open && <div className="pointer-events-none fixed inset-0 z-30 bg-black/25 transition-opacity duration-500" aria-hidden />}

      <aside
        className={`
          fixed z-40 left-6 top-6 bottom-12 w-135
          transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]
          ${open ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}
        `}
      >
        <div className="relative flex h-full w-full flex-col rounded-[35px] bg-black">
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            <button
              onClick={() => setOpenSettings(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-950/60 text-orange-400 transition-colors hover:bg-orange-950/80 hover:text-orange-300"
              aria-label="Open settings"
            >
              <Settings2 className="h-6 w-6" />
            </button>

            <button
              onClick={() => setOpen(false)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-950/60 text-orange-400 transition-colors hover:bg-orange-950/80 hover:text-orange-300"
              aria-label="Close sidebar"
            >
              <Minimize2 className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 px-4 pt-20">
            <div className="w-full"></div>
          </div>

          <Footer mode={mode} onSelectMode={setMode} />
        </div>
      </aside>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed left-4 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white transition-colors hover:bg-black/50"
          aria-label="Open sidebar"
        >
          <FaAnglesRight size={18} />
        </button>
      )}

      <Settings open={openSettings} onCloseAction={() => setOpenSettings(false)} />
    </>
  )
}
