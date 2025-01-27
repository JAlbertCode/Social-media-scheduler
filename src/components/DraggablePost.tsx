'use client'

import { useDrag } from 'react-dnd'
import { ScheduledPost, DragItem } from '../types/calendar'
import {
  Box,
  Text,
  HStack,
  Tag,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react'
import { format } from 'date-fns'

interface DraggablePostProps {
  post: ScheduledPost
}

export function DraggablePost({ post }: DraggablePostProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'POST',
    item: {
      type: 'POST',
      id: post.id,
      originalDate: post.scheduledTime
    } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  const bg = useColorModeValue('brand.50', 'brand.900')
  const textColor = useColorModeValue('brand.700', 'brand.100')
  const tagBg = useColorModeValue('brand.100', 'brand.800')
  const time = format(new Date(post.scheduledTime), 'HH:mm')

  return (
    <Tooltip label={post.content} placement="top">
      <Box
        ref={drag}
        opacity={isDragging ? 0.5 : 1}
        bg={bg}
        color={textColor}
        p={1.5}
        rounded="md"
        fontSize="xs"
        cursor="move"
        transition="all 0.2s"
        _hover={{ bg: useColorModeValue('brand.100', 'brand.800') }}
        borderWidth="1px"
        borderColor={useColorModeValue('brand.100', 'brand.700')}
      >
        <HStack justify="space-between" mb={1}>
          <Text noOfLines={1} flex={1}>
            {post.content}
          </Text>
          <Text fontSize="10px" color={useColorModeValue('brand.600', 'brand.200')}>
            {time}
          </Text>
        </HStack>
        <HStack spacing={1}>
          {post.platforms.map(platform => (
            <Tag
              key={platform}
              size="sm"
              bg={tagBg}
              color={textColor}
              fontSize="10px"
              minH="16px"
              px={1}
            >
              {platform}
            </Tag>
          ))}
        </HStack>
      </Box>
    </Tooltip>
  )
}