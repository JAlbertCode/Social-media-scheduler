'use client'

import React from 'react'
import {
  Box,
  HStack,
  Button,
  Text,
  useColorModeValue,
  Icon,
  Badge,
  Tooltip,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { PlatformType } from '../components/PostCreator'
import { FaTwitter, FaLinkedin, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'
import { SiBluesky } from 'react-icons/si'

interface PlatformFiltersProps {
  selectedPlatforms: PlatformType[]
  onPlatformToggle: (platform: PlatformType) => void
  postCounts: Record<PlatformType, number>
}

const platformInfo = {
  Twitter: { icon: FaTwitter, color: 'twitter.500' },
  LinkedIn: { icon: FaLinkedin, color: 'linkedin.500' },
  Instagram: { icon: FaInstagram, color: 'pink.500' },
  TikTok: { icon: FaTiktok, color: 'black' },
  YouTube: { icon: FaYoutube, color: 'red.500' },
  Bluesky: { icon: SiBluesky, color: 'blue.500' },
}

export function PlatformFilters({
  selectedPlatforms,
  onPlatformToggle,
  postCounts,
}: PlatformFiltersProps) {
  const buttonBg = useColorModeValue('gray.100', 'gray.700')
  const activeBg = useColorModeValue('brand.50', 'brand.900')
  const activeColor = useColorModeValue('brand.700', 'brand.100')

  return (
    <Box mb={4}>
      <Text fontSize="sm" fontWeight="medium" mb={2}>
        Platform Filters
      </Text>
      <Wrap spacing={2}>
        {Object.entries(platformInfo).map(([platform, info]) => (
          <WrapItem key={platform}>
            <Tooltip
              label={`${postCounts[platform as PlatformType] || 0} posts scheduled`}
              hasArrow
            >
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPlatformToggle(platform as PlatformType)}
                bg={selectedPlatforms.includes(platform as PlatformType) ? activeBg : buttonBg}
                color={selectedPlatforms.includes(platform as PlatformType) ? activeColor : 'inherit'}
                _hover={{
                  bg: selectedPlatforms.includes(platform as PlatformType) ? activeBg : buttonBg,
                  opacity: 0.8,
                }}
                leftIcon={<Icon as={info.icon} color={info.color} />}
              >
                {platform}
                {postCounts[platform as PlatformType] > 0 && (
                  <Badge
                    ml={2}
                    colorScheme={selectedPlatforms.includes(platform as PlatformType) ? 'brand' : 'gray'}
                    variant="solid"
                    borderRadius="full"
                  >
                    {postCounts[platform as PlatformType]}
                  </Badge>
                )}
              </Button>
            </Tooltip>
          </WrapItem>
        ))}
      </Wrap>
    </Box>
  )
}