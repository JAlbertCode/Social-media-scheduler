'use client'

import React from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Progress,
  Badge,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { ScheduledPost } from '../types/calendar'
import { differenceInHours, format, isWithinInterval, startOfDay, endOfDay } from 'date-fns'

interface GapAnalysisResult {
  gapSize: number  // in hours
  startTime: Date
  endTime: Date
  severity: 'good' | 'warning' | 'alert'
  posts: {
    before?: ScheduledPost
    after?: ScheduledPost
  }
}

interface ScheduleGapAnalysisProps {
  posts: ScheduledPost[]
  date: Date
  recommendedMaxGap?: number  // in hours
  recommendedMinGap?: number  // in hours
}

export function ScheduleGapAnalysis({
  posts,
  date,
  recommendedMaxGap = 8,
  recommendedMinGap = 2
}: ScheduleGapAnalysisProps) {
  const analyzeGaps = (): GapAnalysisResult[] => {
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)
    
    // Get posts for the selected date
    const dayPosts = posts
      .filter(post => isWithinInterval(new Date(post.scheduledTime), {
        start: dayStart,
        end: dayEnd
      }))
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())

    if (dayPosts.length === 0) {
      return [{
        gapSize: 24,
        startTime: dayStart,
        endTime: dayEnd,
        severity: 'alert',
        posts: {}
      }]
    }

    const gaps: GapAnalysisResult[] = []

    // Check gap from start of day to first post
    const firstPost = dayPosts[0]
    const morningGap = differenceInHours(new Date(firstPost.scheduledTime), dayStart)
    if (morningGap > 0) {
      gaps.push({
        gapSize: morningGap,
        startTime: dayStart,
        endTime: new Date(firstPost.scheduledTime),
        severity: morningGap > recommendedMaxGap ? 'alert' : 'good',
        posts: { after: firstPost }
      })
    }

    // Check gaps between posts
    for (let i = 0; i < dayPosts.length - 1; i++) {
      const currentPost = dayPosts[i]
      const nextPost = dayPosts[i + 1]
      const gap = differenceInHours(
        new Date(nextPost.scheduledTime),
        new Date(currentPost.scheduledTime)
      )

      gaps.push({
        gapSize: gap,
        startTime: new Date(currentPost.scheduledTime),
        endTime: new Date(nextPost.scheduledTime),
        severity: gap > recommendedMaxGap ? 'alert' :
                 gap < recommendedMinGap ? 'warning' : 'good',
        posts: {
          before: currentPost,
          after: nextPost
        }
      })
    }

    // Check gap from last post to end of day
    const lastPost = dayPosts[dayPosts.length - 1]
    const eveningGap = differenceInHours(dayEnd, new Date(lastPost.scheduledTime))
    if (eveningGap > 0) {
      gaps.push({
        gapSize: eveningGap,
        startTime: new Date(lastPost.scheduledTime),
        endTime: dayEnd,
        severity: eveningGap > recommendedMaxGap ? 'alert' : 'good',
        posts: { before: lastPost }
      })
    }

    return gaps
  }

  const gaps = analyzeGaps()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'alert':
        return 'red'
      case 'warning':
        return 'orange'
      default:
        return 'green'
    }
  }

  const getGapMessage = (gap: GapAnalysisResult) => {
    if (gap.severity === 'alert') {
      return `Large gap of ${gap.gapSize} hours might reduce engagement`
    }
    if (gap.severity === 'warning') {
      return `Posts are too close (${gap.gapSize} hours apart)`
    }
    return `Good spacing of ${gap.gapSize} hours between posts`
  }

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      p={4}
    >
      <Text fontSize="sm" fontWeight="medium" mb={4}>
        Schedule Gap Analysis
      </Text>
      <VStack spacing={4} align="stretch">
        {gaps.map((gap, index) => (
          <Box key={index}>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm" color="gray.600">
                {format(gap.startTime, 'HH:mm')} - {format(gap.endTime, 'HH:mm')}
              </Text>
              <Badge colorScheme={getSeverityColor(gap.severity)}>
                {gap.gapSize}h
              </Badge>
            </HStack>
            <Tooltip label={getGapMessage(gap)}>
              <Box>
                <Progress
                  value={(gap.gapSize / 24) * 100}
                  size="sm"
                  colorScheme={getSeverityColor(gap.severity)}
                  rounded="full"
                />
              </Box>
            </Tooltip>
            {gap.posts.before && (
              <Text fontSize="xs" color="gray.500" mt={1} noOfLines={1}>
                After: {gap.posts.before.content}
              </Text>
            )}
            {gap.posts.after && (
              <Text fontSize="xs" color="gray.500" mt={1} noOfLines={1}>
                Before: {gap.posts.after.content}
              </Text>
            )}
          </Box>
        ))}
      </VStack>

      <Box mt={4} pt={4} borderTopWidth="1px" borderColor={borderColor}>
        <Text fontSize="xs" color="gray.500">
          Recommended post spacing: {recommendedMinGap}-{recommendedMaxGap} hours
        </Text>
      </Box>
    </Box>
  )
}