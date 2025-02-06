'use client'

import { useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import { ScheduledPost, DragItem } from '../types/calendar'
import {
  Box,
  Text,
  HStack,
  Tag,
  useColorModeValue,
} from '@chakra-ui/react'
import { format } from 'date-fns'

import { PostPreviewPopover } from './PostPreviewPopover'
import { ConflictIndicator } from './ConflictIndicator'
import { detectConflicts } from '../utils/postValidation'

interface DraggablePostProps {
  post: ScheduledPost
  allPosts: ScheduledPost[]
}

export function DraggablePost({ post, allPosts }: DraggablePostProps) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'POST',
    item: {
      type: 'POST',
      id: post.id,
      originalDate: post.scheduledTime,
      content: post.content,
      platforms: post.platforms
    } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
  }))

  useEffect(() => {
    preview(getEmptyImage())
  }, [preview])

  const bg = useColorModeValue('brand.50', 'brand.900')
  const textColor = useColorModeValue('brand.700', 'brand.100')
  const tagBg = useColorModeValue('brand.100', 'brand.800')
  const time = format(new Date(post.scheduledTime), 'HH:mm')

  const conflictResult = detectConflicts(post, allPosts)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent calendar day's event from firing
  }

  return (
    <PostPreviewPopover post={post}>
      <Box
        ref={drag}
        bg={bg}
        color={textColor}
        p={1.5}
        rounded="md"
        fontSize="xs"
        transition="all 0.2s"
        _hover={{ bg: useColorModeValue('brand.100', 'brand.800') }}
        borderWidth="1px"
        borderColor={useColorModeValue('brand.100', 'brand.700')}
        position="relative"
        cursor="grab"
        style={{
          opacity: isDragging ? 0.4 : 1,
          width: '100%',
        }}
        onMouseDown={handleMouseDown}
      >
      {/* Post Content */}

        {conflictResult.hasConflict && conflictResult.type && (
          <ConflictIndicator
            type={conflictResult.type}
            conflicts={conflictResult.conflicts || []}
          />
        )}

        {/* Time and Platform Icons */}
        <HStack mb={1} justify="space-between" align="center">
          <HStack spacing={1}>
            {post.platforms.map(platform => (
              <Tag
                key={platform}
                size="sm"
                bg={tagBg}
                color={textColor}
                px={1}
                minH="16px"
                fontSize="10px"
              >
                {platform.slice(0, 2)}
              </Tag>
            ))}
          </HStack>
          <Text fontSize="10px" color={useColorModeValue('brand.600', 'brand.200')}>
            {time}
          </Text>
        </HStack>

        {/* Post Content */}
        <Text noOfLines={2} fontSize="xs">
          {post.content}
        </Text>

        {/* Media Indicators */}
        {post.media && post.media.length > 0 && (
          <HStack spacing={1} mt={1}>
            <Text fontSize="10px" color={useColorModeValue('gray.600', 'gray.400')}>
              {post.media.length} media
            </Text>
          </HStack>
        )}
      </Box>
    </PostPreviewPopover>
  )
}