'use client'

import React from 'react'

interface TwitterPreviewProps {
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

export function TwitterPreview({ content, media, profile }: TwitterPreviewProps) {
  // Format content with hashtags and mentions
  const formattedContent = content.split(' ').map((word, index) => {
    if (word.startsWith('#')) {
      return (
        <span key={index} className="text-blue-500 hover:underline">
          {word}{' '}
        </span>
      )
    }
    if (word.startsWith('@')) {
      return (
        <span key={index} className="text-blue-500 hover:underline">
          {word}{' '}
        </span>
      )
    }
    if (word.startsWith('http')) {
      return (
        <span key={index} className="text-blue-500 hover:underline">
          {word}{' '}
        </span>
      )
    }
    return word + ' '
  })

  return (
    <div className="bg-white border rounded-xl p-4 max-w-lg">
      {/* Header */}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <img
            src={profile.profileImage}
            alt={profile.name}
            className="w-12 h-12 rounded-full"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-1">
            <p className="font-bold text-gray-900 truncate">
              {profile.name}
            </p>
            {profile.isVerified && (
              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
              </svg>
            )}
            <span className="text-gray-500">@{profile.username}</span>
          </div>
          
          {/* Content */}
          <div className="mt-1 text-gray-900">
            {formattedContent}
          </div>

          {/* Media */}
          {media && media.length > 0 && (
            <div className="mt-3">
              <div className={`
                grid gap-2
                ${media.length === 1 ? 'grid-cols-1' : 
                  media.length === 2 ? 'grid-cols-2' :
                  media.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
                }
              `}>
                {media.map((item, index) => (
                  <div
                    key={index}
                    className={`
                      ${media.length === 3 && index === 0 ? 'col-span-2' : ''}
                      relative rounded-xl overflow-hidden
                      ${item.type === 'video' ? 'aspect-video' : 'aspect-square'}
                    `}
                  >
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={item.url}
                        controls
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between text-gray-500">
            <div className="flex items-center space-x-8">
              <button className="group flex items-center text-gray-500 hover:text-blue-500">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <button className="group flex items-center text-gray-500 hover:text-green-500">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button className="group flex items-center text-gray-500 hover:text-red-500">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}