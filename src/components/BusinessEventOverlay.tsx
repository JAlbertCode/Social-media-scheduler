'use client'

import React from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useColorModeValue,
} from '@chakra-ui/react'
import { BusinessEvent } from '../utils/businessEvents'
import { format } from 'date-fns'

interface BusinessEventOverlayProps {
  events: BusinessEvent[]
}

const eventTypeColors = {
  holiday: 'red',
  shopping: 'green',
  business: 'blue',
  industry: 'purple',
  company: 'orange'
}

export function BusinessEventOverlay({ events }: BusinessEventOverlayProps) {
  if (events.length === 0) return null

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box position="absolute" top={2} right={2} zIndex={2}>
      <Popover trigger="hover" placement="left">
        <PopoverTrigger>
          <Box
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            rounded="md"
            px={2}
            py={1}
            cursor="help"
          >
            <HStack spacing={1}>
              {events.slice(0, 3).map(event => (
                <Text key={event.id} fontSize="sm">
                  {event.icon}
                </Text>
              ))}
              {events.length > 3 && (
                <Badge colorScheme="gray" fontSize="xs">
                  +{events.length - 3}
                </Badge>
              )}
            </HStack>
          </Box>
        </PopoverTrigger>
        <PopoverContent width="300px">
          <PopoverBody p={4}>
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" fontWeight="medium">
                Business Events & Holidays
              </Text>
              {events.map(event => (
                <Box
                  key={event.id}
                  p={2}
                  bg={useColorModeValue(`${eventTypeColors[event.type]}.50`, `${eventTypeColors[event.type]}.900`)}
                  rounded="md"
                >
                  <HStack justify="space-between" mb={1}>
                    <HStack>
                      <Text>{event.icon}</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {event.name}
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme={
                        event.postingRecommendation === 'avoid' ? 'red' :
                        event.postingRecommendation === 'encouraged' ? 'green' :
                        'gray'
                      }
                    >
                      {event.impact}
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.300')}>
                    {format(event.startDate, 'MMM d, yyyy')}
                    {event.endDate.getTime() !== event.startDate.getTime() && 
                      ` - ${format(event.endDate, 'MMM d, yyyy')}`}
                  </Text>
                  {event.suggestedContent && (
                    <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.300')} mt={1}>
                      💡 {event.suggestedContent}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  )
}