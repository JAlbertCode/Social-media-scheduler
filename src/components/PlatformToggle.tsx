'use client'

import React from 'react'
import {
  HStack,
  IconButton,
  Tooltip,
  Box,
} from '@chakra-ui/react'
import { PLATFORM_ICONS } from '../utils/platformIcons'
import { PlatformType, PLATFORM_CONFIG } from '../types/platforms'

interface PlatformToggleProps {
  selectedPlatforms: PlatformType[]
  onTogglePlatform: (platform: PlatformType) => void
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
              icon={React.createElement(PLATFORM_ICONS[platform as PlatformType])}
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