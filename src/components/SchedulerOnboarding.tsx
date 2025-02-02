'use client'

import React from 'react'
import {
  Box,
  VStack,
  Text,
  Button,
  useColorModeValue,
  Icon,
  HStack,
} from '@chakra-ui/react'
import { FaCalendarAlt, FaClock, FaChartLine } from 'react-icons/fa'

interface OnboardingTipProps {
  icon: React.ElementType
  title: string
  description: string
  action?: string
  onClick?: () => void
}

function OnboardingTip({ icon, title, description, action, onClick }: OnboardingTipProps) {
  return (
    <Box
      p={4}
      bg={useColorModeValue('white', 'gray.800')}
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      rounded="lg"
      shadow="sm"
    >
      <HStack spacing={4} align="flex-start">
        <Icon
          as={icon}
          boxSize={5}
          color={useColorModeValue('blue.500', 'blue.300')}
          mt={1}
        />
        <VStack align="flex-start" spacing={2} flex={1}>
          <Text fontWeight="medium" fontSize="sm">
            {title}
          </Text>
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            {description}
          </Text>
          {action && (
            <Button
              size="sm"
              variant="link"
              colorScheme="blue"
              onClick={onClick}
            >
              {action}
            </Button>
          )}
        </VStack>
      </HStack>
    </Box>
  )
}

interface SchedulerOnboardingProps {
  onOpenCalendar: () => void
  onOpenTimeline: () => void
  onOpenInsights: () => void
}

export function SchedulerOnboarding({
  onOpenCalendar,
  onOpenTimeline,
  onOpenInsights
}: SchedulerOnboardingProps) {
  return (
    <VStack spacing={4} width="100%" maxW="md" mx="auto" p={4}>
      <OnboardingTip
        icon={FaCalendarAlt}
        title="Calendar View"
        description="Get a monthly overview of your scheduled posts. Drag and drop posts to easily reschedule them."
        action="View Calendar"
        onClick={onOpenCalendar}
      />
      
      <OnboardingTip
        icon={FaClock}
        title="Timeline View"
        description="Plan your posts hour by hour. Perfect for managing multiple posts in a single day."
        action="Switch to Timeline"
        onClick={onOpenTimeline}
      />
      
      <OnboardingTip
        icon={FaChartLine}
        title="Post Insights"
        description="Get AI-powered recommendations for the best times to post and analyze your posting patterns."
        action="View Insights"
        onClick={onOpenInsights}
      />
    </VStack>
  )
}
