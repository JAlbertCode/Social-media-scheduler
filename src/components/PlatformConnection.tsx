'use client'

import { useState } from 'react'
import { Box, Flex, Center, Text, Button, Image } from '@chakra-ui/react'
import { PlatformType } from './PostCreator'
import { PlatformFactory } from '@/lib/platforms'

interface PlatformConnectionProps {
  platform: PlatformType
  isConnected: boolean
  profileData?: {
    username: string
    displayName?: string
    profileImage?: string
  }
  onConnect: () => Promise<void>
  onDisconnect: () => Promise<void>
}

export function PlatformConnection({
  platform,
  isConnected,
  profileData,
  onConnect,
  onDisconnect
}: PlatformConnectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await onConnect()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await onDisconnect()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show anything if platform isn't implemented
  if (!PlatformFactory.isImplemented(platform)) {
    return null
  }

  return (
    <Box bg="white" rounded="lg" shadow="sm" borderWidth="1px" p={4}>
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center" gap={4}>
          {/* Platform Icon */}
          <Center w="12" h="12" rounded="full" bg="gray.100">
            {platform.charAt(0)}
          </Center>

          {/* Platform Info */}
          <Box>
            <Text fontWeight="medium">{platform}</Text>
            {isConnected && profileData && (
              <Flex alignItems="center" gap={2} fontSize="sm" color="gray.600">
                {profileData.profileImage && (
                  <Image 
                    src={profileData.profileImage}
                    alt={profileData.username}
                    boxSize="4" rounded="full"
                  />
                )}
                <Text>{profileData.displayName || profileData.username}</Text>
              </Flex>
            )}
          </Box>
        </Flex>

        {/* Connection Status & Actions */}
        <Box>
          {isConnected ? (
            <Button
              onClick={handleDisconnect}
              disabled={isLoading}
              colorScheme="red" variant="ghost" size="sm"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isLoading}
              colorScheme="blue" size="sm"
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </Box>
      </Flex>

      {/* Error Message */}
      {error && (
        <Text mt={2} fontSize="sm" color="red.600">
          {error}
        </Text>
      )}

      {/* Platform Status */}
      <Box mt={4} fontSize="sm" color="gray.500">
        {isConnected ? (
          <Flex alignItems="center" gap={2}>
            <Box w={2} h={2} bg="green.500" rounded="full"></Box>
            <Text>Connected and ready to post</Text>
          </Flex>
        ) : (
          <Flex alignItems="center" gap={2}>
            <Box w={2} h={2} bg="gray.300" rounded="full"></Box>
            <Text>Not connected</Text>
          </Flex>
        )}
      </Box>
    </Box>
  )
}