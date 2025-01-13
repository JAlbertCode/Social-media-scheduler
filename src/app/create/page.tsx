'use client'

import React, { useState } from 'react'
import { PostCreator } from '@/components/PostCreator'

// Temporary type until we fix the exports
type PlatformType = 'TWITTER' | 'INSTAGRAM' | 'TIKTOK' | 'LINKEDIN' | 'YOUTUBE_SHORTS'

export default function CreatePage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(['TWITTER'])

  const handlePostCreate = async (postData: {
    content: string
    hashtags: string[]
    mentions: string[]
    urls: string[]
    threads?: string[]
    media?: File[]
    scheduledTime?: Date
  }) => {
    console.log('Creating post:', { ...postData, platforms: selectedPlatforms })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Post</h1>

      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {(['TWITTER', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'YOUTUBE_SHORTS'] as const).map((platform) => (
            <button
              key={platform}
              onClick={() => {
                if (selectedPlatforms.includes(platform)) {
                  setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform))
                } else {
                  setSelectedPlatforms([...selectedPlatforms, platform])
                }
              }}
              className={`p-4 rounded-lg border-2 transition-colors
                ${selectedPlatforms.includes(platform)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
            >
              {platform}
            </button>
          ))}
        </div>

        {selectedPlatforms.length > 0 && (
          <PostCreator
            selectedPlatforms={selectedPlatforms}
            onPostCreate={handlePostCreate}
          />
        )}
      </div>
    </div>
  )
}