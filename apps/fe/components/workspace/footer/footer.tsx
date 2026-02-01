'use client'

import type { WorkspaceMode } from '@/types/ui'
import SearchTrips from './searchTrips'
import OverviewTrips from './overviewTrips'
import AddTrips from './addTrips'

type Props = Readonly<{
  mode: WorkspaceMode
  onSelectMode: (mode: WorkspaceMode) => void
}>

export default function Footer({ mode, onSelectMode }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe">
      <div className="mx-auto max-w-2xl pb-4">
        <div className="flex items-center gap-2 rounded-[28px] bg-black/85 px-2 py-2 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_24px_rgba(0,0,0,0.55)]">
          <div className="shrink-0">
            <SearchTrips active={mode === 'search'} onPress={() => onSelectMode('search')} />
          </div>
          <div className="flex-1 min-w-0">
            <OverviewTrips active={mode === 'overview'} onPress={() => onSelectMode('overview')} />
          </div>
          <div className="shrink-0">
            <AddTrips onPress={() => onSelectMode('add')} />
          </div>
        </div>
      </div>
    </div>
  )
}
