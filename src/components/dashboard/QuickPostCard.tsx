'use client'

import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  IconButton,
  useToast,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react'
import { FaImage, FaVideo, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa'
import { SiBluesky } from 'react-icons/si'

interface QuickPostCardProps {
  onPost: (content: string, platforms: string[], media?: File[]) => Promise<void>
}

export function QuickPostCard({ onPost }: QuickPostCardProps) {
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: FaTwitter, color: 'twitter.500' },
    { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedin, color: 'linkedin.500' },
    { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: 'pink.500' },
    { id: 'bluesky', name: 'Bluesky', icon: SiBluesky, color: 'blue.500' },
  ]

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  const handlePost = async () => {
    if (!content.trim()) {
      toast({
        title: 'Content required',
        status: 'error',
        duration: 2000,
      })
      return
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: 'Select at least one platform',
        status: 'error',
        duration: 2000,
      })
      return
    }

    try {
      setIsLoading(true)
      await onPost(content, selectedPlatforms)
      setContent('')
      setSelectedPlatforms([])
      toast({
        title: 'Post created',
        status: 'success',
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: 'Failed to create post',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      p={5}
      bg={cardBg}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="medium">Quick Post</Text>
        
        <HStack spacing={2}>
          {platforms.map((platform) => (
            <Tooltip
              key={platform.id}
              label={platform.name}
              placement="top"
            >
              <IconButton
                aria-label={platform.name}
                icon={<platform.icon />}
                color={selectedPlatforms.includes(platform.id) ? platform.color : 'gray.400'}
                variant={selectedPlatforms.includes(platform.id) ? 'solid' : 'ghost'}
                onClick={() => togglePlatform(platform.id)}
              />
            </Tooltip>
          ))}
        </HStack>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          size="sm"
          rows={3}
          resize="none"
        />

        <HStack justify="space-between">
          <HStack>
            <Tooltip label="Add Image">
              <IconButton
                aria-label="Add Image"
                icon={<FaImage />}
                size="sm"
                variant="ghost"
              />
            </Tooltip>
            <Tooltip label="Add Video">
              <IconButton
                aria-label="Add Video"
                icon={<FaVideo />}
                size="sm"
                variant="ghost"
              />
            </Tooltip>
          </HStack>

          <Button
            colorScheme="brand"
            size="sm"
            isLoading={isLoading}
            onClick={handlePost}
          >
            Post Now
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}