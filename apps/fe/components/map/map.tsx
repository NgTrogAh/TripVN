'use client'

import { useEffect, useRef } from 'react'
import maplibregl, { LngLatBoundsLike } from 'maplibre-gl'
import { CiLocationOn } from 'react-icons/ci'

const PANEL_WIDTH = 360
const SAFE_PADDING = 40

const VIETNAM_BOUNDS: LngLatBoundsLike = [
  [102.14441, 8.17966],
  [109.46464, 23.39209],
]

type MapViewProps = Readonly<{
  leftOpen?: boolean
  rightOpen?: boolean
}>

export default function MapView({ leftOpen = true, rightOpen = true }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<maplibregl.Map | null>(null)

  const fitToLayout = (duration = 600) => {
    mapInstance.current?.fitBounds(VIETNAM_BOUNDS, {
      padding: {
        top: SAFE_PADDING,
        bottom: SAFE_PADDING,
        left: leftOpen ? PANEL_WIDTH : SAFE_PADDING,
        right: rightOpen ? PANEL_WIDTH : SAFE_PADDING,
      },
      bearing: 0,
      pitch: 0,
      duration,
    })
  }

  useEffect(() => {
    if (!mapRef.current) return

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: `${process.env.NEXT_PUBLIC_MAP_STYLE}?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      center: [108.2772, 14.0583],
      zoom: 5,
      pitch: 0,
      bearing: 0,
    })

    mapInstance.current = map

    map.on('load', () => {
      fitToLayout(0)
    })

    return () => {
      map.remove()
    }
  }, [])

  useEffect(() => {
    if (!mapInstance.current) return
    fitToLayout()
  }, [leftOpen, rightOpen])

  return (
    <div className="relative h-full w-full">
      {/* Map */}
      <div ref={mapRef} className="h-full w-full" />

      <div className="absolute right-6 top-13 z-10 flex flex-col overflow-hidden rounded-full bg-black/70 backdrop-blur-sm">
        <button
          onClick={() => mapInstance.current?.zoomIn()}
          className="flex h-9 w-9 items-center justify-center text-[18px] font-light text-white/90 hover:bg-white/10"
          aria-label="Zoom in"
        >
          +
        </button>

        <div className="h-px bg-white/10" />

        <button
          onClick={() => mapInstance.current?.zoomOut()}
          className="flex h-9 w-9 items-center justify-center text-[18px] font-light text-white/90 hover:bg-white/10"
          aria-label="Zoom out"
        >
          –
        </button>
      </div>

      <button
        onClick={() => fitToLayout()}
        className="absolute right-6 top-33 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white/90 backdrop-blur-sm hover:bg-black/85"
        aria-label="Về Việt Nam"
      >
        <CiLocationOn size={18} />
      </button>
    </div>
  )
}
