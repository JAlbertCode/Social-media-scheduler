'use client'

import React from 'react'
import { ScheduledPost } from '../types/calendar'
import { TimelineSlot } from './TimelineSlot'
import { Box, Text, Heading, useColorModeValue, HStack, Button, Icon } from '@chakra-ui/react'
import { FaChevronLeft } from 'react-icons/fa'

interface TimelineProps {
  posts: ScheduledPost[]
  onMovePost?: (postId: string, newTime: Date) => void
  date: Date
  onBack?: () => void
  onCreatePost?: (time: Date) => void
}

export function Timeline({ posts, onMovePost, date, onBack, onCreatePost }: TimelineProps) {
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

  const handleCreateNewPost = (hour: number) => {
    if (onCreatePost) {
      const newDate = new Date(date)
      newDate.setHours(hour)
      newDate.setMinutes(0)
      onCreatePost(newDate)
    }
  }

  return (
    <Box bg="white" rounded="lg" shadow="md">
      <Box p={4} borderBottom="1px" borderColor="gray.200">
        <HStack justify="space-between" align="center">
          <Heading size="md" color="gray.900">
            {date.toLocaleDateString(undefined, { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Heading>
          <Button
            leftIcon={<Icon as={FaChevronLeft} />}
            onClick={onBack}
            size="sm"
            variant="ghost"
          >
            Back to Calendar
          </Button>
        </HStack>
      </Box>
      <Box overflowY="auto" maxH="calc(100vh - 200px)">
        {hours.map((hour) => (
          <TimelineSlot
            key={hour}
            hour={hour}
            date={date}
            posts={getPostsForHour(hour)}
            allPosts={posts}
            onMovePost={onMovePost}
            onCreatePost={() => handleCreateNewPost(hour)}
          />
        ))}
      </Box>
    </Box>
  )
}