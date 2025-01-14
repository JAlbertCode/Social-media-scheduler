'use client'

import React from 'react'
import { TwitterPreview } from './TwitterPreview'
import { LinkedInPreview } from './LinkedInPreview'
import { PlatformType } from '../PostCreator'

interface PlatformPreviewProps {
  platform: PlatformType
  content: string
  media?: Array<{
    type: 'image' | 'video'
    url: string
    previewUrl?: string
  }>
  profileData?: {
    name: string
    username: string
    profileImage?: string
    isVerified?: boolean
  }
}

export function PlatformPreview({
  platform,
  content,
  media,
  profileData
}: PlatformPreviewProps) {
  // Use mock profile data if none provided
  const defaultProfile = {
    name: `${platform} User`,
    username: platform.toLowerCase() + 'user',
    profileImage: '/default-avatar.png',
    isVerified: false
  }

  const profile = profileData || defaultProfile

  switch (platform) {
    case 'Twitter':
      return (
        <TwitterPreview 
          content={content}
          media={media}
          profile={profile}
        />
      )
    case 'LinkedIn':
      return (
        <LinkedInPreview
          content={content}
          media={media}
          profile={profile}
        />
      )
    default:
      // Default preview for unimplemented platforms
      return (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-2">
            {platform} Preview Coming Soon
          </div>
          <div className="prose max-w-none">
            <p>{content}</p>
          </div>
          {media && media.length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-2">Media:</div>
              <div className="grid grid-cols-2 gap-2">
                {media.map((item, index) => (
                  <div key={index} className="aspect-video bg-gray-100 rounded">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <video
                        src={item.url}
                        controls
                        className="w-full h-full object-cover rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
  }
}