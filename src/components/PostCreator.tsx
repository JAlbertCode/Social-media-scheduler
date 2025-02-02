'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Text,
  VStack,
  Input,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  useDisclosure,
} from '@chakra-ui/react'

import { PreviewContainer } from './PreviewContainer'
import { HashtagSuggestions } from './HashtagSuggestions'
import { MentionSuggestions } from './MentionSuggestions'
import { PlatformToggle } from './PlatformToggle'
import { PostEditor } from './PostEditor'
import { useA11y, useModalFocus } from '../hooks/useA11y'
import { ErrorBoundary } from './ErrorBoundary'
import { AutoSave } from './AutoSave'
import { countMentions } from '../utils/mentionSuggestions'

export type PlatformType = 'Twitter' | 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube' | 'Bluesky' | 'Threads'

interface MediaFile {
  file: File
  preview: string
  type: 'image' | 'video'
}

interface PostCreatorProps {
  isOpen: boolean
  onClose: () => void
  selectedPlatforms: PlatformType[]
  initialScheduledTime?: Date | null
  onPostCreate?: (post: {
    content: string
    hashtags: string[]
    mentions: string[]
    urls: string[]
    threads?: string[]
    media?: File[]
    scheduledTime?: Date
  }) => void
}

const PLATFORM_LIMITS = {
  Twitter: {
    characterLimit: 280,
    mediaLimit: 4,
  },
  LinkedIn: {
    characterLimit: 3000,
    mediaLimit: 9,
  },
  Instagram: {
    characterLimit: 2200,
    mediaLimit: 10,
  },
  TikTok: {
    characterLimit: 2200,
    mediaLimit: 1,
  },
  YouTube: {
    characterLimit: 1000,
    mediaLimit: 1,
  },
  Bluesky: {
    characterLimit: 300,
    mediaLimit: 4,
  },
  Threads: {
    characterLimit: 500,
    mediaLimit: 10,
  }
}

