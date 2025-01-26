'use client'

import React, { useState } from 'react'
import { PostPreview } from './PostPreview'
import { PlatformType } from './PostCreator'
import clsx from 'clsx'

const PLATFORM_CONFIG = {
  Twitter: {
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    previewBg: 'bg-[#15202b]',
    textColor: 'text-white',
  },
  LinkedIn: {
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    previewBg: 'bg-white',
    textColor: 'text-gray-900',
  },
  Instagram: {
    icon: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z',
    previewBg: 'bg-white',
    textColor: 'text-gray-900',
  }
}

interface PreviewContainerProps {
  platforms: PlatformType[]
  content: string
  media?: Array<{ type: 'image' | 'video'; preview: string }>
}

export function PreviewContainer({ platforms, content, media }: PreviewContainerProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(platforms[0])
  const config = PLATFORM_CONFIG[selectedPlatform]

  return (
    <div className="space-y-4">
      {/* Platform Toggle */}
      <div className="flex items-center gap-2">
        {platforms.map(platform => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={clsx(
              "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              selectedPlatform === platform
                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-700/10"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path d={PLATFORM_CONFIG[platform].icon} fill="currentColor" />
            </svg>
            {platform}
          </button>
        ))}
      </div>

      {/* Preview Frame */}
      <div className={clsx(
        "rounded-xl overflow-hidden border shadow-sm",
        config.previewBg === 'bg-white' ? 'border-gray-200' : 'border-gray-700'
      )}>
        {/* Platform Header */}
        <div className={clsx(
          "px-4 py-3 border-b flex items-center gap-3",
          config.previewBg === 'bg-white' ? 'border-gray-200 bg-white' : 'border-gray-700/50 bg-gray-900'
        )}>
          <svg className={clsx(
            "w-5 h-5",
            config.previewBg === 'bg-white' ? 'text-gray-900' : 'text-white'
          )} viewBox="0 0 24 24">
            <path d={config.icon} fill="currentColor" />
          </svg>
          <span className={clsx(
            "font-medium",
            config.previewBg === 'bg-white' ? 'text-gray-900' : 'text-white'
          )}>
            {selectedPlatform} Preview
          </span>
        </div>

        {/* Preview Content */}
        <div className={clsx(
          "p-4",
          config.previewBg,
          config.textColor
        )}>
          <div className="max-w-[500px] mx-auto">
            <PostPreview
              platform={selectedPlatform}
              content={content}
              media={media}
            />
          </div>
        </div>
      </div>

      {/* Platform-specific Notes */}
      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-medium">Platform Requirements</span>
        </div>
        <ul className="ml-6 list-disc space-y-1">
          {selectedPlatform === 'Twitter' && (
            <>
              <li>280 character limit</li>
              <li>Up to 4 images or 1 video</li>
              <li>Videos must be under 2:20 minutes</li>
            </>
          )}
          {selectedPlatform === 'LinkedIn' && (
            <>
              <li>3000 character limit</li>
              <li>Up to 9 images or 1 video</li>
              <li>Videos must be under 10 minutes</li>
            </>
          )}
          {selectedPlatform === 'Instagram' && (
            <>
              <li>2200 character limit</li>
              <li>Up to 10 images or 1 video</li>
              <li>Videos must be between 3 and 60 seconds</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}