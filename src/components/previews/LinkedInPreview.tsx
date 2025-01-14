'use client'

import React from 'react'

interface LinkedInPreviewProps {
  content: string
  media?: Array<{
    type: 'image' | 'video'
    url: string
    previewUrl?: string
  }>
  profile: {
    name: string
    username: string
    profileImage?: string
    isVerified?: boolean
  }
}

export function LinkedInPreview({ content, media, profile }: LinkedInPreviewProps) {
  // Format content with hashtags and mentions
  const formattedContent = content.split(' ').map((word, index) => {
    if (word.startsWith('#')) {
      return (
        <span key={index} className="text-blue-600 hover:underline hover:text-blue-800">
          {word}{' '}
        </span>
      )
    }
    if (word.startsWith('@')) {
      return (
        <span key={index} className="text-blue-600 hover:underline hover:text-blue-800">
          {word}{' '}
        </span>
      )
    }
    if (word.startsWith('http')) {
      return (
        <span key={index} className="text-blue-600 hover:underline hover:text-blue-800">
          {word}{' '}
        </span>
      )
    }
    return word + ' '
  })

  return (
    <div className="bg-white border rounded-lg max-w-2xl">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <img
              src={profile.profileImage}
              alt={profile.name}
              className="w-12 h-12 rounded-full border"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">
              {profile.name}
            </p>
            <p className="text-sm text-gray-500">
              {profile.username}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Just now • 🌎
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 text-gray-900 whitespace-pre-wrap">
          {formattedContent}
        </div>
      </div>

      {/* Media */}
      {media && media.length > 0 && (
        <div className="border-t">
          <div className="grid grid-cols-1">
            {media.map((item, index) => (
              <div
                key={index}
                className="relative aspect-[1.91/1]"
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between text-gray-500">
          <button className="flex items-center space-x-2 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>Like</span>
          </button>

          <button className="flex items-center space-x-2 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span>Comment</span>
          </button>

          <button className="flex items-center space-x-2 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share</span>
          </button>

          <button className="flex items-center space-x-2 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}