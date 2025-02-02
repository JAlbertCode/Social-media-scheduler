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
  Twitter: { icon: FaTwitter, color: '#1DA1F2' },  // Twitter blue
  LinkedIn: { icon: FaLinkedin, color: '#0A66C2' },  // LinkedIn blue
  Instagram: { icon: FaInstagram, color: '#E4405F' },  // Instagram pink
  TikTok: { icon: FaTiktok, color: '#000000' },  // TikTok black
  YouTube: { icon: FaYoutube, color: '#FF0000' },  // YouTube red
  Bluesky: { icon: SiBluesky, color: '#0560FF' },  // Bluesky blue
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
              icon={<config.icon style={{ fill: selectedPlatforms.includes(platform as PlatformType) ? 'white' : config.color }} />}
              size="md"
              variant='outline'
              color={selectedPlatforms.includes(platform as PlatformType) ? 'white' : config.color}
              bg={selectedPlatforms.includes(platform as PlatformType) ? config.color : 'white'}
              borderColor={config.color}
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