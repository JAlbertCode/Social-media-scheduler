'use client'

import React, { useState } from 'react'
import { PostPreview } from './PostPreview'
import { PlatformType } from './PostCreator'

interface PreviewContainerProps {
  platforms: PlatformType[]
  content: string
  media?: Array<{ type: 'image' | 'video'; preview: string }>
}

export function PreviewContainer({ platforms, content, media }: PreviewContainerProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(platforms[0])

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        {platforms.map(platform => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium
              ${selectedPlatform === platform
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {platform}
          </button>
        ))}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex justify-center">
          <PostPreview
            platform={selectedPlatform}
            content={content}
            media={media}
          />
        </div>
      </div>
    </div>
  )
}