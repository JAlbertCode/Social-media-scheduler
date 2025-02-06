'use client'

import React, { useState } from 'react'
import { PostPreview } from './PostPreview'
import { PlatformType } from './PostCreator'
import {
  Box,
  ButtonGroup,
  Button,
  Icon,
  VStack,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram,
  FaTiktok,
  FaYoutube
} from 'react-icons/fa'
import { FarcasterIcon } from './icons/FarcasterIcon'
import { SiBluesky } from 'react-icons/si'

const PLATFORM_CONFIG = {
  Twitter: {
    icon: FaTwitter,
    bgColor: '#15202b',
    textColor: 'white',
    iconColor: 'whiteAlpha.800',
    borderColor: 'whiteAlpha.200'
  },
  LinkedIn: {
    icon: FaLinkedin,
    bgColor: 'white',
    textColor: 'gray.900',
    iconColor: 'gray.600',
    borderColor: 'gray.200',
  },
  Instagram: {
    icon: FaInstagram,
    bgColor: 'white',
    textColor: 'gray.900',
    iconColor: 'gray.600',
    borderColor: 'gray.200'
  },
  TikTok: {
    icon: FaTiktok,
    bgColor: 'black',
    textColor: 'white',
    iconColor: 'whiteAlpha.800',
    borderColor: 'whiteAlpha.200'
  },
  YouTube: {
    icon: FaYoutube,
    bgColor: 'white',
    textColor: 'gray.900',
    iconColor: 'red.500',
    borderColor: 'gray.200'
  },
  Bluesky: {
    icon: SiBluesky,
    bgColor: 'white',
    textColor: 'gray.900',
    iconColor: 'blue.500',
    borderColor: 'gray.200'
  },
  Threads: {
    icon: FaTwitter, // Placeholder
    bgColor: 'black',
    textColor: 'white',
    iconColor: 'whiteAlpha.800',
    borderColor: 'whiteAlpha.200'
  },
  Warpcast: {
    icon: FarcasterIcon,
    bgColor: 'white',
    textColor: 'gray.900',
    iconColor: '#4A148C',
    borderColor: '#4A148C'
  }
}

interface PreviewContainerProps {
  platforms: PlatformType[]
  content: string
  media?: Array<{ type: 'image' | 'video'; preview: string }>
}

export function PreviewContainer({ platforms, content, media }: PreviewContainerProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(platforms[0])

  return (
    <VStack spacing={4} align="stretch">
      <ButtonGroup spacing={2} size="sm" isAttached variant="outline">
        {platforms.map(platform => (
          <Button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            isActive={selectedPlatform === platform}
            leftIcon={<Icon as={PLATFORM_CONFIG[platform].icon} boxSize={4} />}
            colorScheme={selectedPlatform === platform ? 'brand' : 'gray'}
            variant={selectedPlatform === platform ? 'solid' : 'outline'}
          >
            {platform}
          </Button>
        ))}
      </ButtonGroup>

      <Box
        bg={PLATFORM_CONFIG[selectedPlatform].bgColor}
        color={PLATFORM_CONFIG[selectedPlatform].textColor}
        rounded="lg"
        overflow="hidden"
        shadow="sm"
        borderColor={PLATFORM_CONFIG[selectedPlatform].borderColor}
        borderWidth="1px"
      >
        <PostPreview
          platform={selectedPlatform}
          content={content}
          media={media}
          colors={{
            textColor: PLATFORM_CONFIG[selectedPlatform].textColor,
            iconColor: PLATFORM_CONFIG[selectedPlatform].iconColor,
            borderColor: PLATFORM_CONFIG[selectedPlatform].borderColor
          }}
        />
      </Box>
    </VStack>
  )
}