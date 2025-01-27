'use client'

import React, { useEffect, useState } from 'react'
import { PlatformType } from './PostCreator'
import {
  getMentionSuggestions,
  validateMention,
  countMentions,
  formatMention,
  getMentionRules
} from '../utils/mentionSuggestions'
import {
  Box,
  List,
  ListItem,
  Button,
  Text,
  Flex,
  Icon,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Divider,
} from '@chakra-ui/react'
import { FaCheckCircle, FaAt } from 'react-icons/fa'

interface MentionSuggestionsProps {
  content: string
  platform: PlatformType
  onMentionSelect: (mention: string) => void
  position?: { top: number; left: number }
}

export function MentionSuggestions({
  content,
  platform,
  onMentionSelect,
  position
}: MentionSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Array<{
    id: string
    username: string
    displayName: string
    verified?: boolean
  }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true)
        setError(null)

        const words = content.split(/\s+/)
        const currentWord = words[words.length - 1]

        if (currentWord.startsWith('@')) {
          const query = currentWord.slice(1)
          const results = await getMentionSuggestions(query, platform)
          setSuggestions(results)
        } else {
          setSuggestions([])
        }
      } catch (err) {
        setError('Failed to load suggestions')
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [content, platform])

  const handleSelect = (suggestion: { username: string }) => {
    const mention = formatMention({ ...suggestion, platform })
    const validation = validateMention(mention, platform)
    
    if (validation.valid) {
      onMentionSelect(mention)
    } else {
      setError(validation.message)
    }
  }

  if (suggestions.length === 0 && !loading && !error) {
    return null
  }

  const style = position ? {
    position: 'absolute' as const,
    top: position.top,
    left: position.left,
  } : {}

  return (
    <Box
      bg="white"
      rounded="lg"
      shadow="lg"
      borderWidth="1px"
      borderColor="gray.200"
      maxW="sm"
      {...style}
    >
      <Box p={2}>
        {loading ? (
          <Flex justify="center" align="center" py={2} color="gray.500">
            <Spinner size="sm" mr={2} />
            <Text>Loading suggestions...</Text>
          </Flex>
        ) : error ? (
          <Alert status="error" size="sm">
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <List spacing={1}>
            {suggestions.map((suggestion) => (
              <ListItem key={suggestion.id}>
                <Button
                  variant="ghost"
                  width="full"
                  justifyContent="space-between"
                  onClick={() => handleSelect(suggestion)}
                  py={2}
                  px={3}
                  height="auto"
                  display="flex"
                  alignItems="center"
                >
                  <Flex align="center">
                    <Icon as={FaAt} color="gray.400" boxSize={3} mr={2} />
                    <Box textAlign="left">
                      <Text fontWeight="medium" fontSize="sm">
                        {suggestion.username}
                      </Text>
                      <Text color="gray.500" fontSize="xs">
                        {suggestion.displayName}
                      </Text>
                    </Box>
                  </Flex>
                  {suggestion.verified && (
                    <Icon 
                      as={FaCheckCircle} 
                      color="brand.500" 
                      boxSize={4} 
                      ml={2}
                    />
                  )}
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      <Divider />
      <Flex 
        px={3} 
        py={2} 
        justify="space-between" 
        align="center"
        bg="gray.50"
      >
        <Text fontSize="xs" color="gray.500">
          Max {getMentionRules(platform).maxMentions} mentions
        </Text>
        <Badge colorScheme="brand" variant="subtle">
          {platform}
        </Badge>
      </Flex>
    </Box>
  )
}