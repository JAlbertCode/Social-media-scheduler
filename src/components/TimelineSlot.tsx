'use client'

import React from 'react'
import { useDrop } from 'react-dnd'
import {
  Box,
  Text,
  VStack,
  Button,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { FaPlus } from 'react-icons/fa'
import { ScheduledPost, DragItem } from '../types/calendar'
import { DraggablePost } from './DraggablePost'

interface TimelineSlotProps {
  hour: number
  posts: ScheduledPost[]
  allPosts: ScheduledPost[]
  onMovePost?: (postId: string, newTime: Date) => void
  onCreatePost?: () => void
  date: Date
}

export function TimelineSlot({
  hour,
  posts,
  allPosts,
  onMovePost,
  onCreatePost,
  date,
}: TimelineSlotProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'POST',
    drop: (item: DragItem, monitor) => {
      if (onMovePost && monitor.isOver({ shallow: true })) {
        const newDate = new Date(date)
        newDate.setHours(hour)
        onMovePost(item.id, newDate)
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true })
    })
  }))

  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const dropBg = useColorModeValue('blue.50', 'blue.900')
  const timeColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Box
      ref={drop}
      display="flex"
      borderBottom="1px"
      borderColor={borderColor}
      minH="100px"
      bg={isOver ? dropBg : 'transparent'}
      transition="all 0.2s"
      position="relative"
    >
      {/* Time Label */}
      <Box
        w="80px"
        p={2}
        borderRight="1px"
        borderColor={borderColor}
        flexShrink={0}
      >
        <Text fontSize="sm" color={timeColor}>
          {hour.toString().padStart(2, '0')}:00
        </Text>
      </Box>

      {/* Content Area */}
      <Box flexGrow={1} p={2} position="relative">
        <VStack spacing={2} align="stretch">
          {posts.map((post) => (
            <Box
              key={post.id}
              onClick={(e) => e.stopPropagation()}
            >
              <DraggablePost post={post} allPosts={allPosts} />
            </Box>
          ))}
          
          {/* Quick Create Button */}
          {!isOver && posts.length === 0 && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Icon as={FaPlus} />}
              onClick={onCreatePost}
              width="100%"
              justifyContent="start"
              color="blue.500"
              _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
            >
              Schedule post for {hour.toString().padStart(2, '0')}:00
            </Button>
          )}
        </VStack>
      </Box>
    </Box>
  )
}