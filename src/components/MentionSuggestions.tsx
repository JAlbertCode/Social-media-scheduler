'use client'

import React, { useEffect, useState } from 'react'
import { PlatformType } from './PostCreator'
import {
  getMentionSuggestions,
  validateMention,
  countMentions,
  formatMention,
  getMentionRules
} from '../utils/mentionSuggestions'

interface MentionSuggestionsProps {
  content: string
  platform: PlatformType
  onMentionSelect: (mention: string) => void
  position?: { top: number; left: number }
}

export function MentionSuggestions({
  content,
  platform,
  onMentionSelect,
  position
}: MentionSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Array<{
    id: string
    username: string
    displayName: string
    verified?: boolean
  }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get the word being typed
        const words = content.split(/\s+/)
        const currentWord = words[words.length - 1]

        if (currentWord.startsWith('@')) {
          const query = currentWord.slice(1)
          const results = await getMentionSuggestions(query, platform)
          setSuggestions(results)
        } else {
          setSuggestions([])
        }
      } catch (err) {
        setError('Failed to load suggestions')
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [content, platform])

  const handleSelect = (suggestion: { username: string }) => {
    const mention = formatMention({ ...suggestion, platform })
    const validation = validateMention(mention, platform)
    
    if (validation.valid) {
      onMentionSelect(mention)
    } else {
      setError(validation.message)
    }
  }

  if (suggestions.length === 0 && !loading && !error) {
    return null
  }

  const style = position ? {
    position: 'absolute' as const,
    top: position.top,
    left: position.left,
  } : {}

  return (
    <div 
      className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm"
      style={style}
    >
      <div className="p-2">
        {loading ? (
          <div className="text-center py-2 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center py-2 text-red-500">{error}</div>
        ) : (
          <ul className="space-y-1">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <button
                  onClick={() => handleSelect(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium">{suggestion.username}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      {suggestion.displayName}
                    </span>
                  </div>
                  {suggestion.verified && (
                    <span className="text-blue-500">✓</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t px-3 py-2 text-xs text-gray-500">
        {getMentionRules(platform).maxMentions} mentions maximum
      </div>
    </div>
  )
}