'use client'

import React, { useState } from 'react'
import { PlatformType } from '../PostCreator'
import { PlatformPreview } from './PlatformPreview'
import { PreviewMedia, ProfileData } from './types'

interface PreviewContainerProps {
  platforms: PlatformType[]
  content: string
  media?: PreviewMedia[]
  profileData?: Record<PlatformType, ProfileData>
  className?: string
}

export function PreviewContainer({
  platforms,
  content,
  media,
  profileData,
  className = ''
}: PreviewContainerProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(platforms[0])

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Platform Tabs */}
      <div className="flex border-b">
        {platforms.map(platform => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`
              flex-1 py-3 text-sm font-medium
              ${selectedPlatform === platform
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {platform}
          </button>
        ))}
      </div>

      {/* Preview Content */}
      <div className="p-6">
        <div className="flex justify-center">
          <PlatformPreview
            platform={selectedPlatform}
            content={content}
            media={media}
            profileData={profileData?.[selectedPlatform]}
          />
        </div>

        {/* Platform-specific notes */}
        <div className="mt-4 text-sm text-gray-500">
          {selectedPlatform === 'Twitter' && (
            <div className="space-y-1">
              <p>• Images will be cropped to 1.91:1 ratio</p>
              <p>• Up to 4 images or 1 video allowed</p>
              <p>• Maximum tweet length: 280 characters</p>
            </div>
          )}
          {selectedPlatform === 'LinkedIn' && (
            <div className="space-y-1">
              <p>• Best image ratio: 1.91:1</p>
              <p>• Up to 9 images allowed</p>
              <p>• Maximum post length: 3,000 characters</p>
            </div>
          )}
        </div>

        {/* Character Count */}
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-gray-500">Characters:</span>
          <span className={
            content.length > (selectedPlatform === 'Twitter' ? 280 : 3000)
              ? 'text-red-500 font-medium'
              : 'text-gray-600'
          }>
            {content.length}
          </span>
        </div>

        {/* Media Count */}
        {media && media.length > 0 && (
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500">Media:</span>
            <span className={
              media.length > (selectedPlatform === 'Twitter' ? 4 : 9)
                ? 'text-red-500 font-medium'
                : 'text-gray-600'
            }>
              {media.length} {media.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}