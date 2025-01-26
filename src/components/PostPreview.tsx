'use client'

import React from 'react'
import { PlatformType } from './PostCreator'
import {
  Box,
  HStack,
  VStack,
  Text,
  Icon,
  Avatar,
  IconButton,
  Wrap,
  WrapItem,
  AspectRatio,
  Image,
} from '@chakra-ui/react'
import {
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaHeart,
  FaComment,
  FaRetweet,
  FaShare,
  FaRegBookmark,
  FaEllipsisH,
} from 'react-icons/fa'

interface PostPreviewProps {
  platform: PlatformType
  content: string
  media?: Array<{ type: 'image' | 'video'; preview: string }>
}

const platformConfig = {
  Twitter: {
    icon: FaTwitter,
    profileImage: '/placeholder-avatar.jpg',
    name: 'Twitter User',
    handle: '@twitteruser',
    actions: [
      { icon: FaComment, label: 'Reply' },
      { icon: FaRetweet, label: 'Retweet' },
      { icon: FaHeart, label: 'Like' },
      { icon: FaShare, label: 'Share' },
    ]
  },
  LinkedIn: {
    icon: FaLinkedin,
    profileImage: '/placeholder-avatar.jpg',
    name: 'LinkedIn User',
    headline: 'Professional Title • Company',
    actions: [
      { icon: FaHeart, label: 'Like' },
      { icon: FaComment, label: 'Comment' },
      { icon: FaShare, label: 'Share' },
    ]
  },
  Instagram: {
    icon: FaInstagram,
    profileImage: '/placeholder-avatar.jpg',
    username: 'instagramuser',
    actions: [
      { icon: FaHeart, label: 'Like' },
      { icon: FaComment, label: 'Comment' },
      { icon: FaShare, label: 'Share' },
      { icon: FaRegBookmark, label: 'Save' },
    ]
  }
}

export function PostPreview({ platform, content, media }: PostPreviewProps) {
  const config = platformConfig[platform]

  const TwitterPreview = () => (
    <Box p={4}>
      <HStack align="start" spacing={3}>
        <Avatar 
          src={config.profileImage} 
          size="md"
          name={config.name}
        />
        <VStack align="stretch" flex={1} spacing={2}>
          <HStack>
            <Text fontWeight="bold">{config.name}</Text>
            <Text color="gray.500">{config.handle}</Text>
          </HStack>
          <Text>{content}</Text>
          {media && media.length > 0 && (
            <Wrap spacing={2}>
              {media.map((item, index) => (
                <WrapItem 
                  key={index} 
                  flex={media.length === 1 ? '1' : '0 0 calc(50% - 0.5rem)'}
                >
                  <AspectRatio ratio={16/9} w="full">
                    <Box overflow="hidden" rounded="xl">
                      {item.type === 'image' ? (
                        <Image 
                          src={item.preview} 
                          alt="" 
                          objectFit="cover"
                        />
                      ) : (
                        <video
                          src={item.preview}
                          controls
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </Box>
                  </AspectRatio>
                </WrapItem>
              ))}
            </Wrap>
          )}
          <HStack spacing={6} pt={2}>
            {config.actions.map((action, index) => (
              <IconButton
                key={index}
                icon={<Icon as={action.icon} boxSize={4} />}
                aria-label={action.label}
                variant="ghost"
                size="sm"
                color="gray.500"
                _hover={{ color: platform === 'Twitter' ? 'blue.400' : 'gray.600' }}
              />
            ))}
          </HStack>
        </VStack>
      </HStack>
    </Box>
  )

  const LinkedInPreview = () => (
    <Box p={4}>
      <HStack align="start" spacing={3}>
        <Avatar 
          src={config.profileImage}
          size="md"
          name={config.name}
        />
        <VStack align="stretch" flex={1} spacing={2}>
          <Box>
            <Text fontWeight="semibold">{config.name}</Text>
            <Text fontSize="sm" color="gray.600">{config.headline}</Text>
            <Text fontSize="xs" color="gray.500">3h • Edited</Text>
          </Box>
          <Text>{content}</Text>
          {media && media.length > 0 && (
            <AspectRatio ratio={16/9}>
              <Box overflow="hidden" rounded="md">
                {media[0].type === 'image' ? (
                  <Image 
                    src={media[0].preview} 
                    alt="" 
                    objectFit="cover"
                  />
                ) : (
                  <video
                    src={media[0].preview}
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </Box>
            </AspectRatio>
          )}
          <HStack spacing={6} pt={2} borderTop="1px" borderColor="gray.200">
            {config.actions.map((action, index) => (
              <IconButton
                key={index}
                icon={<Icon as={action.icon} boxSize={4} />}
                aria-label={action.label}
                variant="ghost"
                size="sm"
                color="gray.600"
                _hover={{ color: 'blue.600' }}
              />
            ))}
          </HStack>
        </VStack>
      </HStack>
    </Box>
  )

  const InstagramPreview = () => (
    <Box>
      <HStack 
        justify="space-between" 
        p={3} 
        borderBottom="1px" 
        borderColor="gray.100"
      >
        <HStack spacing={3}>
          <Avatar
            src={config.profileImage}
            size="sm"
            name={config.username}
          />
          <Text fontWeight="semibold" fontSize="sm">
            {config.username}
          </Text>
        </HStack>
        <IconButton
          icon={<Icon as={FaEllipsisH} boxSize={4} />}
          aria-label="More options"
          variant="ghost"
          size="sm"
        />
      </HStack>

      {media && media.length > 0 && (
        <AspectRatio ratio={1}>
          <Box bg="black">
            {media[0].type === 'image' ? (
              <Image 
                src={media[0].preview} 
                alt="" 
                objectFit="contain"
              />
            ) : (
              <video
                src={media[0].preview}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </Box>
        </AspectRatio>
      )}

      <Box p={3}>
        <HStack justify="space-between" mb={2}>
          <HStack spacing={4}>
            {config.actions.slice(0, 3).map((action, index) => (
              <IconButton
                key={index}
                icon={<Icon as={action.icon} boxSize={5} />}
                aria-label={action.label}
                variant="ghost"
                size="sm"
              />
            ))}
          </HStack>
          <IconButton
            icon={<Icon as={config.actions[3].icon} boxSize={5} />}
            aria-label={config.actions[3].label}
            variant="ghost"
            size="sm"
          />
        </HStack>
        <Text fontSize="sm">
          <Text as="span" fontWeight="semibold" mr={2}>
            {config.username}
          </Text>
          {content}
        </Text>
      </Box>
    </Box>
  )

  return (
    <>
      {platform === 'Twitter' && <TwitterPreview />}
      {platform === 'LinkedIn' && <LinkedInPreview />}
      {platform === 'Instagram' && <InstagramPreview />}
    </>
  )
}