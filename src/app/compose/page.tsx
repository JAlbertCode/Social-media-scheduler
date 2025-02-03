'use client'

import { useState, useRef, useEffect } from 'react'
import { PostEditor } from '../../components/PostEditor'
import { PreviewContainer } from '../../components/PreviewContainer'
import { HashtagSuggestions } from '../../components/HashtagSuggestions'
import { MentionSuggestions } from '../../components/MentionSuggestions'
import { PlatformToggle } from '../../components/PlatformToggle'
import { ScheduledPost } from '../../types/calendar'
import { PlatformType, PLATFORM_LIMITS } from '../../types/platforms'
import { getUserTimezone } from '../../utils/timezone'
import { countMentions } from '../../utils/mentionSuggestions'
import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  Textarea,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  useToast,
  Card,
  CardHeader,
  CardBody,
  FormControl,
  FormLabel,
  ButtonGroup,
  Icon,
} from '@chakra-ui/react'
import { PLATFORM_ICONS } from '../../utils/platformIcons'



export default function ComposePage() {
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(['Twitter'])
  const [media, setMedia] = useState<Array<{ type: 'image' | 'video'; preview: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const [cursorPosition, setCursorPosition] = useState<{ top: number; left: number } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const toast = useToast()
  const validateContent = (text: string, platforms: PlatformType[]): string | null => {
    for (const platform of platforms) {
      // Character limit validation
      const limit = PLATFORM_LIMITS[platform].characterLimit
      if (text.length > limit) {
        return `Content exceeds ${platform} limit of ${limit} characters`
      }
      
      // Media validation
      if (media.length > PLATFORM_LIMITS[platform].mediaLimit) {
        return `Too many media items for ${platform}. Maximum is ${PLATFORM_LIMITS[platform].mediaLimit}`
      }

      // Mentions validation
      const mentionsCount = countMentions(text, platform)
      if (!mentionsCount.valid) {
        return mentionsCount.message
      }
    }
    return null
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    const validationError = validateContent(newContent, selectedPlatforms)
    setError(validationError)

    // Update cursor position for mention suggestions
    if (textareaRef.current) {
      const { selectionStart } = textareaRef.current
      const lines = newContent.slice(0, selectionStart).split('\n')
      const lineHeight = 24 // Approximate line height in pixels
      const rect = textareaRef.current.getBoundingClientRect()
      
      setCursorPosition({
        top: rect.top + lines.length * lineHeight,
        left: rect.left + (lines[lines.length - 1].length * 8) // Approximate character width
      })
    }
  }

  const handlePlatformToggle = (platform: PlatformType) => {
    setSelectedPlatforms(current => {
      const newPlatforms = current.includes(platform)
        ? current.filter(p => p !== platform)
        : [...current, platform]
      
      const validationError = validateContent(content, newPlatforms)
      setError(validationError)
      return newPlatforms
    })
  }

  const handleHashtagSelect = (hashtag: string) => {
    let newContent = content
    if (!content.endsWith(' ') && content.length > 0) {
      newContent += ' '
    }
    newContent += hashtag + ' '
    handleContentChange(newContent)
  }

  const handleMentionSelect = (mention: string) => {
    // Replace the current word with the mention
    const words = content.split(/\s+/)
    words[words.length - 1] = mention
    const newContent = words.join(' ') + ' '
    handleContentChange(newContent)
    setCursorPosition(null)
  }

  const handleSave = async () => {
    const validationError = validateContent(content, selectedPlatforms)
    if (validationError) {
      setError(validationError)
      toast({
        title: 'Error',
        description: validationError,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    const post: Omit<ScheduledPost, 'id' | 'scheduledTime'> = {
      content,
      platforms: selectedPlatforms,
      media
    }

    toast({
      title: 'Success',
      description: 'Post saved successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    console.log('Saving post:', post)
  }

  // Clean up cursor position when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setCursorPosition(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Previous handler functions remain the same

  return (
    <Container maxW="8xl" py={8}>
      <Grid templateColumns={{ base: '1fr', lg: '3fr 2fr' }} gap={6}>
        <GridItem>
          <VStack spacing={6} align="stretch">
            <Card>
              <CardHeader>
                <Heading size="md">Create Post</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <FormLabel>Select Platforms</FormLabel>
                    <PlatformToggle
                      selectedPlatforms={selectedPlatforms}
                      onTogglePlatform={handlePlatformToggle}
                    />
                  </Box>


                  <FormControl>
                    <FormLabel>
                      Content
                      <Text as="span" ml={2} fontSize="sm" color="gray.500">
                        {content.length} / {Math.min(...selectedPlatforms.map(p => PLATFORM_LIMITS[p].characterLimit))} characters
                      </Text>
                    </FormLabel>
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
                  </FormControl>

                  <FormControl>
                    <FormLabel>Media</FormLabel>
                    <PostEditor
                      onSave={handleSave}
                      initialContent={content}
                      initialPlatforms={selectedPlatforms}
                    />
                  </FormControl>

                  {selectedPlatforms.map(platform => (
                    <Card key={platform} variant="outline">
                      <CardBody>
                        <HStack mb={3}>
                          <Icon as={PLATFORM_ICONS[platform]} />
                          <Text fontWeight="medium">{platform} Hashtag Suggestions</Text>
                        </HStack>
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
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Button
                  onClick={handleSave}
                  isDisabled={!!error}
                  colorScheme={error ? 'gray' : 'brand'}
                  width="full"
                  size="lg"
                >
                  Schedule Post
                </Button>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>

        <GridItem>
          <Card>
            <CardHeader>
              <Heading size="md">Preview</Heading>
            </CardHeader>
            <CardBody>
              <PreviewContainer
                platforms={selectedPlatforms}
                content={content}
                media={media}
              />
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Container>
  )
}