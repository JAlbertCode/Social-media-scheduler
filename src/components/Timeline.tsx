'use client'

import React from 'react'
import { useDrop } from 'react-dnd'
import { ScheduledPost, DragItem } from '../types/calendar'
import { DraggablePost } from './DraggablePost'
import { Box, Text, Heading, useColorModeValue } from '@chakra-ui/react'

interface TimelineProps {
  posts: ScheduledPost[]
  onMovePost?: (postId: string, newTime: Date) => void
  date: Date
}

export function Timeline({ posts, onMovePost, date }: TimelineProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  const getPostsForHour = (hour: number) => {
    return posts.filter(post => {
      const postTime = new Date(post.scheduledTime)
      return postTime.getHours() === hour &&
             postTime.getDate() === date.getDate() &&
             postTime.getMonth() === date.getMonth() &&
             postTime.getFullYear() === date.getFullYear()
    })
  }

  const TimeSlot = ({ hour }: { hour: number }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'POST',
      drop: (item: DragItem) => {
        if (onMovePost) {
          const newDate = new Date(date)
          newDate.setHours(hour)
          onMovePost(item.id, newDate)
        }
      },
      collect: monitor => ({
        isOver: !!monitor.isOver()
      })
    }))

    const hourPosts = getPostsForHour(hour)
    const formattedHour = hour.toString().padStart(2, '0') + ':00'

    return (
      <Box
        ref={drop}
        display="flex"
        borderBottom="1px"
        borderColor="gray.200"
        minH="100px"
        bg={isOver ? 'blue.50' : 'white'}
        _hover={{ bg: isOver ? 'blue.50' : 'gray.50' }}
        transition="background-color 0.2s"
      >
        <Box
          w="80px"
          p={2}
          borderRight="1px"
          borderColor="gray.200"
          flexShrink={0}
        >
          <Text fontSize="sm" color="gray.500">{formattedHour}</Text>
        </Box>
        <Box flexGrow={1} p={2}>
          {hourPosts.map((post) => (
            <DraggablePost key={post.id} post={post} allPosts={posts} />
          ))}
        </Box>
      </Box>
    )
  }

  return (
    <Box bg="white" rounded="lg" shadow="md">
      <Box p={4} borderBottom="1px" borderColor="gray.200">
        <Heading size="md" color="gray.900">
          {date.toLocaleDateString(undefined, { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Heading>
      </Box>
      <Box overflowY="auto" maxH="calc(100vh - 200px)">
        {hours.map((hour) => (
          <TimeSlot key={hour} hour={hour} />
        ))}
      </Box>
    </Box>
  )
}