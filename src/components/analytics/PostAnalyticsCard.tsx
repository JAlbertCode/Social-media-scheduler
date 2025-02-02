'use client'

import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  CircularProgress,
  CircularProgressLabel,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaEye, FaRetweet, FaHeart, FaComment } from 'react-icons/fa'

interface PostAnalytics {
  views: number
  viewsChange: number
  engagements: number
  engagementsChange: number
  likes: number
  likesChange: number
  comments: number
  commentsChange: number
  shareRate: number
  bestTimeToPost: string
}

interface PostAnalyticsCardProps {
  analytics: PostAnalytics
  platform: string
  isLoading?: boolean
}

export function PostAnalyticsCard({
  analytics,
  platform,
  isLoading = false
}: PostAnalyticsCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const getPerformanceColor = (value: number) => {
    if (value >= 75) return 'green.500'
    if (value >= 50) return 'yellow.500'
    return 'red.500'
  }

  if (isLoading) {
    return (
      <Box
        p={5}
        bg={cardBg}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="medium">Post Performance</Text>
            <Text color="gray.500">{platform}</Text>
          </HStack>
          <Text>Loading analytics...</Text>
        </VStack>
      </Box>
    )
  }

  const performanceScore = (
    (analytics.viewsChange + 
     analytics.engagementsChange + 
     analytics.likesChange + 
     analytics.commentsChange) / 4
  )

  return (
    <Box
      p={5}
      bg={cardBg}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="medium">Post Performance</Text>
          <Text color="gray.500">{platform}</Text>
        </HStack>

        {/* Overall Performance */}
        <HStack spacing={6} align="center">
          <CircularProgress
            value={performanceScore}
            color={getPerformanceColor(performanceScore)}
            size="100px"
          >
            <CircularProgressLabel>
              {performanceScore.toFixed(0)}%
            </CircularProgressLabel>
          </CircularProgress>

          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color="gray.500">Best Time to Post</Text>
            <Text fontSize="md" fontWeight="medium">
              {analytics.bestTimeToPost}
            </Text>
            <Text fontSize="sm" color="gray.500">
              based on your audience engagement
            </Text>
          </VStack>
        </HStack>

        {/* Detailed Stats */}
        <HStack spacing={4} wrap="wrap">
          <Stat minW="140px">
            <StatLabel>
              <HStack>
                <Icon as={FaEye} />
                <Text>Views</Text>
              </HStack>
            </StatLabel>
            <StatNumber>{analytics.views.toLocaleString()}</StatNumber>
            <StatHelpText>
              <StatArrow
                type={analytics.viewsChange > 0 ? 'increase' : 'decrease'}
              />
              {Math.abs(analytics.viewsChange)}%
            </StatHelpText>
          </Stat>

          <Stat minW="140px">
            <StatLabel>
              <HStack>
                <Icon as={FaHeart} />
                <Text>Likes</Text>
              </HStack>
            </StatLabel>
            <StatNumber>{analytics.likes.toLocaleString()}</StatNumber>
            <StatHelpText>
              <StatArrow
                type={analytics.likesChange > 0 ? 'increase' : 'decrease'}
              />
              {Math.abs(analytics.likesChange)}%
            </StatHelpText>
          </Stat>

          <Stat minW="140px">
            <StatLabel>
              <HStack>
                <Icon as={FaComment} />
                <Text>Comments</Text>
              </HStack>
            </StatLabel>
            <StatNumber>{analytics.comments.toLocaleString()}</StatNumber>
            <StatHelpText>
              <StatArrow
                type={analytics.commentsChange > 0 ? 'increase' : 'decrease'}
              />
              {Math.abs(analytics.commentsChange)}%
            </StatHelpText>
          </Stat>

          <Stat minW="140px">
            <StatLabel>
              <HStack>
                <Icon as={FaRetweet} />
                <Text>Share Rate</Text>
              </HStack>
            </StatLabel>
            <StatNumber>{analytics.shareRate.toFixed(1)}%</StatNumber>
            <StatHelpText>
              of viewers shared your post
            </StatHelpText>
          </Stat>
        </HStack>
      </VStack>
    </Box>
  )
}