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
  HStack,
  Input,
  useColorModeValue,
  Tag,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react'
import { PostEditor } from './PostEditor'
import { PlatformPreview } from './PlatformPreview'
import { MediaUploader } from './MediaUploader'
import { useA11y, useModalFocus } from '../hooks/useA11y'
import { ErrorBoundary } from './ErrorBoundary'
import { AutoSave } from './AutoSave'

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

const PreviewDrawerContent = ({ content, media, selectedPlatforms, hashtags, mentions }: {
  content: string
  media: MediaFile[]
  selectedPlatforms: PlatformType[]
  hashtags: string[]
  mentions: string[]
}) => {
  return (
    <Box p={4}>
      {selectedPlatforms.map(platform => (
        <Box key={platform} mb={6}>
          <PlatformPreview
            platform={platform}
            content={content}
            hashtags={hashtags}
            mentions={mentions}
            mediaFiles={media}
          />
        </Box>
      ))}
    </Box>
  )
}

export function PostCreator({ isOpen, onClose, selectedPlatforms, initialScheduledTime, onPostCreate }: PostCreatorProps) {
  // Component setup
  const { useFocusReturn, announce } = useA11y()
  useModalFocus(isOpen)
  useFocusReturn(isOpen)

  const [content, setContent] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [mentions, setMentions] = useState<string[]>([])
  const [urls, setUrls] = useState<string[]>([])
  const [threads, setThreads] = useState<string[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [scheduledTime, setScheduledTime] = useState<string>(
    initialScheduledTime ? initialScheduledTime.toISOString().slice(0, 16) : ''
  )

  const { 
    isOpen: isPreviewOpen, 
    onOpen: openPreview, 
    onClose: closePreview 
  } = useDisclosure()

  // Update scheduledTime when initialScheduledTime changes
  useEffect(() => {
    if (initialScheduledTime) {
      setScheduledTime(initialScheduledTime.toISOString().slice(0, 16))
    }
  }, [initialScheduledTime])

  // Cleanup media previews when unmounting
  useEffect(() => {
    return () => {
      mediaFiles.forEach(file => URL.revokeObjectURL(file.preview))
    }
  }, [mediaFiles])

  // Handle draft restore
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
    // Announce to screen readers
    announce('Draft restored successfully', 'polite')
  }, [announce])

  // Parse content for hashtags, mentions, and URLs
  const parseContent = useCallback((text: string) => {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g
    const mentionRegex = /@[\w]+/g
    const urlRegex = /(https?:\/\/[^\s]+)/g

    setHashtags(text.match(hashtagRegex) || [])
    setMentions(text.match(mentionRegex) || [])
    setUrls(text.match(urlRegex) || [])
  }, [])

  // Handle content changes
  const handleContentChange = useCallback((text: string) => {
    setContent(text)
    parseContent(text)
  }, [parseContent])

  // Handle file selection
  const handleFiles = useCallback((files: MediaFile[]) => {
    setMediaFiles(prev => [...prev, ...files])
    // Announce to screen readers
    announce(`${files.length} media files added`, 'polite')
  }, [announce])

  // Handle post creation
  const handleCreate = useCallback(() => {
    const scheduledDate = scheduledTime ? new Date(scheduledTime) : undefined
    
    if (onPostCreate) {
      onPostCreate({
        content,
        hashtags,
        mentions,
        urls,
        threads: threads.length > 0 ? threads : undefined,
        media: mediaFiles.map(({ file }) => file),
        scheduledTime: scheduledDate
      })
    }

    // Reset form
    setContent('')
    setHashtags([])
    setMentions([])
    setUrls([])
    setThreads([])
    setMediaFiles([])
    setScheduledTime('')
    
    // Close modal
    onClose()

    // Announce to screen readers
    announce('Post created successfully', 'assertive')
  }, [content, hashtags, mentions, urls, threads, mediaFiles, scheduledTime, onPostCreate, onClose, announce])

  // Setup keyboard shortcuts
  useEffect(() => {
    const saveShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleCreate()
      }
    }

    const previewShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        if (isPreviewOpen) {
          closePreview()
        } else {
          openPreview()
        }
      }
    }

    window.addEventListener('keydown', saveShortcut)
    window.addEventListener('keydown', previewShortcut)

    return () => {
      window.removeEventListener('keydown', saveShortcut)
      window.removeEventListener('keydown', previewShortcut)
    }
  }, [handleCreate, isPreviewOpen, closePreview, openPreview])

  return (
    <ErrorBoundary>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="2xl"
        aria-label="Create new post"
      >
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
              {/* Platform Tags */}
              <HStack spacing={2}>
                {selectedPlatforms.map(platform => (
                  <Tag key={platform} colorScheme="blue" size="sm">
                    {platform}
                  </Tag>
                ))}
              </HStack>

              {/* Main Editor */}
              <Box position="relative">
                <PostEditor
                  onSave={(newContent, media, platforms) => {
                    handleContentChange(newContent)
                    if (media.length > 0) {
                      handleFiles(media)
                    }
                  }}
                  initialContent={content}
                  initialPlatforms={selectedPlatforms}
                />
                <AutoSave
                  content={content}
                  mediaFiles={mediaFiles}
                  platforms={selectedPlatforms}
                  scheduledTime={scheduledTime}
                  onRestore={handleRestoreDraft}
                />
              </Box>

              {/* Schedule Post */}
              <Box>
                <Text mb={2} fontSize="sm" fontWeight="medium">Schedule Post</Text>
                <Input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  aria-label="Schedule time for post"
                />
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter borderTopWidth="1px">
            <Button
              colorScheme="blue"
              onClick={handleCreate}
              isFullWidth
              aria-label={scheduledTime ? 'Schedule post' : 'Create post'}
            >
              {scheduledTime ? 'Schedule Post' : 'Create Post'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Preview Drawer */}
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
            <PreviewDrawerContent
              content={content}
              media={mediaFiles}
              selectedPlatforms={selectedPlatforms}
              hashtags={hashtags}
              mentions={mentions}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </ErrorBoundary>
  )
}