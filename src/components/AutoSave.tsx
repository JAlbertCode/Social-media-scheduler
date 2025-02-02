'use client'

import { useEffect, useRef, useState } from 'react'
import { Box, Text, useToast } from '@chakra-ui/react'
import debounce from 'lodash/debounce'

interface Draft {
  content: string
  mediaFiles: Array<{
    preview: string
    type: 'image' | 'video'
  }>
  platforms: string[]
  scheduledTime?: string
  lastSaved: number
}

interface AutoSaveProps {
  content: string
  mediaFiles: any[]
  platforms: string[]
  scheduledTime?: string
  onRestore: (draft: Omit<Draft, 'lastSaved'>) => void
}

const AUTOSAVE_DELAY = 1000 // 1 second
const DRAFT_KEY = 'social_scheduler_draft'

export function AutoSave({ content, mediaFiles, platforms, scheduledTime, onRestore }: AutoSaveProps) {
  const toast = useToast()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const previousContent = useRef(content)

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (savedDraft) {
      try {
        const draft: Draft = JSON.parse(savedDraft)
        // Only restore if draft is less than 24 hours old
        if (Date.now() - draft.lastSaved < 24 * 60 * 60 * 1000) {
          toast({
            title: 'Draft found',
            description: 'Would you like to restore your previous draft?',
            status: 'info',
            duration: null,
            isClosable: true,
            position: 'bottom-right',
            action: (
              <Box>
                <Text
                  color="blue.500"
                  cursor="pointer"
                  onClick={() => {
                    onRestore({
                      content: draft.content,
                      mediaFiles: draft.mediaFiles,
                      platforms: draft.platforms,
                      scheduledTime: draft.scheduledTime,
                    })
                    localStorage.removeItem(DRAFT_KEY)
                    toast.closeAll()
                  }}
                >
                  Restore
                </Text>
              </Box>
            ),
          })
        } else {
          // Delete old draft
          localStorage.removeItem(DRAFT_KEY)
        }
      } catch (error) {
        console.error('Error parsing draft:', error)
        localStorage.removeItem(DRAFT_KEY)
      }
    }
  }, [onRestore, toast])

  // Save draft when content changes
  useEffect(() => {
    const saveDraft = debounce(() => {
      // Only save if content has changed
      if (content !== previousContent.current) {
        const draft: Draft = {
          content,
          mediaFiles,
          platforms,
          scheduledTime,
          lastSaved: Date.now(),
        }
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
        setLastSaved(new Date())
        previousContent.current = content
      }
    }, AUTOSAVE_DELAY)

    if (content) {
      saveDraft()
    }

    return () => {
      saveDraft.cancel()
    }
  }, [content, mediaFiles, platforms, scheduledTime])

  // Clear draft when content is empty
  useEffect(() => {
    if (!content && !mediaFiles.length) {
      localStorage.removeItem(DRAFT_KEY)
      setLastSaved(null)
    }
  }, [content, mediaFiles])

  if (!lastSaved) return null

  return (
    <Text
      fontSize="xs"
      color="gray.500"
      position="absolute"
      bottom={2}
      left={2}
    >
      Last saved {lastSaved.toLocaleTimeString()}
    </Text>
  )
}