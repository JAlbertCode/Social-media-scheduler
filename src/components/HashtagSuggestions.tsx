'use client'

import React, { useEffect, useState } from 'react'
import { PlatformType } from './PostCreator'
import {
  analyzeContentForHashtags,
  getTrendingHashtags,
  validateHashtags,
  getRecommendedHashtagPosition
} from '../utils/hashtagSuggestions'
import {
  VStack,
  Box,
  Text,
  Button,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Alert,
  AlertIcon,
  Badge,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { FaHashtag, FaTrendingUp } from 'react-icons/fa'

interface HashtagSuggestionsProps {
  content: string
  platform: PlatformType
  onHashtagSelect: (hashtag: string) => void
}

export function HashtagSuggestions({
  content,
  platform,
  onHashtagSelect
}: HashtagSuggestionsProps) {
  const [contentSuggestions, setContentSuggestions] = useState<string[]>([])
  const [trendingSuggestions, setTrendingSuggestions] = useState<string[]>([])
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])
  const [validation, setValidation] = useState<{ valid: boolean; message?: string }>({ valid: true })

  const brandColor = useColorModeValue('brand.500', 'brand.400')

  useEffect(() => {
    const suggestions = analyzeContentForHashtags(content, platform)
    setContentSuggestions(suggestions)
    const trending = getTrendingHashtags(platform)
    setTrendingSuggestions(trending)
  }, [content, platform])

  const handleHashtagClick = (hashtag: string) => {
    const newSelectedHashtags = [...selectedHashtags, hashtag]
    const validationResult = validateHashtags(newSelectedHashtags, platform)
    
    if (validationResult.valid) {
      setSelectedHashtags(newSelectedHashtags)
      onHashtagSelect(hashtag)
    }
    setValidation(validationResult)
  }

  const removeHashtag = (hashtagToRemove: string) => {
    setSelectedHashtags(current => current.filter(tag => tag !== hashtagToRemove))
  }

  const recommendedPosition = getRecommendedHashtagPosition(platform)

  return (
    <VStack spacing={4} align="stretch">
      {/* Recommended Position */}
      <Badge 
        colorScheme="brand" 
        variant="subtle" 
        alignSelf="start"
        display="flex"
        alignItems="center"
        gap={1}
      >
        <Icon as={FaHashtag} boxSize="12px" />
        <Text>Recommended position: {recommendedPosition}</Text>
      </Badge>

      {/* Suggested Hashtags */}
      <Box>
        <Text 
          fontSize="sm" 
          fontWeight="medium" 
          color="gray.700" 
          mb={2}
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon as={FaHashtag} color={brandColor} boxSize="12px" />
          <span>Suggested Hashtags</span>
        </Text>
        <Wrap spacing={2}>
          {contentSuggestions.map((hashtag) => (
            <WrapItem key={hashtag}>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="brand"
                onClick={() => handleHashtagClick(hashtag)}
                leftIcon={<Icon as={FaHashtag} boxSize="12px" />}
              >
                {hashtag.replace('#', '')}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      </Box>

      {/* Trending Hashtags */}
      <Box>
        <Text 
          fontSize="sm" 
          fontWeight="medium" 
          color="gray.700" 
          mb={2}
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Icon as={FaTrendingUp} color={brandColor} boxSize="12px" />
          <span>Trending Hashtags</span>
        </Text>
        <Wrap spacing={2}>
          {trendingSuggestions.map((hashtag) => (
            <WrapItem key={hashtag}>
              <Button
                size="sm"
                variant="outline"
                colorScheme="gray"
                onClick={() => handleHashtagClick(hashtag)}
                leftIcon={<Icon as={FaHashtag} boxSize="12px" />}
              >
                {hashtag.replace('#', '')}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      </Box>

      {/* Validation Error */}
      {!validation.valid && (
        <Alert status="error" size="sm" rounded="md">
          <AlertIcon />
          {validation.message}
        </Alert>
      )}

      {/* Selected Hashtags */}
      {selectedHashtags.length > 0 && (
        <Box>
          <Text 
            fontSize="sm" 
            fontWeight="medium" 
            color="gray.700" 
            mb={2}
          >
            Selected Hashtags
          </Text>
          <Wrap spacing={2}>
            {selectedHashtags.map((hashtag) => (
              <WrapItem key={hashtag}>
                <Tag
                  size="md"
                  variant="subtle"
                  colorScheme="brand"
                >
                  <TagLabel>{hashtag}</TagLabel>
                  <TagCloseButton 
                    onClick={() => removeHashtag(hashtag)}
                  />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
    </VStack>
  )
}