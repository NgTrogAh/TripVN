'use client'

import React from 'react'
import MapView from '@/components/map/map'
import Right from '@/components/assistant/right'
import Left from '@/components/workspace/left'
import Bottom from '@/components/explore/bottom'

export default function Home() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapView />
      <Left />
      <Right />
      <Bottom />
    </div>
  )
}
