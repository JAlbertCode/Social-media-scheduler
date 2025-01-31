'use client'

import React from 'react'
import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Icon,
  VStack,
  Text,
  Badge,
  List,
  ListItem,
} from '@chakra-ui/react'
import { FaExclamationTriangle } from 'react-icons/fa'
import { format } from 'date-fns'
import { ScheduledPost } from '../types/calendar'
import { getConflictMessage } from '../utils/postValidation'

interface ConflictIndicatorProps {
  type: 'same-time' | 'too-close' | 'platform-limit'
  conflicts: ScheduledPost[]
}

export function ConflictIndicator({ type, conflicts }: ConflictIndicatorProps) {
  const message = getConflictMessage({ hasConflict: true, type })

  return (
    <Popover trigger="hover" placement="right">
      <PopoverTrigger>
        <Box
          position="absolute"
          top={-2}
          right={-2}
          zIndex={2}
          cursor="help"
        >
          <Icon
            as={FaExclamationTriangle}
            color="orange.500"
            boxSize={4}
          />
        </Box>
      </PopoverTrigger>
      <PopoverContent width="300px">
        <PopoverBody p={4}>
          <VStack align="stretch" spacing={3}>
            <Badge colorScheme="orange" alignSelf="flex-start">
              Scheduling Conflict
            </Badge>
            <Text fontSize="sm" fontWeight="medium">
              {message}
            </Text>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Conflicting Posts:
              </Text>
              <List spacing={2}>
                {conflicts.map(post => (
                  <ListItem key={post.id}>
                    <Box
                      p={2}
                      bg="orange.50"
                      rounded="md"
                      fontSize="sm"
                    >
                      <Text color="gray.600" fontSize="xs" mb={1}>
                        {format(post.scheduledTime, 'MMM d, yyyy h:mm a')}
                      </Text>
                      <Text noOfLines={2}>{post.content}</Text>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}