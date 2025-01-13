'use client'

import React, { useState } from 'react'
import { MediaUploader } from './MediaUploader'
import { PlatformType } from './PostCreator'

interface PostEditorProps {
  onSave: (content: string, media: any[], platforms: PlatformType[]) => void
  initialContent?: string
  initialPlatforms?: PlatformType[]
}

export function PostEditor({ 
  onSave,
  initialPlatforms = ['Twitter']
}: PostEditorProps) {
  const [media, setMedia] = useState<Array<{ type: 'image' | 'video'; preview: string }>>([])
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(initialPlatforms[0])

  const handleMediaSelect = (files: Array<{ type: 'image' | 'video'; preview: string }>) => {
    setMedia(files)
  }

  return (
    <div className="space-y-4">
      <MediaUploader
        platform={selectedPlatform}
        onMediaSelect={handleMediaSelect}
      />

      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((file, index) => (
            <div key={index} className="relative group aspect-square">
              {file.type === 'image' ? (
                <img
                  src={file.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <video
                  src={file.preview}
                  className="w-full h-full object-cover rounded-lg"
                  controls
                />
              )}
              <button
                onClick={() => {
                  const newMedia = [...media]
                  newMedia.splice(index, 1)
                  setMedia(newMedia)
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}