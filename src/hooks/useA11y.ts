'use client'

import { useCallback, useEffect } from 'react'

export function useA11y() {
  // Handle keyboard navigation
  const handleKeyboardNavigation = useCallback((e: KeyboardEvent) => {
    // Handle Escape key
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('[role="dialog"]')
      if (modals.length > 0) {
        const closeButton = modals[modals.length - 1].querySelector('[aria-label="Close"]')
        if (closeButton instanceof HTMLElement) {
          closeButton.click()
        }
      }
    }

    // Handle Tab key for focus trapping in modals
    if (e.key === 'Tab') {
      const activeModal = document.querySelector('[role="dialog"]')
      if (activeModal) {
        const focusableElements = activeModal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstFocusable = focusableElements[0]
        const lastFocusable = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault()
          if (lastFocusable instanceof HTMLElement) {
            lastFocusable.focus()
          }
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault()
          if (firstFocusable instanceof HTMLElement) {
            firstFocusable.focus()
          }
        }
      }
    }
  }, [])

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardNavigation)
    return () => {
      window.removeEventListener('keydown', handleKeyboardNavigation)
    }
  }, [handleKeyboardNavigation])

  // Handle focus restoration
  const useFocusReturn = (isOpen: boolean) => {
    useEffect(() => {
      const lastFocusedElement = document.activeElement

      return () => {
        if (!isOpen && lastFocusedElement instanceof HTMLElement) {
          lastFocusedElement.focus()
        }
      }
    }, [isOpen])
  }

  // Handle screen reader announcements
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.classList.add('sr-only')
    document.body.appendChild(announcement)

    // Wait a frame to ensure the element is in the DOM
    requestAnimationFrame(() => {
      announcement.textContent = message
    })

    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 3000)
  }, [])

  return {
    useFocusReturn,
    announce,
  }
}

// Utility for managing focus within a modal
export function useModalFocus(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return

    const activeElement = document.activeElement
    const handleFocus = (e: FocusEvent) => {
      const modal = document.querySelector('[role="dialog"]')
      if (modal && !modal.contains(e.target as Node)) {
        const firstFocusable = modal.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (firstFocusable instanceof HTMLElement) {
          firstFocusable.focus()
        }
      }
    }

    document.addEventListener('focus', handleFocus, true)
    return () => {
      document.removeEventListener('focus', handleFocus, true)
      if (activeElement instanceof HTMLElement) {
        activeElement.focus()
      }
    }
  }, [isOpen])
}

// Utility for handling keyboard shortcuts
export function useKeyboardShortcut(key: string, callback: () => void, ctrl = false, shift = false) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        e.ctrlKey === ctrl &&
        e.shiftKey === shift &&
        !e.altKey &&
        !e.metaKey
      ) {
        e.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, callback, ctrl, shift])
}