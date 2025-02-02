'use client'

import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
  Link,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaCalendarPlus,
  FaPencilAlt,
  FaTrash,
} from 'react-icons/fa'

type ActivityType = 
  | 'post_published'
  | 'post_scheduled'
  | 'post_failed'
  | 'post_edited'
  | 'post_deleted'
  | 'calendar_created'

interface Activity {
  id: string
  type: ActivityType
  timestamp: Date
  platform?: string
  message: string
  details?: string
  postId?: string
}

interface RecentActivityCardProps {
  activities: Activity[]
  onActivityClick?: (activity: Activity) => void
}

export function RecentActivityCard({
  activities,
  onActivityClick
}: RecentActivityCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const iconColor = useColorModeValue('gray.600', 'gray.400')

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'post_published':
        return FaCheckCircle
      case 'post_scheduled':
        return FaClock
      case 'post_failed':
        return FaExclamationTriangle
      case 'post_edited':
        return FaPencilAlt
      case 'post_deleted':
        return FaTrash
      case 'calendar_created':
        return FaCalendarPlus
      default:
        return FaClock
    }
  }

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'post_published':
        return 'green'
      case 'post_scheduled':
        return 'blue'
      case 'post_failed':
        return 'red'
      case 'post_edited':
        return 'orange'
      case 'post_deleted':
        return 'red'
      case 'calendar_created':
        return 'purple'
      default:
        return 'gray'
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  return (
    <Box
      p={5}
      bg={cardBg}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="medium">Recent Activity</Text>

        <VStack spacing={3} align="stretch">
          {activities.map((activity) => (
            <Box
              key={activity.id}
              onClick={() => onActivityClick?.(activity)}
              cursor={onActivityClick ? 'pointer' : 'default'}
              _hover={{
                bg: useColorModeValue('gray.50', 'gray.700')
              }}
              p={2}
              rounded="md"
            >
              <HStack spacing={3} align="flex-start">
                <Icon
                  as={getActivityIcon(activity.type)}
                  color={`${getActivityColor(activity.type)}.500`}
                  boxSize={4}
                  mt={1}
                />
                
                <VStack spacing={1} align="start" flex={1}>
                  <HStack justify="space-between" width="100%">
                    <Text fontSize="sm">{activity.message}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {formatTimestamp(activity.timestamp)}
                    </Text>
                  </HStack>

                  {activity.platform && (
                    <Badge
                      size="sm"
                      colorScheme={getActivityColor(activity.type)}
                      variant="subtle"
                    >
                      {activity.platform}
                    </Badge>
                  )}

                  {activity.details && (
                    <Text fontSize="xs" color="gray.500">
                      {activity.details}
                    </Text>
                  )}

                  {activity.postId && (
                    <Link
                      fontSize="xs"
                      color="brand.500"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle post link click
                      }}
                    >
                      View Post
                    </Link>
                  )}
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>

        {activities.length === 0 && (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
            No recent activity
          </Text>
        )}
      </VStack>
    </Box>
  )
}