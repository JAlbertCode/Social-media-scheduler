'use client'

import React, { useEffect, useState } from 'react'
import {
  analyzeForThread,
  suggestThreadStructure,
  formatThreadPreview,
  getThreadStats
} from '@/utils/threadSuggestions'

interface ThreadSuggestionsProps {
  content: string
  onApplySuggestion: (segments: string[]) => void
}

export function ThreadSuggestions({
  content,
  onApplySuggestion
}: ThreadSuggestionsProps) {
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeForThread> | null>(null)
  const [previewExpanded, setPreviewExpanded] = useState(false)

  useEffect(() => {
    if (content.length > 0) {
      const threadAnalysis = suggestThreadStructure(content)
      setAnalysis(threadAnalysis)
    } else {
      setAnalysis(null)
    }
  }, [content])

  if (!analysis?.isThreadRecommended) {
    return null
  }

  const stats = getThreadStats(analysis)

  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-blue-900">
            Thread Suggested
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            This content would work better as a thread of {analysis.segments.length} tweets
          </p>
        </div>
        <button
          onClick={() => onApplySuggestion(analysis.segments.map(s => s.content))}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create Thread
        </button>
      </div>

      {/* Thread Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-blue-600">Tweets: </span>
          <span className="text-blue-900">{stats.tweetCount}</span>
        </div>
        <div>
          <span className="text-blue-600">Avg Length: </span>
          <span className="text-blue-900">{stats.averageLength} chars</span>
        </div>
        <div>
          <span className="text-blue-600">Total Words: </span>
          <span className="text-blue-900">{stats.totalWords}</span>
        </div>
        <div>
          <span className="text-blue-600">Reading Time: </span>
          <span className="text-blue-900">~{stats.readingTime} min</span>
        </div>
      </div>

      {/* Thread Preview */}
      <div className="mt-4">
        <button
          onClick={() => setPreviewExpanded(!previewExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          {previewExpanded ? 'Hide' : 'Show'} Thread Preview
          <svg
            className={`ml-1 h-4 w-4 transform transition-transform ${
              previewExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {previewExpanded && (
          <div className="mt-2 space-y-4">
            {analysis.segments.map((segment, index) => (
              <div
                key={index}
                className="bg-white rounded p-3 border border-blue-100"
              >
                <div className="text-xs text-blue-500 mb-1">
                  Tweet {index + 1}/{analysis.segments.length}
                </div>
                <div className="text-sm text-gray-900">
                  {segment.content}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {segment.charCount} characters
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Writing Tips */}
      <div className="mt-4 text-sm text-blue-700">
        <p className="font-medium mb-1">Threading Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Each tweet naturally continues from the previous one</li>
          <li>Important points start new tweets for better emphasis</li>
          <li>Use numbering to help readers follow along</li>
          <li>End each tweet with a complete thought when possible</li>
        </ul>
      </div>
    </div>
  )
}