'use client'

import React from 'react'
import {
  HStack,
  IconButton,
  Tooltip,
  Box,
} from '@chakra-ui/react'
import { FaTwitter, FaLinkedin, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'
import { SiBluesky } from 'react-icons/si'
import { PlatformType } from './PostCreator'

interface PlatformToggleProps {
  selectedPlatforms: PlatformType[]
  onTogglePlatform: (platform: PlatformType) => void
}

const PLATFORM_CONFIG = {
  Twitter: { icon: FaTwitter, color: 'twitter.500' },
  LinkedIn: { icon: FaLinkedin, color: 'linkedin.500' },
  Instagram: { icon: FaInstagram, color: 'pink.500' },
  TikTok: { icon: FaTiktok, color: 'black' },
  YouTube: { icon: FaYoutube, color: 'red.500' },
  Bluesky: { icon: SiBluesky, color: 'blue.500' },
}

export function PlatformToggle({
  selectedPlatforms,
  onTogglePlatform
}: PlatformToggleProps) {
  return (
    <Box>
      <HStack spacing={2} wrap="wrap">
        {Object.entries(PLATFORM_CONFIG).map(([platform, config]) => (
          <Tooltip
            key={platform}
            label={`${selectedPlatforms.includes(platform as PlatformType) ? 'Disable' : 'Enable'} ${platform}`}
            placement="top"
          >
            <IconButton
              aria-label={platform}
              icon={<config.icon />}
              size="md"
              variant={selectedPlatforms.includes(platform as PlatformType) ? 'solid' : 'ghost'}
              color={selectedPlatforms.includes(platform as PlatformType) ? 'white' : config.color}
              bg={selectedPlatforms.includes(platform as PlatformType) ? config.color : 'transparent'}
              _hover={{
                bg: selectedPlatforms.includes(platform as PlatformType) ? config.color : 'gray.100',
              }}
              onClick={() => onTogglePlatform(platform as PlatformType)}
            />
          </Tooltip>
        ))}
      </HStack>
    </Box>
  )
}