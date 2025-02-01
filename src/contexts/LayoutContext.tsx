'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { LayoutConfig, LayoutViewType } from '../types/layouts'

interface LayoutContextType {
  layouts: LayoutConfig[]
  currentLayout: LayoutConfig | null
  setCurrentLayout: (layoutId: string) => void
  addLayout: (layout: Omit<LayoutConfig, 'id'>) => void
  updateLayout: (layout: LayoutConfig) => void
  deleteLayout: (layoutId: string) => void
  duplicateLayout: (layoutId: string) => void
}

const defaultLayouts: LayoutConfig[] = [
  {
    id: 'default-calendar',
    name: 'Standard Calendar',
    type: 'calendar',
    columns: [
      { id: 'date', type: 'date', title: 'Date', visible: true, order: 0 },
      { id: 'content', type: 'content', title: 'Content', visible: true, order: 1 },
      { id: 'platforms', type: 'platforms', title: 'Platforms', visible: true, order: 2 },
      { id: 'status', type: 'status', title: 'Status', visible: true, order: 3 }
    ],
    filters: {},
    preferences: {
      compactView: false,
      showAnalytics: true,
      showPreviews: true,
      enableDragDrop: true,
    }
  },
  {
    id: 'default-timeline',
    name: 'Timeline View',
    type: 'timeline',
    columns: [
      { id: 'time', type: 'time', title: 'Time', visible: true, order: 0 },
      { id: 'content', type: 'content', title: 'Content', visible: true, order: 1 },
      { id: 'platforms', type: 'platforms', title: 'Platforms', visible: true, order: 2 },
      { id: 'media', type: 'media', title: 'Media', visible: true, order: 3 },
      { id: 'analytics', type: 'analytics', title: 'Analytics', visible: false, order: 4 }
    ],
    filters: {},
    preferences: {
      compactView: true,
      showAnalytics: false,
      showPreviews: true,
      enableDragDrop: true,
      refreshInterval: 30000
    }
  }
]

const LayoutContext = createContext<LayoutContextType | null>(null)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [layouts, setLayouts] = useState<LayoutConfig[]>(defaultLayouts)
  const [currentLayout, setCurrentLayoutState] = useState<LayoutConfig>(defaultLayouts[0])

  const setCurrentLayout = useCallback((layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId)
    if (layout) {
      setCurrentLayoutState(layout)
    }
  }, [layouts])

  const addLayout = useCallback((layoutData: Omit<LayoutConfig, 'id'>) => {
    const newLayout: LayoutConfig = {
      ...layoutData,
      id: Math.random().toString(36).substr(2, 9)
    }
    setLayouts(prev => [...prev, newLayout])
  }, [])

  const updateLayout = useCallback((updatedLayout: LayoutConfig) => {
    setLayouts(prev =>
      prev.map(layout =>
        layout.id === updatedLayout.id ? updatedLayout : layout
      )
    )
    if (currentLayout?.id === updatedLayout.id) {
      setCurrentLayoutState(updatedLayout)
    }
  }, [currentLayout?.id])

  const deleteLayout = useCallback((layoutId: string) => {
    setLayouts(prev => prev.filter(layout => layout.id !== layoutId))
    if (currentLayout?.id === layoutId) {
      setCurrentLayoutState(layouts[0])
    }
  }, [currentLayout?.id, layouts])

  const duplicateLayout = useCallback((layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId)
    if (layout) {
      const duplicate: LayoutConfig = {
        ...layout,
        id: Math.random().toString(36).substr(2, 9),
        name: `${layout.name} (Copy)`,
      }
      setLayouts(prev => [...prev, duplicate])
    }
  }, [layouts])

  return (
    <LayoutContext.Provider
      value={{
        layouts,
        currentLayout,
        setCurrentLayout,
        addLayout,
        updateLayout,
        deleteLayout,
        duplicateLayout,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}