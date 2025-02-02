'use client'

import React from 'react'
import {
  Box,
  VStack,
  Text,
  Button,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { FaCalendarPlus } from 'react-icons/fa'

interface ScheduleEmptyStateProps {
  onCreatePost: () => void
}

export function ScheduleEmptyState({ onCreatePost }: ScheduleEmptyStateProps) {
  return (
    <VStack
      spacing={6}
      py={12}
      px={4}
      bg={useColorModeValue('white', 'gray.800')}
      rounded="lg"
      borderWidth="2px"
      borderStyle="dashed"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      width="100%"
    >
      <Icon
        as={FaCalendarPlus}
        boxSize={12}
        color={useColorModeValue('blue.500', 'blue.300')}
      />
      
      <VStack spacing={2}>
        <Text
          fontSize="lg"
          fontWeight="medium"
          color={useColorModeValue('gray.900', 'white')}
        >
          No Posts Scheduled
        </Text>
        <Text
          fontSize="sm"
          color={useColorModeValue('gray.600', 'gray.400')}
          textAlign="center"
          maxW="md"
        >
          Start by creating your first post. Our AI will help you find the best time
          to schedule it based on your audience.
        </Text>
      </VStack>

      <Button
        colorScheme="blue"
        size="lg"
        leftIcon={<Icon as={FaCalendarPlus} />}
        onClick={onCreatePost}
      >
        Create Your First Post
      </Button>
    </VStack>
  )
}
