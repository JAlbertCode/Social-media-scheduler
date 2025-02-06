'use client'

import { useDragLayer } from 'react-dnd'
import { Box, HStack, Tag, Text, useColorModeValue } from '@chakra-ui/react'
import { format } from 'date-fns'
import { ScheduledPost } from '../types/calendar'

function getItemStyles(
  initialOffset: { x: number; y: number } | null,
  currentOffset: { x: number; y: number } | null,
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    }
  }

  const { x, y } = currentOffset
  const transform = `translate(${x}px, ${y}px)`

  return {
    transform,
    WebkitTransform: transform,
    position: 'fixed' as const,
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: 100,
  }
}

export function CustomDragLayer() {
  const {
    isDragging,
    item,
    initialOffset,
    currentOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }))

  if (!isDragging) {
    return null
  }

  return (
    <div style={getItemStyles(initialOffset, currentOffset)}>
      <Box
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.900', 'white')}
        p={2}
        rounded="md"
        fontSize="sm"
        boxShadow="lg"
        borderWidth="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        width="250px"
      >
        <HStack justify="space-between" mb={1}>
          <Text noOfLines={1} flex={1}>
            {item.content}
          </Text>
          <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
            {format(new Date(item.originalDate), 'HH:mm')}
          </Text>
        </HStack>
        <HStack spacing={1}>
          {item.platforms?.map((platform: string) => (
            <Tag
              key={platform}
              size="sm"
              colorScheme="blue"
              fontSize="xs"
            >
              {platform}
            </Tag>
          ))}
        </HStack>
      </Box>
    </div>
  )
}