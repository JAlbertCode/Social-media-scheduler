'use client'

import React, { useState, useCallback, useRef } from 'react'

// Types
export type PlatformType =
  | 'TWITTER'
  | 'INSTAGRAM'
  | 'TIKTOK'
  | 'LINKEDIN'
  | 'YOUTUBE_SHORTS'
export type ContentType = 'feed' | 'story' | 'reels'

interface MediaFile {
  file: File
  preview: string
  type: 'image' | 'video'
}

interface PostCreatorProps {
  selectedPlatforms: PlatformType[]
  onPostCreate: (post: {
    content: string
    hashtags: string[]
    mentions: string[]
    urls: string[]
    threads?: string[]
    media?: File[]
  }) => void
}

export function PostCreator({ selectedPlatforms, onPostCreate }: PostCreatorProps) {
  const [content, setContent] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [mentions, setMentions] = useState<string[]>([])
  const [urls, setUrls] = useState<string[]>([])
  const [threads, setThreads] = useState<string[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse content for hashtags, mentions, and URLs
  const parseContent = useCallback((text: string) => {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g
    const mentionRegex = /@[\w]+/g
    const urlRegex = /(https?:\/\/[^\s]+)/g

    setHashtags(text.match(hashtagRegex) || [])
    setMentions(text.match(mentionRegex) || [])
    setUrls(text.match(urlRegex) || [])
  }, [])

  // Handle content changes
  const handleContentChange = useCallback((text: string) => {
    setContent(text)
    parseContent(text)
  }, [parseContent])

  // Handle file selection
  const handleFiles = useCallback((files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const preview = URL.createObjectURL(file)
        setMediaFiles(prev => [...prev, {
          file,
          preview,
          type: file.type.startsWith('image/') ? 'image' : 'video'
        }])
      }
    })
  }, [])

  // Handle post creation
  const handleCreate = useCallback(() => {
    onPostCreate({
      content,
      hashtags,
      mentions,
      urls,
      threads: threads.length > 0 ? threads : undefined,
      media: mediaFiles.map(({ file }) => file)
    })
  }, [content, hashtags, mentions, urls, threads, mediaFiles, onPostCreate])

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      {/* Content Editor */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Write your post content..."
        />
      </div>

      {/* Media Upload */}
      <div
        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-gray-400"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          multiple
        />
        <p className="text-gray-600">Drop files or click to upload</p>
      </div>

      {/* Media Preview */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {mediaFiles.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100">
                {file.type === 'image' ? (
                  <img
                    src={file.preview}
                    alt={`Preview ${index + 1}`}
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={file.preview}
                    className="object-cover"
                    controls
                  />
                )}
                <button
                  onClick={() => {
                    URL.revokeObjectURL(file.preview)
                    setMediaFiles(files => files.filter((_, i) => i !== index))
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={handleCreate}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Create Post
      </button>
    </div>
  )
}