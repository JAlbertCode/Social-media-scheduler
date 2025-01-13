'use client'

import React, { useState } from 'react'
import { MediaUploader } from './MediaUploader'
import { PreviewContainer } from './PreviewContainer'
import { PlatformType } from './PostCreator'

interface PostEditorProps {
  onSave: (content: string, media: any[], platforms: PlatformType[]) => void
  initialContent?: string
  initialPlatforms?: PlatformType[]
}

export function PostEditor({ 
  onSave, 
  initialContent = '', 
  initialPlatforms = ['Twitter'] 
}: PostEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [media, setMedia] = useState<Array<{ type: 'image' | 'video'; preview: string }>>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(initialPlatforms)
  const [showPreview, setShowPreview] = useState(false)

  const handleSave = () => {
    onSave(content, media, selectedPlatforms)
  }

  const togglePlatform = (platform: PlatformType) => {
    setSelectedPlatforms(current =>
      current.includes(platform)
        ? current.filter(p => p !== platform)
        : [...current, platform]
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platforms
          </label>
          <div className="flex gap-2">
            {(['Twitter', 'LinkedIn', 'Instagram'] as PlatformType[]).map(platform => (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`
                  px-4 py-2 rounded
                  ${selectedPlatforms.includes(platform)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                  }
                `}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 rounded-lg border-gray-300 shadow-sm"
            placeholder="What would you like to share?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Media
          </label>
          <MediaUploader
            platform={selectedPlatforms[0]}
            onMediaSelect={(files) => 
              setMedia(files.map(f => ({
                type: f.type === 'image' ? 'image' : 'video',
                preview: f.preview
              })))
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 text-blue-500 hover:bg-blue-50 rounded"
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Schedule Post
        </button>
      </div>

      {showPreview && (
        <PreviewContainer
          platforms={selectedPlatforms}
          content={content}
          media={media}
        />
      )}
    </div>
  )
}