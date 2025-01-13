'use client'

import React, { useEffect, useState } from 'react'
import { PlatformType } from './PostCreator'
import {
  analyzeContentForHashtags,
  getTrendingHashtags,
  validateHashtags,
  getRecommendedHashtagPosition
} from '../utils/hashtagSuggestions'

interface HashtagSuggestionsProps {
  content: string
  platform: PlatformType
  onHashtagSelect: (hashtag: string) => void
}

export function HashtagSuggestions({
  content,
  platform,
  onHashtagSelect
}: HashtagSuggestionsProps) {
  const [contentSuggestions, setContentSuggestions] = useState<string[]>([])
  const [trendingSuggestions, setTrendingSuggestions] = useState<string[]>([])
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])
  const [validation, setValidation] = useState<{ valid: boolean; message?: string }>({ valid: true })

  useEffect(() => {
    // Analyze content for relevant hashtag suggestions
    const suggestions = analyzeContentForHashtags(content, platform)
    setContentSuggestions(suggestions)

    // Get trending hashtags
    const trending = getTrendingHashtags(platform)
    setTrendingSuggestions(trending)
  }, [content, platform])

  const handleHashtagClick = (hashtag: string) => {
    const newSelectedHashtags = [...selectedHashtags, hashtag]
    const validationResult = validateHashtags(newSelectedHashtags, platform)
    
    if (validationResult.valid) {
      setSelectedHashtags(newSelectedHashtags)
      onHashtagSelect(hashtag)
    }
    setValidation(validationResult)
  }

  const recommendedPosition = getRecommendedHashtagPosition(platform)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Suggested Hashtags
          <span className="ml-2 text-xs text-gray-500">
            (Recommended position: {recommendedPosition})
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {contentSuggestions.map((hashtag) => (
            <button
              key={hashtag}
              onClick={() => handleHashtagClick(hashtag)}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100"
            >
              {hashtag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Trending Hashtags
        </h3>
        <div className="flex flex-wrap gap-2">
          {trendingSuggestions.map((hashtag) => (
            <button
              key={hashtag}
              onClick={() => handleHashtagClick(hashtag)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
            >
              {hashtag}
            </button>
          ))}
        </div>
      </div>

      {!validation.valid && (
        <p className="text-sm text-red-600">
          {validation.message}
        </p>
      )}

      {selectedHashtags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Hashtags
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedHashtags.map((hashtag) => (
              <span
                key={hashtag}
                className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded-full"
              >
                {hashtag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}