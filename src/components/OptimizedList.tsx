'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Box, VStack } from '@chakra-ui/react'
import { useOptimizedData, useDebounce } from '../hooks/useOptimizedData'
import { performanceMonitor } from '../utils/performance'

interface OptimizedListProps<T> {
  data: T[]
  renderItem: (item: T) => React.ReactNode
  itemHeight: number
  containerHeight: number
  keyField?: keyof T
  onItemVisible?: (item: T) => void
}

export function OptimizedList<T>({
  data,
  renderItem,
  itemHeight,
  containerHeight,
  keyField = 'id' as keyof T,
  onItemVisible
}: OptimizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const { getVisibleData, setVisibleRange } = useOptimizedData(data, 20, keyField)

  // Calculate visible range based on scroll position
  const updateVisibleRange = useDebounce(() => {
    performanceMonitor.mark('range_calc_start')
    
    if (!containerRef.current) return

    const start = Math.floor(scrollTop / itemHeight)
    const visibleItems = Math.ceil(containerHeight / itemHeight)
    const buffer = Math.floor(visibleItems / 2) // Add buffer for smooth scrolling
    
    const rangeStart = Math.max(0, start - buffer)
    const rangeEnd = Math.min(data.length, start + visibleItems + buffer)
    
    setVisibleRange(rangeStart, rangeEnd)
    
    performanceMonitor.mark('range_calc_end')
    performanceMonitor.measure('range_calc_start', 'range_calc_end')
  }, 16) // Debounce to target 60fps

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  // Update visible items when scroll position changes
  useEffect(() => {
    updateVisibleRange()
  }, [scrollTop, updateVisibleRange])

  // Initial setup and cleanup performance monitoring
  useEffect(() => {
    performanceMonitor.mark('list_init_start')
    updateVisibleRange()
    
    return () => {
      performanceMonitor.mark('list_init_end')
      performanceMonitor.measure('list_init_start', 'list_init_end')
    }
  }, [])

  const visibleData = getVisibleData()
  const totalHeight = data.length * itemHeight
  const offsetY = Math.floor(scrollTop / itemHeight) * itemHeight

  return (
    <Box
      ref={containerRef}
      height={containerHeight}
      overflowY="auto"
      position="relative"
      onScroll={handleScroll}
    >
      <VStack
        spacing={0}
        height={totalHeight}
        position="relative"
        width="100%"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height={offsetY}
        />
        {visibleData.map((item) => (
          <Box
            key={String(item[keyField])}
            width="100%"
            height={itemHeight}
            position="absolute"
            top={offsetY}
            left={0}
            right={0}
          >
            {renderItem(item)}
          </Box>
        ))}
      </VStack>
    </Box>
  )
}