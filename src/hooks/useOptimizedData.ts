'use client'

import { useEffect, useCallback, useRef } from 'react'
import { performanceMonitor } from '../utils/performance'

export function useOptimizedData<T>(
  data: T[],
  pageSize: number = 20,
  keyField: keyof T = 'id'
) {
  const cache = useRef(new Map<string, T>())
  const virtualizer = useRef({
    start: 0,
    end: pageSize,
  })

  // Initialize cache
  useEffect(() => {
    performanceMonitor.mark('cache_init_start')
    data.forEach(item => {
      const key = String(item[keyField])
      if (!cache.current.has(key)) {
        cache.current.set(key, item)
      }
    })
    performanceMonitor.mark('cache_init_end')
    performanceMonitor.measure('cache_init_start', 'cache_init_end')
  }, [data, keyField])

  // Virtualized data access
  const getVisibleData = useCallback(() => {
    performanceMonitor.mark('data_access_start')
    const visibleData = data.slice(
      virtualizer.current.start,
      virtualizer.current.end
    )
    performanceMonitor.mark('data_access_end')
    performanceMonitor.measure('data_access_start', 'data_access_end')
    return visibleData
  }, [data])

  // Optimized data lookup
  const getItemById = useCallback((id: string): T | undefined => {
    performanceMonitor.mark('item_lookup_start')
    const item = cache.current.get(id)
    performanceMonitor.mark('item_lookup_end')
    performanceMonitor.measure('item_lookup_start', 'item_lookup_end')
    return item
  }, [])

  // Update virtualization window
  const setVisibleRange = useCallback((start: number, end: number) => {
    virtualizer.current = { start, end }
  }, [])

  // Clear cache when needed
  const clearCache = useCallback(() => {
    cache.current.clear()
  }, [])

  return {
    getVisibleData,
    getItemById,
    setVisibleRange,
    clearCache,
  }
}

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debounced
}

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T {
  const cache = useRef(new Map<string, any>())

  return useCallback((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.current.has(key)) {
      return cache.current.get(key)
    }

    const result = callback(...args)
    cache.current.set(key, result)
    return result
  }, dependencies) as T
}