'use client'

import { useState } from 'react'
import { PostEditor } from '../../components/PostEditor'
import { PreviewContainer } from '../../components/PreviewContainer'
import { HashtagSuggestions } from '../../components/HashtagSuggestions'
import { ScheduledPost } from '../../types/calendar'
import { PlatformType } from '../../components/PostCreator'
import { getUserTimezone } from '../../utils/timezone'

// Platform-specific constraints
const PLATFORM_LIMITS = {
  Twitter: {
    characterLimit: 280,
    mediaLimit: 4,
  },
  LinkedIn: {
    characterLimit: 3000,
    mediaLimit: 9,
  },
  Instagram: {
    characterLimit: 2200,
    mediaLimit: 10,
  }
}

export default function ComposePage() {
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(['Twitter'])
  const [media, setMedia] = useState<Array<{ type: 'image' | 'video'; preview: string }>>([])
  const [error, setError] = useState<string | null>(null)

  const validateContent = (text: string, platforms: PlatformType[]): string | null => {
    for (const platform of platforms) {
      const limit = PLATFORM_LIMITS[platform].characterLimit
      if (text.length > limit) {
        return `Content exceeds ${platform} limit of ${limit} characters`
      }
      
      if (media.length > PLATFORM_LIMITS[platform].mediaLimit) {
        return `Too many media items for ${platform}. Maximum is ${PLATFORM_LIMITS[platform].mediaLimit}`
      }
    }
    return null
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    const validationError = validateContent(newContent, selectedPlatforms)
    setError(validationError)
  }

  const handlePlatformToggle = (platform: PlatformType) => {
    setSelectedPlatforms(current => {
      const newPlatforms = current.includes(platform)
        ? current.filter(p => p !== platform)
        : [...current, platform]
      
      const validationError = validateContent(content, newPlatforms)
      setError(validationError)
      return newPlatforms
    })
  }

  const handleHashtagSelect = (hashtag: string) => {
    let newContent = content
    if (!content.endsWith(' ') && content.length > 0) {
      newContent += ' '
    }
    newContent += hashtag + ' '
    handleContentChange(newContent)
  }

  const handleSave = async () => {
    const validationError = validateContent(content, selectedPlatforms)
    if (validationError) {
      setError(validationError)
      return
    }

    const post: Omit<ScheduledPost, 'id' | 'scheduledTime'> = {
      content,
      platforms: selectedPlatforms,
      media
    }

    console.log('Saving post:', post)
    // Here we would send to backend
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Create Post</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Platforms
                </label>
                <div className="flex gap-2">
                  {Object.keys(PLATFORM_LIMITS).map((platform) => (
                    <button
                      key={platform}
                      onClick={() => handlePlatformToggle(platform as PlatformType)}
                      className={
                        selectedPlatforms.includes(platform as PlatformType)
                          ? 'px-4 py-2 bg-blue-500 text-white rounded-lg'
                          : 'px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200'
                      }
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                  <span className="text-sm text-gray-500 ml-2">
                    {content.length} / {Math.min(...selectedPlatforms.map(p => PLATFORM_LIMITS[p].characterLimit))} characters
                  </span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full min-h-[200px] p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="What would you like to share?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media
                </label>
                <PostEditor
                  onSave={handleSave}
                  initialContent={content}
                  initialPlatforms={selectedPlatforms}
                />
              </div>

              {selectedPlatforms.map(platform => (
                <div key={platform} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {platform} Hashtag Suggestions
                  </h3>
                  <HashtagSuggestions
                    content={content}
                    platform={platform}
                    onHashtagSelect={handleHashtagSelect}
                  />
                </div>
              ))}

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={handleSave}
              disabled={!!error}
              className={
                error
                  ? 'w-full py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed'
                  : 'w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
              }
            >
              Schedule Post
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <PreviewContainer
            platforms={selectedPlatforms}
            content={content}
            media={media}
          />
        </div>
      </div>
    </div>
  )
}