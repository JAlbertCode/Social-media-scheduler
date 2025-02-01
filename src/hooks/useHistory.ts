'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { HistoryManager, HistoryState } from '../utils/history'
import { useHotkeys } from 'react-hotkeys-hook'

interface UseHistoryOptions<T> {
  initialState: T
  maxHistory?: number
  onChange?: (state: T) => void
  onUndoRedo?: (action: 'undo' | 'redo', state: T) => void
}

export function useHistory<T>({
  initialState,
  maxHistory = 50,
  onChange,
  onUndoRedo
}: UseHistoryOptions<T>) {
  const manager = useRef(new HistoryManager<T>(initialState, maxHistory))
  const [currentState, setCurrentState] = useState<T>(initialState)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // Update state capabilities
  const updateStateCapabilities = useCallback(() => {
    setCanUndo(manager.current.canUndo())
    setCanRedo(manager.current.canRedo())
  }, [])

  // Push new state to history
  const pushState = useCallback((newState: T, description: string) => {
    manager.current.pushState(newState, description)
    setCurrentState(newState)
    updateStateCapabilities()
    onChange?.(newState)
  }, [onChange, updateStateCapabilities])

  // Undo last action
  const undo = useCallback(() => {
    const previousState = manager.current.undo()
    if (previousState) {
      setCurrentState(previousState.data)
      updateStateCapabilities()
      onChange?.(previousState.data)
      onUndoRedo?.('undo', previousState.data)
    }
  }, [onChange, onUndoRedo, updateStateCapabilities])

  // Redo last undone action
  const redo = useCallback(() => {
    const nextState = manager.current.redo()
    if (nextState) {
      setCurrentState(nextState.data)
      updateStateCapabilities()
      onChange?.(nextState.data)
      onUndoRedo?.('redo', nextState.data)
    }
  }, [onChange, onUndoRedo, updateStateCapabilities])

  // Get history preview for UI
  const getHistoryPreview = useCallback(() => {
    return manager.current.getHistoryPreview()
  }, [])

  // Set up keyboard shortcuts
  useHotkeys('mod+z', (event) => {
    event.preventDefault()
    undo()
  }, [undo])

  useHotkeys('mod+shift+z', (event) => {
    event.preventDefault()
    redo()
  }, [redo])

  // Set up initial state
  useEffect(() => {
    updateStateCapabilities()
  }, [updateStateCapabilities])

  return {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    getHistoryPreview
  }
}