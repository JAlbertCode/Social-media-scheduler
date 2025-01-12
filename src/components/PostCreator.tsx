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

// Platform Requirements
const PLATFORM_LIMITS: Record<
  PlatformType,
  {
    maxLength: number
    maxHashtags?: number
    maxMentions?: number
    maxUrls?: number
  }
> = {
  TWITTER: {
    maxLength: 280,
    maxHashtags: 30,
    maxMentions: 50,
    maxUrls: 5,
  },
  INSTAGRAM: {
    maxLength: 2200,
    maxHashtags: 30,
  },
  TIKTOK: {
    maxLength: 2200,
    maxHashtags: 30,
  },
  LINKEDIN: {
    maxLength: 3000,
  },
  YOUTUBE_SHORTS: {
    maxLength: 1000,
  },
}

interface PostCreatorProps {
  selectedPlatforms: PlatformType[]
  contentType?: ContentType
  onPostCreate: (post: {
    content: string
    hashtags: string[]
    mentions: string[]
    urls: string[]
    threads?: string[]
    media?: File[]
  }) => void
}

export const PostCreator: React.FC<PostCreatorProps> = ({
  selectedPlatforms,
  contentType = 'feed',
  onPostCreate,
}) => {
  const [content, setContent] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [mentions, setMentions] = useState<string[]>([])
  const [urls, setUrls] = useState<string[]>([])
  const [threads, setThreads] = useState<string[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get the most restrictive limits across all selected platforms
  const getStrictestLimits = useCallback(() => {
    return selectedPlatforms.reduce(
      (limits, platform) => {
        const platformLimits = PLATFORM_LIMITS[platform]
        return {
          maxLength: Math.min(limits.maxLength, platformLimits.maxLength),
          maxHashtags: Math.min(
            limits.maxHashtags || Infinity,
            platformLimits.maxHashtags || Infinity
          ),
          maxMentions: Math.min(
            limits.maxMentions || Infinity,
            platformLimits.maxMentions || Infinity
          ),
          maxUrls: Math.min(
            limits.maxUrls || Infinity,
            platformLimits.maxUrls || Infinity
          ),
        }
      },
      {
        maxLength: Infinity,
        maxHashtags: Infinity,
        maxMentions: Infinity,
        maxUrls: Infinity,
      }
    )
  }, [selectedPlatforms])

  // Parse content for hashtags, mentions, and URLs
  const parseContent = useCallback((text: string) => {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g
    const mentionRegex = /@[\w]+/g
    const urlRegex = /(https?:\/\/[^\s]+)/g

    setHashtags(text.match(hashtagRegex) || [])
    setMentions(text.match(mentionRegex) || [])
    setUrls(text.match(urlRegex) || [])
  }, [])

  // Handle file selection
  const handleFiles = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const preview = URL.createObjectURL(file)
        setMediaFiles((prev) => [
          ...prev,
          {
            file,
            preview,
            type: file.type.startsWith('image/') ? 'image' : 'video',
          },
        ])
      }
    })
  }, [])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  // Content validation and thread suggestion
  const validateContent = useCallback(
    (text: string) => {
      const limits = getStrictestLimits()
      const errors: Record<string, string> = {}

      if (text.length > limits.maxLength) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
        let currentThread = ''
        const newThreads: string[] = []

        sentences.forEach((sentence) => {
          if ((currentThread + sentence).length <= limits.maxLength) {
            currentThread += sentence
          } else {
            if (currentThread) newThreads.push(currentThread.trim())
            currentThread = sentence
          }
        })

        if (currentThread) newThreads.push(currentThread.trim())
        setThreads(newThreads)

        if (newThreads.length === 0) {
          errors.length = `Content exceeds maximum length of ${limits.maxLength} characters`
        }
      } else {
        setThreads([])
      }

      parseContent(text)
      setValidationErrors(errors)
      return Object.keys(errors).length === 0
    },
    [getStrictestLimits, parseContent]
  )

  // Handle content changes
  const handleContentChange = useCallback(
    (text: string) => {
      setContent(text)
      validateContent(text)
    },
    [validateContent]
  )

  // Handle post creation
  const handleCreate = useCallback(() => {
    if (validateContent(content)) {
      onPostCreate({
        content,
        hashtags,
        mentions,
        urls,
        threads: threads.length > 0 ? threads : undefined,
        media: mediaFiles.map(({ file }) => file),
      })
    }
  }, [
    content,
    hashtags,
    mentions,
    urls,
    threads,
    mediaFiles,
    validateContent,
    onPostCreate,
  ])

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      {/* Content Editor */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className={`w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${
              Object.keys(validationErrors).length > 0
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
          placeholder="Write your post content..."
        />
        <div className="absolute bottom-4 right-4 text-sm text-gray-500">
          {content.length} / {getStrictestLimits().maxLength}
        </div>
      </div>

      {/* Validation Errors */}
      {Object.entries(validationErrors).map(([key, error]) => (
        <div
          key={key}
          className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700"
        >
          {error}
        </div>
      ))}

      {/* Media Upload */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="font-medium">
              {isDragging
                ? 'Drop files here...'
                : 'Drop files or click to upload'}
            </p>
            <p className="mt-1">Images (PNG, JPG, GIF) or Videos (MP4, MOV)</p>
          </div>
        </div>
      </div>

      {/* Media Preview */}
      {mediaFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Selected Media
          </h3>
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
                      setMediaFiles((files) =>
                        files.filter((_, i) => i !== index)
                      )
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
        </div>
      )}

      {/* Thread Preview */}
      {threads.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-700 mb-2">
            Thread Preview ({threads.length} tweets)
          </h4>
          <div className="space-y-2">
            {threads.map((thread, index) => (
              <div
                key={index}
                className="p-3 bg-white rounded border border-blue-200"
              >
                <span className="text-sm text-blue-600">Tweet {index + 1}</span>
                <p className="mt-1">{thread}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Stats */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <span>Hashtags: {hashtags.length}</span>
        <span>Mentions: {mentions.length}</span>
        <span>URLs: {urls.length}</span>
      </div>

      {/* Create Button */}
      <button
        onClick={handleCreate}
        disabled={Object.keys(validationErrors).length > 0}
        className={`w-full py-2 px-4 rounded-lg text-white font-medium
          ${
            Object.keys(validationErrors).length > 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
      >
        Create Post
      </button>
    </div>
  )
}
