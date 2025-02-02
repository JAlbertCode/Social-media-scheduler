'use client'

import React, { useState, useCallback } from 'react'
import {
  Box,
  VStack,
  Textarea,
  ButtonGroup,
  IconButton,
  Text,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { 
  FaBold, 
  FaItalic, 
  FaLink, 
  FaListUl, 
  FaListOl,
  FaQuoteRight,
  FaImage,
} from 'react-icons/fa'
import { MediaUploader } from './MediaUploader'
import { PlatformType } from './PostCreator'

interface PostEditorProps {
  onSave: (content: string, media: any[], platforms: PlatformType[]) => void
  initialContent?: string
  initialPlatforms?: PlatformType[]
}

const PLATFORM_LIMITS: Record<PlatformType, number> = {
  Twitter: 280,
  Instagram: 2200,
  TikTok: 2200,
  LinkedIn: 3000,
  YouTube: 1000,
  Bluesky: 300,
  Threads: 500,
}

export function PostEditor({ 
  onSave,
  initialContent = '',
  initialPlatforms = ['Twitter']
}: PostEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [media, setMedia] = useState<Array<{ type: 'image' | 'video'; preview: string }>>([])
  const [selectedPlatforms] = useState<PlatformType[]>(initialPlatforms)

  const handleMediaSelect = useCallback((files: Array<{ type: 'image' | 'video'; preview: string }>) => {
    setMedia(files)
    onSave(content, files, selectedPlatforms)
  }, [content, selectedPlatforms, onSave])

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    onSave(newContent, media, selectedPlatforms)
  }, [media, selectedPlatforms, onSave])

  const insertFormatting = useCallback((format: string) => {
    const textarea = document.querySelector('textarea')
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value

    let newContent
    switch (format) {
      case 'bold':
        newContent = text.slice(0, start) + `**${text.slice(start, end)}**` + text.slice(end)
        break
      case 'italic':
        newContent = text.slice(0, start) + `_${text.slice(start, end)}_` + text.slice(end)
        break
      case 'link':
        newContent = text.slice(0, start) + `[${text.slice(start, end)}](url)` + text.slice(end)
        break
      case 'bullet':
        newContent = text.slice(0, start) + `\n• ${text.slice(start, end)}` + text.slice(end)
        break
      case 'number':
        newContent = text.slice(0, start) + `\n1. ${text.slice(start, end)}` + text.slice(end)
        break
      case 'quote':
        newContent = text.slice(0, start) + `\n> ${text.slice(start, end)}` + text.slice(end)
        break
      default:
        return
    }

    setContent(newContent)
    onSave(newContent, media, selectedPlatforms)
  }, [media, selectedPlatforms, onSave])

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  return (
    <VStack spacing={2} width="100%">
      {/* Formatting Toolbar */}
      <ButtonGroup size="sm" isAttached variant="outline" width="100%">
        <IconButton
          aria-label="Bold"
          icon={<FaBold />}
          onClick={() => insertFormatting('bold')}
        />
        <IconButton
          aria-label="Italic"
          icon={<FaItalic />}
          onClick={() => insertFormatting('italic')}
        />
        <IconButton
          aria-label="Link"
          icon={<FaLink />}
          onClick={() => insertFormatting('link')}
        />
        <IconButton
          aria-label="Bullet List"
          icon={<FaListUl />}
          onClick={() => insertFormatting('bullet')}
        />
        <IconButton
          aria-label="Numbered List"
          icon={<FaListOl />}
          onClick={() => insertFormatting('number')}
        />
        <IconButton
          aria-label="Quote"
          icon={<FaQuoteRight />}
          onClick={() => insertFormatting('quote')}
        />
      </ButtonGroup>

      {/* Text Editor */}
      <Box 
        position="relative" 
        width="100%"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        rounded="md"
      >
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Write your post content..."
          minH="200px"
          p={4}
          resize="vertical"
          border="none"
          _focus={{
            boxShadow: 'none',
            borderColor: 'blue.500',
          }}
        />

        {/* Character Count */}
        <VStack
          position="absolute"
          bottom={2}
          right={2}
          alignItems="flex-end"
          spacing={0}
        >
          {selectedPlatforms.map(platform => {
            const limit = PLATFORM_LIMITS[platform]
            const remaining = limit - content.length
            return (
              <Text
                key={platform}
                fontSize="xs"
                color={
                  remaining < 0 ? 'red.500' :
                  remaining < limit * 0.1 ? 'yellow.500' :
                  'gray.500'
                }
              >
                {platform}: {remaining}
              </Text>
            )
          })}
        </VStack>
      </Box>

      {/* Media Upload */}
      <Box width="100%">
        <MediaUploader
          platform={selectedPlatforms[0]}
          onMediaSelect={handleMediaSelect}
          maxFiles={4}
        />
      </Box>
    </VStack>
  )
}