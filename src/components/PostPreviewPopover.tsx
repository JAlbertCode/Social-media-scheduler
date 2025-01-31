'use client'

import React from 'react'
import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  HStack,
  VStack,
  Text,
  Badge,
  Image,
  Icon,
} from '@chakra-ui/react'
import { FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa'
import { SiBluesky } from 'react-icons/si'
import { ScheduledPost } from '../types/calendar'
import { format } from 'date-fns'

const platformIcons = {
  Twitter: FaTwitter,
  LinkedIn: FaLinkedin,
  Instagram: FaInstagram,
  Bluesky: SiBluesky,
}

const platformColors = {
  Twitter: 'twitter.500',
  LinkedIn: 'linkedin.500',
  Instagram: 'pink.500',
  Bluesky: 'blue.500',
}

interface PostPreviewPopoverProps {
  post: ScheduledPost
  children: React.ReactNode
}

export function PostPreviewPopover({ post, children }: PostPreviewPopoverProps) {
  return (
    <Popover trigger="hover" placement="right" isLazy>
      <PopoverTrigger>
        {children}
      </PopoverTrigger>
      <PopoverContent width="300px">
        <PopoverBody p={4}>
          <VStack align="stretch" spacing={3}>
            {/* Time and Platforms */}
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.600">
                {format(post.scheduledTime, 'MMM d, yyyy h:mm a')}
              </Text>
              <HStack spacing={2}>
                {post.platforms.map(platform => {
                  const IconComponent = platformIcons[platform]
                  return (
                    <Icon
                      key={platform}
                      as={IconComponent}
                      color={platformColors[platform]}
                      boxSize={4}
                    />
                  )
                })}
              </HStack>
            </HStack>

            {/* Content */}
            <Text fontSize="sm" noOfLines={4}>
              {post.content}
            </Text>

            {/* Media Preview */}
            {post.media && post.media.length > 0 && (
              <Box position="relative">
                <Image
                  src={post.media[0].preview}
                  alt="Media preview"
                  width="100%"
                  height="120px"
                  objectFit="cover"
                  rounded="md"
                />
                {post.media.length > 1 && (
                  <Badge
                    position="absolute"
                    bottom={2}
                    right={2}
                    colorScheme="blackAlpha"
                    fontSize="xs"
                  >
                    +{post.media.length - 1} more
                  </Badge>
                )}
              </Box>
            )}

            {/* Status */}
            <Badge
              alignSelf="flex-start"
              colorScheme={post.status === 'scheduled' ? 'green' : 'gray'}
              variant="subtle"
              size="sm"
            >
              {post.status || 'Scheduled'}
            </Badge>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}