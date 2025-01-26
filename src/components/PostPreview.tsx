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
  colors?: {
    textColor: string
    iconColor: string
    borderColor: string
  }
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

export function PostPreview({ 
  platform, 
  content, 
  media, 
  colors = {
    textColor: 'gray.900',
    iconColor: 'gray.600',
    borderColor: 'gray.200'
  } 
}: PostPreviewProps) {
  const config = platformConfig[platform]

  const SocialAction = ({ icon: IconComponent, label }: { icon: React.ComponentType, label: string }) => (
    <IconButton
      icon={<IconComponent size="16px" />}
      aria-label={label}
      variant="ghost"
      size="sm"
      color={colors.iconColor}
      _hover={{ color: colors.textColor }}
    />
  )

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
            <Text color={colors.textColor} fontWeight="bold">{config.name}</Text>
            <Text color={colors.iconColor}>{config.handle}</Text>
          </HStack>
          <Text color={colors.textColor}>{content}</Text>
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
              <SocialAction key={index} {...action} />
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
            <Text color={colors.textColor} fontWeight="semibold">{config.name}</Text>
            <Text fontSize="sm" color={colors.iconColor}>{config.headline}</Text>
            <Text fontSize="xs" color={colors.iconColor}>3h • Edited</Text>
          </Box>
          <Text color={colors.textColor}>{content}</Text>
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
          <HStack spacing={6} pt={2} borderTop="1px" borderColor={colors.borderColor}>
            {config.actions.map((action, index) => (
              <SocialAction key={index} {...action} />
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
        borderColor={colors.borderColor}
      >
        <HStack spacing={3}>
          <Avatar
            src={config.profileImage}
            size="sm"
            name={config.username}
          />
          <Text fontWeight="semibold" fontSize="sm" color={colors.textColor}>
            {config.username}
          </Text>
        </HStack>
        <IconButton
          icon={<FaEllipsisH size="16px" />}
          aria-label="More options"
          variant="ghost"
          size="sm"
          color={colors.iconColor}
          _hover={{ color: colors.textColor }}
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
              <SocialAction key={index} {...action} />
            ))}
          </HStack>
          <SocialAction {...config.actions[3]} />
        </HStack>
        <Text fontSize="sm" color={colors.textColor}>
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