'use client'

import React from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Icon,
} from '@chakra-ui/react'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { FaClock } from 'react-icons/fa'

interface TimezoneOverlayProps {
  date: Date
  localTimezone: string
  targetTimezones?: string[]
}

export function TimezoneOverlay({ date, localTimezone, targetTimezones }: TimezoneOverlayProps) {
  const getAllTimezones = () => {
    const timezoneTimes = [
      {
        zone: localTimezone,
        isLocal: true,
        time: date
      },
      ...(targetTimezones || []).map(zone => ({
        zone,
        isLocal: false,
        time: utcToZonedTime(date, zone)
      }))
    ]

    // Sort by UTC offset
    return timezoneTimes.sort((a, b) => {
      const offsetA = a.time.getTimezoneOffset()
      const offsetB = b.time.getTimezoneOffset()
      return offsetA - offsetB
    })
  }

  const bgColor = useColorModeValue('gray.50', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const badgeBg = useColorModeValue('brand.100', 'brand.800')
  const badgeColor = useColorModeValue('brand.700', 'brand.200')

  return (
    <Popover trigger="hover" placement="right">
      <PopoverTrigger>
        <Box
          position="absolute"
          top={2}
          left={2}
          cursor="help"
          zIndex={2}
        >
          <Icon as={FaClock} color={badgeColor} />
        </Box>
      </PopoverTrigger>
      <PopoverContent width="250px">
        <PopoverBody p={3}>
          <VStack align="stretch" spacing={2}>
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              Time Across Zones
            </Text>
            {getAllTimezones().map(({ zone, isLocal, time }) => (
              <Box
                key={zone}
                p={2}
                bg={bgColor}
                rounded="md"
                borderWidth={isLocal ? "1px" : "0"}
                borderColor={borderColor}
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight={isLocal ? "medium" : "normal"}>
                      {zone.replace('_', ' ')}
                    </Text>
                    <Text fontSize="xs" color={textColor}>
                      {format(time, 'h:mm a')}
                    </Text>
                  </VStack>
                  {isLocal && (
                    <Badge
                      bg={badgeBg}
                      color={badgeColor}
                      fontSize="xs"
                      px={2}
                      rounded="full"
                    >
                      Local
                    </Badge>
                  )}
                </HStack>
              </Box>
            ))}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}