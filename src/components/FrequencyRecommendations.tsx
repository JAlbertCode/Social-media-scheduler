'use client'

import React from 'react'
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  SimpleGrid,
  Divider,
} from '@chakra-ui/react'
import { PlatformType } from './PostCreator'
import { getRecommendedTimes, analyzePostingPattern } from '../utils/frequency'
import { formatInTimezone } from '../utils/timezone'

interface FrequencyRecommendationsProps {
  platform: PlatformType
  existingPosts: Date[]
  timezone: string
  onSelectTime?: (time: Date) => void
}

export function FrequencyRecommendations({
  platform,
  existingPosts,
  timezone,
  onSelectTime
}: FrequencyRecommendationsProps) {
  const analysis = analyzePostingPattern(existingPosts, platform)
  const recommendedTimes = getRecommendedTimes(platform, timezone, existingPosts)

  return (
    <VStack spacing={4} align="stretch">
      {/* Current Pattern Analysis */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>
          Current Pattern
        </Text>
        <SimpleGrid columns={2} spacing={4}>
          <Box>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Average Frequency
            </Text>
            <Text fontSize="md" fontWeight="semibold">
              {analysis.frequency.toFixed(1)} posts/day
            </Text>
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.600" mb={1}>
              Time Consistency
            </Text>
            <Text fontSize="md" fontWeight="semibold">
              {(analysis.consistency * 100).toFixed(0)}%
            </Text>
          </Box>
        </SimpleGrid>
      </Box>

      <Divider />

      {/* Recommendations */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>
          Recommendations
        </Text>
        <VStack spacing={2} align="stretch">
          {analysis.recommendations.map((rec, index) => (
            <Text key={index} fontSize="sm" color="gray.600">
              • {rec}
            </Text>
          ))}
        </VStack>
      </Box>

      <Divider />

      {/* Suggested Times */}
      <Box>
        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>
          Best Times to Post
        </Text>
        <VStack spacing={2} align="stretch">
          {recommendedTimes.map((time, index) => (
            <Button
              key={index}
              onClick={() => {
                if (onSelectTime) {
                  const now = new Date()
                  const scheduleTime = new Date(time)
                  // If time is in past, schedule for next occurrence
                  if (scheduleTime < now) {
                    scheduleTime.setDate(scheduleTime.getDate() + 1)
                  }
                  onSelectTime(scheduleTime)
                }
              }}
              variant="ghost"
              size="sm"
              justifyContent="flex-start"
              height="auto"
              py={2}
              px={3}
              color="blue.600"
              _hover={{ bg: 'blue.50' }}
            >
              <Text fontSize="sm" fontWeight="medium">
                {formatInTimezone(time, timezone, 'h:mm a')}
                <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                  (Click to schedule)
                </Text>
              </Text>
            </Button>
          ))}
        </VStack>
      </Box>
    </VStack>
  )
}