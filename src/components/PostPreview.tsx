'use client'

import React from 'react'
import { PlatformType } from './PostCreator'
import { ScheduledPost } from '../types/calendar'

interface PostPreviewProps {
  platform: PlatformType
  content: string
  media?: Array<{ type: 'image' | 'video'; preview: string }>
}

const platformConfig = {
  Twitter: {
    maxCharacters: 280,
    profileImage: '/twitter-avatar.png',
    name: 'Twitter User',
    handle: '@twitteruser'
  },
  LinkedIn: {
    maxCharacters: 3000,
    profileImage: '/linkedin-avatar.png',
    name: 'LinkedIn User',
    headline: 'Professional Title'
  },
  Instagram: {
    maxCharacters: 2200,
    profileImage: '/instagram-avatar.png',
    username: 'instagramuser'
  }
} as const

export function PostPreview({ platform, content, media }: PostPreviewProps) {
  const config = platformConfig[platform]

  const TwitterPreview = () => (
    <div className="max-w-lg border rounded-xl p-4 bg-white">
      <div className="flex items-start space-x-3">
        <img src={config.profileImage} alt="" className="w-12 h-12 rounded-full" />
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold">{config.name}</span>
            <span className="text-gray-500">{config.handle}</span>
          </div>
          <p className="mt-2 text-[15px]">{content}</p>
          {media && media.length > 0 && (
            <div className={`mt-3 grid gap-2 ${
              media.length === 1 ? 'grid-cols-1' : 
              media.length === 2 ? 'grid-cols-2' :
              media.length === 3 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {media.map((item, index) => (
                <div key={index} className={`
                  ${media.length === 3 && index === 0 ? 'col-span-2' : ''}
                  rounded-xl overflow-hidden
                `}>
                  {item.type === 'image' ? (
                    <img 
                      src={item.preview} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video 
                      src={item.preview} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const LinkedInPreview = () => (
    <div className="max-w-lg border rounded-lg p-4 bg-white">
      <div className="flex items-center space-x-3">
        <img src={config.profileImage} alt="" className="w-12 h-12 rounded-full" />
        <div>
          <div className="font-semibold">{config.name}</div>
          <div className="text-sm text-gray-500">{config.headline}</div>
        </div>
      </div>
      <p className="mt-4 text-sm">{content}</p>
      {media && media.length > 0 && (
        <div className="mt-4">
          {media.map((item, index) => (
            <div key={index} className="rounded-lg overflow-hidden">
              {item.type === 'image' ? (
                <img 
                  src={item.preview} 
                  alt="" 
                  className="w-full object-cover"
                />
              ) : (
                <video 
                  src={item.preview} 
                  controls 
                  className="w-full"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const InstagramPreview = () => (
    <div className="max-w-[400px] bg-white">
      <div className="border-b p-3">
        <div className="flex items-center space-x-3">
          <img src={config.profileImage} alt="" className="w-8 h-8 rounded-full" />
          <span className="font-semibold">{config.username}</span>
        </div>
      </div>
      {media && media.length > 0 && (
        <div className="aspect-square">
          {media.map((item, index) => (
            <div key={index} className="w-full h-full">
              {item.type === 'image' ? (
                <img 
                  src={item.preview} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <video 
                  src={item.preview} 
                  controls 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center space-x-1">
          <span className="font-semibold">{config.username}</span>
          <span>{content}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {platform === 'Twitter' && <TwitterPreview />}
      {platform === 'LinkedIn' && <LinkedInPreview />}
      {platform === 'Instagram' && <InstagramPreview />}
    </div>
  )
}