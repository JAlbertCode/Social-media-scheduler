'use client'

import React from 'react'
import { PlatformType } from './PostCreator'
import clsx from 'clsx'

interface PostPreviewProps {
  platform: PlatformType
  content: string
  media?: Array<{ type: 'image' | 'video'; preview: string }>
}

const defaultAvatar = '/placeholder-avatar.png'

const PlatformIcons = {
  like: (
    <svg className="w-5 h-5" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  comment: (
    <svg className="w-5 h-5" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  share: (
    <svg className="w-5 h-5" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  ),
  bookmark: (
    <svg className="w-5 h-5" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  )
}

const PLATFORM_CONFIG = {
  Twitter: {
    defaultAvatarUrl: defaultAvatar,
    name: 'Twitter User',
    handle: '@twitteruser',
    maxLength: 280
  },
  LinkedIn: {
    defaultAvatarUrl: defaultAvatar,
    name: 'LinkedIn User',
    headline: 'Professional Title • Company',
    maxLength: 3000
  },
  Instagram: {
    defaultAvatarUrl: defaultAvatar,
    username: 'instagramuser',
    name: 'Instagram User',
    maxLength: 2200
  }
}

export function PostPreview({ platform, content, media }: PostPreviewProps) {
  const config = PLATFORM_CONFIG[platform]

  const TwitterPreview = () => (
    <div className="w-full max-w-[500px] bg-white dark:bg-[#15202b] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              <img src={config.defaultAvatarUrl} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-sm">
              <span className="font-bold text-gray-900 dark:text-white">{config.name}</span>
              <span className="text-gray-500">{config.handle}</span>
            </div>
            <div className="mt-2 text-gray-900 dark:text-white whitespace-pre-wrap">{content}</div>
            {media && media.length > 0 && (
              <div className={clsx(
                'mt-3 grid gap-2 rounded-2xl overflow-hidden',
                media.length === 1 && 'grid-cols-1',
                media.length === 2 && 'grid-cols-2',
                media.length >= 3 && 'grid-cols-2'
              )}>
                {media.map((item, index) => (
                  <div key={index} className={clsx(
                    'relative',
                    media.length === 3 && index === 0 && 'col-span-2',
                    'aspect-[16/9]'
                  )}>
                    {item.type === 'image' ? (
                      <img src={item.preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <video src={item.preview} controls className="absolute inset-0 w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const LinkedInPreview = () => (
    <div className="w-full max-w-[500px] bg-white rounded-xl overflow-hidden border border-gray-200">
      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              <img src={config.defaultAvatarUrl} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900">{config.name}</div>
            <div className="text-sm text-gray-500">{config.headline}</div>
            <div className="mt-3 text-sm text-gray-900 whitespace-pre-wrap">{content}</div>
            {media && media.length > 0 && (
              <div className="mt-3 rounded-lg overflow-hidden">
                {media.map((item, index) => (
                  <div key={index} className="relative aspect-[16/9]">
                    {item.type === 'image' ? (
                      <img src={item.preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <video src={item.preview} controls className="absolute inset-0 w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const InstagramPreview = () => (
    <div className="w-full max-w-[400px] bg-white rounded-xl overflow-hidden border border-gray-200">
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              <img src={config.defaultAvatarUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-semibold">{config.username}</span>
          </div>
          <button className="text-gray-600">•••</button>
        </div>
      </div>

      {media && media.length > 0 && (
        <div className="relative aspect-square bg-black">
          {media.map((item, index) => (
            <div key={index} className="absolute inset-0">
              {item.type === 'image' ? (
                <img src={item.preview} alt="" className="w-full h-full object-contain" />
              ) : (
                <video src={item.preview} controls className="w-full h-full object-contain" />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="p-3">
        <div className="flex justify-between mb-2">
          <div className="flex gap-4">
            {PlatformIcons.like}
            {PlatformIcons.comment}
            {PlatformIcons.share}
          </div>
          {PlatformIcons.bookmark}
        </div>
        <div className="text-sm">
          <span className="font-semibold mr-2">{config.username}</span>
          <span className="whitespace-pre-wrap">{content}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full flex justify-center">
      {platform === 'Twitter' && <TwitterPreview />}
      {platform === 'LinkedIn' && <LinkedInPreview />}
      {platform === 'Instagram' && <InstagramPreview />}
    </div>
  )
}