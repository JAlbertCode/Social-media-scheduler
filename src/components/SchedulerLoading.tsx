'use client'

import {
  Box,
  VStack,
  Skeleton,
  useColorModeValue,
} from '@chakra-ui/react'

export function SchedulerLoading() {
  return (
    <Box minH="calc(100vh - 64px)" bg={useColorModeValue('gray.50', 'gray.900')} p={6}>
      {/* Header Loading State */}
      <Box bg={useColorModeValue('white', 'gray.800')} shadow="sm" rounded="lg" p={4} mb={4}>
        <VStack spacing={4} align="stretch">
          <Skeleton height="32px" width="200px" />
          <Box display="flex" gap={4}>
            <Skeleton height="24px" width="120px" />
            <Skeleton height="24px" width="120px" />
            <Skeleton height="24px" width="160px" />
          </Box>
        </VStack>
      </Box>

      {/* Calendar Grid Loading State */}
      <Box 
        bg={useColorModeValue('white', 'gray.800')} 
        shadow="sm" 
        rounded="lg" 
        p={4}
        display="grid"
        gridTemplateColumns="repeat(7, 1fr)"
        gap={4}
      >
        {Array.from({ length: 35 }).map((_, i) => (
          <Box key={i} aspectRatio={1} p={2}>
            <Skeleton height="20px" width="30px" mb={2} />
            <VStack spacing={2} align="stretch">
              <Skeleton height="16px" />
              <Skeleton height="16px" width="70%" />
            </VStack>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
