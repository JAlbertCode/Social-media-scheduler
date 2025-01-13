'use client'

import { useState, useRef, useEffect } from 'react'
import { PostEditor } from '../../components/PostEditor'
import { PreviewContainer } from '../../components/PreviewContainer'
import { HashtagSuggestions } from '../../components/HashtagSuggestions'
import { MentionSuggestions } from '../../components/MentionSuggestions'
import { ScheduledPost } from '../../types/calendar'
import { PlatformType } from '../../components/PostCreator'
import { getUserTimezone } from '../../utils/timezone'
import { countMentions } from '../../utils/mentionSuggestions'

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
  const [cursorPosition, setCursorPosition] = useState<{ top: number; left: number } | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const validateContent = (text: string, platforms: PlatformType[]): string | null => {
    for (const platform of platforms) {
      // Character limit validation
      const limit = PLATFORM_LIMITS[platform].characterLimit
      if (text.length > limit) {
        return `Content exceeds ${platform} limit of ${limit} characters`
      }
      
      // Media validation
      if (media.length > PLATFORM_LIMITS[platform].mediaLimit) {
        return `Too many media items for ${platform}. Maximum is ${PLATFORM_LIMITS[platform].mediaLimit}`
      }

      // Mentions validation
      const mentionsCount = countMentions(text, platform)
      if (!mentionsCount.valid) {
        return mentionsCount.message
      }
    }
    return null
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    const validationError = validateContent(newContent, selectedPlatforms)
    setError(validationError)

    // Update cursor position for mention suggestions
    if (textareaRef.current) {
      const { selectionStart } = textareaRef.current
      const lines = newContent.slice(0, selectionStart).split('\n')
      const lineHeight = 24 // Approximate line height in pixels
      const rect = textareaRef.current.getBoundingClientRect()
      
      setCursorPosition({
        top: rect.top + lines.length * lineHeight,
        left: rect.left + (lines[lines.length - 1].length * 8) // Approximate character width
      })
    }
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

  const handleMentionSelect = (mention: string) => {
    // Replace the current word with the mention
    const words = content.split(/\s+/)
    words[words.length - 1] = mention
    const newContent = words.join(' ') + ' '
    handleContentChange(newContent)
    setCursorPosition(null)
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
  }

  // Clean up cursor position when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setCursorPosition(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

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

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                  <span className="text-sm text-gray-500 ml-2">
                    {content.length} / {Math.min(...selectedPlatforms.map(p => PLATFORM_LIMITS[p].characterLimit))} characters
                  </span>
                </label>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full min-h-[200px] p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="What would you like to share?"
                />
                {cursorPosition && content.split(/\s+/).pop()?.startsWith('@') && (
                  <div className="absolute z-10" style={cursorPosition}>
                    <MentionSuggestions
                      content={content}
                      platform={selectedPlatforms[0]}
                      onMentionSelect={handleMentionSelect}
                    />
                  </div>
                )}
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