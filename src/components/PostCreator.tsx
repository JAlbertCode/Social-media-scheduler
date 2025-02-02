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
  Textarea,
  Box,
  Text,
  VStack,
  HStack,
  Input,
  useColorModeValue,
  Tag,
  Grid,
  Image,
  IconButton,
} from '@chakra-ui/react'

// Types
export type PlatformType = 'Twitter' | 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube' | 'Bluesky' | 'Threads'
export type ContentType = 'feed' | 'story' | 'reels'

// Platform character limits
const PLATFORM_LIMITS: Record<PlatformType, number> = {
  Twitter: 280,
  Instagram: 2200,
  TikTok: 2200,
  LinkedIn: 3000,
  YouTube: 1000,
  Bluesky: 300,
  Threads: 500,
}

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

export function PostCreator({ isOpen, onClose, selectedPlatforms, initialScheduledTime, onPostCreate }: PostCreatorProps) {
  const [content, setContent] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [mentions, setMentions] = useState<string[]>([])
  const [urls, setUrls] = useState<string[]>([])
  const [threads, setThreads] = useState<string[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [scheduledTime, setScheduledTime] = useState<string>(
    initialScheduledTime ? initialScheduledTime.toISOString().slice(0, 16) : ''
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const handleFiles = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const preview = URL.createObjectURL(file)
        setMediaFiles(prev => [...prev, {
          file,
          preview,
          type: file.type.startsWith('image/') ? 'image' : 'video'
        }])
      }
    })
  }, [])

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
    setValidationErrors({})
    
    // Close modal
    onClose()
  }, [content, hashtags, mentions, urls, threads, mediaFiles, scheduledTime, onPostCreate, onClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent maxW="1000px">
        <ModalHeader>Create Post</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            {/* Platform Tags */}
            <HStack spacing={2} alignSelf="flex-start">
              {selectedPlatforms.map(platform => (
                <Tag key={platform} colorScheme="blue" size="sm">
                  {platform}
                </Tag>
              ))}
            </HStack>

            {/* Content Editor */}
            <Box position="relative" w="full">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Write your post content..."
                size="lg"
                minH="200px"
                resize="vertical"
              />
              <VStack
                position="absolute"
                bottom={2}
                right={2}
                alignItems="flex-end"
              >
                {selectedPlatforms.map(platform => {
                  const limit = PLATFORM_LIMITS[platform];
                  const remaining = limit - content.length;
                  return (
                    <Text
                      key={platform}
                      fontSize="sm"
                      color={
                        remaining < 0 ? 'red.500' :
                        remaining < limit * 0.1 ? 'yellow.500' :
                        'gray.500'
                      }
                    >
                      {platform}: {remaining}
                    </Text>
                  );
                })}
              </VStack>
            </Box>

            {/* Schedule Post */}
            <Box w="full">
              <Text mb={2} fontSize="sm" fontWeight="medium">Schedule Post</Text>
              <Input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </Box>

            {/* Media Upload */}
            <Box
              w="full"
              borderWidth={2}
              borderStyle="dashed"
              rounded="lg"
              p={4}
              textAlign="center"
              cursor="pointer"
              onClick={() => fileInputRef.current?.click()}
              _hover={{ borderColor: 'gray.400' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/*,video/*"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                multiple
              />
              <Text color="gray.600">Drop files or click to upload</Text>
            </Box>

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <Grid
                templateColumns="repeat(auto-fill, minmax(150px, 1fr))"
                gap={4}
                w="full"
                maxH="300px"
                overflowY="auto"
              >
                {mediaFiles.map((file, index) => (
                  <Box key={index} position="relative" role="group">
                    <Box
                      w="150px"
                      h="150px"
                      overflow="hidden"
                      rounded="lg"
                      bg="gray.100"
                    >
                      {file.type === 'image' ? (
                        <Image
                          src={file.preview}
                          alt={`Preview ${index + 1}`}
                          objectFit="cover"
                          w="150px"
                          h="150px"
                        />
                      ) : (
                        <video
                          src={file.preview}
                          style={{
                            objectFit: 'cover',
                            width: '150px',
                            height: '150px'
                          }}
                          controls
                        />
                      )}
                      <IconButton
                        aria-label="Remove media"
                        icon={<svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>}
                        position="absolute"
                        top={2}
                        right={2}
                        size="sm"
                        colorScheme="red"
                        onClick={() => {
                          URL.revokeObjectURL(file.preview)
                          setMediaFiles(files => files.filter((_, i) => i !== index))
                        }}
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
                      />
                    </Box>
                  </Box>
                ))}
              </Grid>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            onClick={handleCreate}
            isFullWidth
          >
            {scheduledTime ? 'Schedule Post' : 'Create Post'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}