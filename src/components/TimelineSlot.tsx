'use client'

import React from 'react'
import { useDrop } from 'react-dnd'
import {
  Box,
  Text,
  VStack,
  Button,
  useColorModeValue,
  Collapse,
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
  onCreatePost?: (time: Date) => void
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
  const [isHovered, setIsHovered] = React.useState(false)

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'POST',
    drop: (item: DragItem, monitor) => {
      if (onMovePost && monitor.isOver({ shallow: true })) {
        const newDate = new Date(date)
        newDate.setHours(hour)
        // Preserve minutes from original post
        const originalDate = new Date(item.originalDate)
        newDate.setMinutes(originalDate.getMinutes())
        onMovePost(item.id, newDate)
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    })
  }))

  const handleCreateClick = () => {
    if (onCreatePost) {
      const newDate = new Date(date)
      newDate.setHours(hour)
      newDate.setMinutes(0)
      onCreatePost(newDate)
    }
  }

  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const dropBg = useColorModeValue('blue.50', 'blue.900')
  const timeColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Box
      ref={drop}
      display="flex"
      borderBottom="1px"
      borderColor={borderColor}
      minH="100px"
      bg={isOver && canDrop ? dropBg : 'transparent'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            <DraggablePost key={post.id} post={post} allPosts={allPosts} />
          ))}
          
          {/* Quick Create Button */}
          <Collapse in={isHovered && posts.length === 0}>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Icon as={FaPlus} />}
              onClick={handleCreateClick}
              width="100%"
              justifyContent="start"
              color="blue.500"
              bg={hoverBg}
              _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
            >
              Schedule post for {hour.toString().padStart(2, '0')}:00
            </Button>
          </Collapse>
        </VStack>
      </Box>
    </Box>
  )
}