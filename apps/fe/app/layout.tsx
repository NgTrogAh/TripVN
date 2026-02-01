import React from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@/styles/globals.css'
import { Playfair_Display } from 'next/font/google'

const font = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
})

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${font.variable} h-screen w-screen overflow-hidden bg-black font-sans`}>{children}</body>
    </html>
  )
}