export function PostCreator({ isOpen, onClose, selectedPlatforms: initialPlatforms, initialScheduledTime, onPostCreate }: PostCreatorProps) {
  const { useFocusReturn, announce } = useA11y()
  useModalFocus(isOpen)
  useFocusReturn(isOpen)

  const [content, setContent] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [mentions, setMentions] = useState<string[]>([])
  const [urls, setUrls] = useState<string[]>([])
  const [threads, setThreads] = useState<string[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(initialPlatforms)
  const [scheduledTime, setScheduledTime] = useState<string>(
    initialScheduledTime ? initialScheduledTime.toISOString().slice(0, 16) : ''
  )
  const [error, setError] = useState<string | null>(null)
  const [cursorPosition, setCursorPosition] = useState<{ top: number; left: number } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { 
    isOpen: isPreviewOpen, 
    onOpen: openPreview, 
    onClose: closePreview 
  } = useDisclosure()

  const validateContent = useCallback((text: string, platforms: PlatformType[]): string | null => {
    for (const platform of platforms) {
      const limit = PLATFORM_LIMITS[platform].characterLimit
      if (text.length > limit) {
        return `Content exceeds ${platform} limit of ${limit} characters`
      }
      
      if (mediaFiles.length > PLATFORM_LIMITS[platform].mediaLimit) {
        return `Too many media items for ${platform}. Maximum is ${PLATFORM_LIMITS[platform].mediaLimit}`
      }

      const mentionsCount = countMentions(text, platform)
      if (!mentionsCount.valid) {
        return mentionsCount.message
      }
    }
    return null
  }, [mediaFiles.length])

  useEffect(() => {
    if (initialScheduledTime) {
      setScheduledTime(initialScheduledTime.toISOString().slice(0, 16))
    }
  }, [initialScheduledTime])

  useEffect(() => {
    return () => {
      mediaFiles.forEach(file => URL.revokeObjectURL(file.preview))
    }
  }, [mediaFiles])

  const handleRestoreDraft = useCallback((draft: {
    content: string
    mediaFiles: MediaFile[]
    platforms: string[]
    scheduledTime?: string
  }) => {
    setContent(draft.content)
    setMediaFiles(draft.mediaFiles)
    if (draft.scheduledTime) {
      setScheduledTime(draft.scheduledTime)
    }
    announce('Draft restored successfully', 'polite')
  }, [announce])

  const handleContentChange = useCallback((text: string) => {
    setContent(text)
    const validationError = validateContent(text, selectedPlatforms)
    setError(validationError)

    if (textareaRef.current) {
      const { selectionStart } = textareaRef.current
      const lines = text.slice(0, selectionStart).split('\n')
      const lineHeight = 24
      const rect = textareaRef.current.getBoundingClientRect()
      
      setCursorPosition({
        top: rect.top + lines.length * lineHeight,
        left: rect.left + (lines[lines.length - 1].length * 8)
      })
    }
  }, [selectedPlatforms, validateContent])

  const handlePlatformToggle = useCallback((platform: PlatformType) => {
    setSelectedPlatforms(current => {
      const newPlatforms = current.includes(platform)
        ? current.filter(p => p !== platform)
        : [...current, platform]
      
      const validationError = validateContent(content, newPlatforms)
      setError(validationError)
      return newPlatforms
    })
  }, [content, validateContent])

  const handleFiles = useCallback((files: MediaFile[]) => {
    setMediaFiles(prev => [...prev, ...files])
    announce(`${files.length} media files added`, 'polite')
  }, [announce])

  const handleHashtagSelect = useCallback((hashtag: string) => {
    let newContent = content
    if (!content.endsWith(' ') && content.length > 0) {
      newContent += ' '
    }
    newContent += hashtag + ' '
    handleContentChange(newContent)
  }, [content, handleContentChange])

  const handleMentionSelect = useCallback((mention: string) => {
    const words = content.split(/\s+/)
    words[words.length - 1] = mention
    const newContent = words.join(' ') + ' '
    handleContentChange(newContent)
    setCursorPosition(null)
  }, [content, handleContentChange])

  const handleCreate = useCallback(() => {
    const validationError = validateContent(content, selectedPlatforms)
    if (validationError) {
      setError(validationError)
      announce(validationError, 'assertive')
      return
    }
    
    if (onPostCreate) {
      onPostCreate({
        content,
        hashtags,
        mentions,
        urls,
        threads: threads.length > 0 ? threads : undefined,
        media: mediaFiles.map(({ file }) => file),
        scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined
      })
    }

    setContent('')
    setHashtags([])
    setMentions([])
    setUrls([])
    setThreads([])
    setMediaFiles([])
    setScheduledTime('')
    onClose()
    announce('Post created successfully', 'assertive')
  }, [content, hashtags, mentions, urls, threads, mediaFiles, scheduledTime, selectedPlatforms, validateContent, onPostCreate, onClose, announce])

  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey)) {
        if (e.key.toLowerCase() === 's') {
          e.preventDefault()
          handleCreate()
        } else if (e.key.toLowerCase() === 'p') {
          e.preventDefault()
          isPreviewOpen ? closePreview() : openPreview()
        }
      }
    }

    window.addEventListener('keydown', handleShortcuts)
    return () => window.removeEventListener('keydown', handleShortcuts)
  }, [handleCreate, isPreviewOpen, closePreview, openPreview])

  return (
    <ErrorBoundary>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent maxW="1000px">
          <ModalHeader borderBottomWidth="1px">
            Create Post
            <Button 
              size="sm" 
              ml={4} 
              onClick={openPreview}
              aria-label="Preview post"
            >
              Preview
            </Button>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Select Platforms</FormLabel>
                <PlatformToggle
                  selectedPlatforms={selectedPlatforms}
                  onTogglePlatform={handlePlatformToggle}
                />
              </FormControl>

              <FormControl>
                <FormLabel>
                  Content
                  <Text as="span" ml={2} fontSize="sm" color="gray.500">
                    {content.length} / {Math.min(...selectedPlatforms.map(p => PLATFORM_LIMITS[p].characterLimit))} characters
                  </Text>
                </FormLabel>
                <Box position="relative">
                  <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    minH="200px"
                    placeholder="What would you like to share?"
                    size="lg"
                  />
                  {cursorPosition && content.split(/\s+/).pop()?.startsWith('@') && (
                    <Box position="absolute" zIndex={10} {...cursorPosition}>
                      <MentionSuggestions
                        content={content}
                        platform={selectedPlatforms[0]}
                        onMentionSelect={handleMentionSelect}
                      />
                    </Box>
                  )}
                  <AutoSave
                    content={content}
                    mediaFiles={mediaFiles}
                    platforms={selectedPlatforms}
                    scheduledTime={scheduledTime}
                    onRestore={handleRestoreDraft}
                  />
                </Box>
              </FormControl>

              <FormControl>
                <FormLabel>Media</FormLabel>
                <PostEditor
                  onSave={(newContent, media) => {
                    handleContentChange(newContent)
                    if (media.length > 0) {
                      handleFiles(media)
                    }
                  }}
                  initialContent={content}
                  initialPlatforms={selectedPlatforms}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Schedule Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  aria-label="Schedule time for post"
                />
              </FormControl>

              {selectedPlatforms.map(platform => (
                <Card key={platform} variant="outline">
                  <CardBody>
                    <Text fontWeight="medium" mb={3}>{platform} Hashtag Suggestions</Text>
                    <HashtagSuggestions
                      content={content}
                      platform={platform}
                      onHashtagSelect={handleHashtagSelect}
                    />
                  </CardBody>
                </Card>
              ))}

              {error && (
                <Alert status="error" rounded="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter borderTopWidth="1px">
            <Button
              colorScheme="blue"
              onClick={handleCreate}
              isDisabled={!!error}
              isFullWidth
              aria-label={scheduledTime ? 'Schedule post' : 'Create post'}
            >
              {scheduledTime ? 'Schedule Post' : 'Create Post'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Drawer
        isOpen={isPreviewOpen}
        placement="right"
        onClose={closePreview}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Post Preview
          </DrawerHeader>

          <DrawerBody>
            <PreviewContainer
              platforms={selectedPlatforms}
              content={content}
              media={mediaFiles}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </ErrorBoundary>
  )
}