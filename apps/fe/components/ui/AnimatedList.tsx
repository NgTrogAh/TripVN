'use client'

import React, { type MouseEventHandler, type ReactNode, type UIEvent, useCallback, useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'

interface AnimatedItemProps {
  id: string
  children: ReactNode
  delay?: number
  scrollSpeed?: number
  onMouseEnter?: MouseEventHandler<HTMLDivElement>
  onClick?: MouseEventHandler<HTMLDivElement>
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({ id, children, delay = 0, scrollSpeed = 0, onMouseEnter, onClick }) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.25 })

  const speedFactor = Math.min(scrollSpeed, 2)
  const dynamicDelay = delay + speedFactor * 0.12

  return (
    <motion.div
      ref={ref}
      data-id={id}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{
        scale: 0.85,
        opacity: 0,
      }}
      animate={
        inView
          ? {
              scale: 1,
              opacity: 1,
            }
          : {
              scale: 0.85,
              opacity: 0,
            }
      }
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: dynamicDelay,
      }}
      className="mb-3"
    >
      {children}
    </motion.div>
  )
}

interface AnimatedListProps {
  items?: string[]
  children?: ReactNode
  onItemSelect?: (item: string, index: number) => void
  showGradients?: boolean
  enableArrowNavigation?: boolean
  displayScrollbar?: boolean
  className?: string
  itemClassName?: string
  initialSelectedIndex?: number
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  items = [],
  children,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  displayScrollbar = true,
  className = '',
  itemClassName = '',
  initialSelectedIndex = -1,
}) => {
  const listRef = useRef<HTMLDivElement>(null)

  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex)
  const [keyboardNav, setKeyboardNav] = useState(false)
  const [topGradientOpacity, setTopGradientOpacity] = useState(0)
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1)
  const [scrollSpeed, setScrollSpeed] = useState(0)

  const lastScrollTop = useRef(0)
  const lastScrollTime = useRef(Date.now())

  const handleItemMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const handleItemClick = useCallback(
    (item: string, index: number) => {
      setSelectedIndex(index)
      onItemSelect?.(item, index)
    },
    [onItemSelect],
  )

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget

    const now = Date.now()
    const dy = Math.abs(scrollTop - lastScrollTop.current)
    const dt = now - lastScrollTime.current || 1

    setScrollSpeed(Math.min(dy / dt, 2))

    lastScrollTop.current = scrollTop
    lastScrollTime.current = now

    setTopGradientOpacity(Math.min(scrollTop / 40, 1))
    const bottomDistance = scrollHeight - (scrollTop + clientHeight)
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 40, 1))
  }

  useEffect(() => {
    if (!enableArrowNavigation || children || items.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex(v => Math.min(v + 1, items.length - 1))
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex(v => Math.max(v - 1, 0))
      }

      if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault()
        onItemSelect?.(items[selectedIndex], selectedIndex)
      }
    }

    globalThis.addEventListener('keydown', handleKeyDown)
    return () => globalThis.removeEventListener('keydown', handleKeyDown)
  }, [enableArrowNavigation, items, selectedIndex, onItemSelect, children])

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current || children) return

    const container = listRef.current
    const target = container.querySelector(`[data-id="item-${selectedIndex}"]`)

    if (!(target instanceof HTMLElement)) {
      setKeyboardNav(false)
      return
    }

    const extra = 40
    const top = target.offsetTop
    const bottom = top + target.offsetHeight

    if (top < container.scrollTop + extra) {
      container.scrollTo({ top: top - extra, behavior: 'smooth' })
    } else if (bottom > container.scrollTop + container.clientHeight - extra) {
      container.scrollTo({
        top: bottom - container.clientHeight + extra,
        behavior: 'smooth',
      })
    }

    setKeyboardNav(false)
  }, [keyboardNav, selectedIndex, children])

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div
        ref={listRef}
        className={`h-full overflow-y-auto p-4 ${
          displayScrollbar
            ? '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#060010] [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-thumb]:rounded-sm'
            : 'scrollbar-hide'
        }`}
        onScroll={handleScroll}
        style={{
          scrollbarWidth: displayScrollbar ? 'thin' : 'none',
          scrollbarColor: '#222 #060010',
        }}
      >
        {children}

        {children === undefined &&
          items.map((item, index) => {
            const id = `item-${index}`

            return (
              <AnimatedItem
                key={id}
                id={id}
                delay={index * 0.06}
                scrollSpeed={scrollSpeed}
                onMouseEnter={() => handleItemMouseEnter(index)}
                onClick={() => handleItemClick(item, index)}
              >
                <div className={`rounded-lg bg-[#111] p-4 ${selectedIndex === index ? 'bg-[#222]' : ''} ${itemClassName}`}>
                  <p className="m-0 text-white">{item}</p>
                </div>
              </AnimatedItem>
            )
          })}
      </div>

      {showGradients && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-[#060010] to-transparent transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-[#060010] to-transparent transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  )
}

export { AnimatedItem }
export default AnimatedList
