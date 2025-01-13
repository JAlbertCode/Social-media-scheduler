'use client'

import React from 'react'
import { PlatformType } from '@/components/PostCreator'

interface PlatformSelectorProps {
  selectedPlatforms: PlatformType[]
  onPlatformsChange: (platforms: PlatformType[]) => void
}

export function PlatformSelector({ selectedPlatforms, onPlatformsChange }: PlatformSelectorProps) {
  const platforms: PlatformType[] = [
    'TWITTER',
    'INSTAGRAM',
    'TIKTOK',
    'LINKEDIN',
    'YOUTUBE_SHORTS',
  ]

  const togglePlatform = (platform: PlatformType) => {
    if (selectedPlatforms.includes(platform)) {
      onPlatformsChange(selectedPlatforms.filter((p) => p !== platform))
    } else {
      onPlatformsChange([...selectedPlatforms, platform])
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {platforms.map((platform) => (
        <button
          key={platform}
          onClick={() => togglePlatform(platform)}
          className={`p-4 rounded-lg border-2 transition-colors
            ${
              selectedPlatforms.includes(platform)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
        >
          {platform}
        </button>
      ))}
    </div>
  )
}