'use client'

import React from 'react'
import { PlatformType } from './PostCreator'
import { getRecommendedTimes, analyzePostingPattern } from '../utils/frequency'
import { formatInTimezone } from '../utils/timezone'

interface FrequencyRecommendationsProps {
  platform: PlatformType
  existingPosts: Date[]
  timezone: string
  onSelectTime?: (time: Date) => void
}

export function FrequencyRecommendations({
  platform,
  existingPosts,
  timezone,
  onSelectTime
}: FrequencyRecommendationsProps) {
  const analysis = analyzePostingPattern(existingPosts, platform)
  const recommendedTimes = getRecommendedTimes(platform, timezone, existingPosts)

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">
        Posting Recommendations for {platform}
      </h3>
      
      <div className="space-y-4">
        {/* Current Pattern Analysis */}
        <div className="border-b pb-4">
          <h4 className="font-medium mb-2">Current Posting Pattern</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Average Frequency</p>
              <p className="font-medium">
                {analysis.frequency.toFixed(1)} posts/day
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time Consistency</p>
              <p className="font-medium">
                {(analysis.consistency * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="border-b pb-4">
          <h4 className="font-medium mb-2">Recommendations</h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-600">
                • {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Suggested Times */}
        <div>
          <h4 className="font-medium mb-2">Recommended Posting Times</h4>
          <div className="space-y-2">
            {recommendedTimes.map((time, index) => (
              <button
                key={index}
                onClick={() => onSelectTime?.(time)}
                className="block w-full text-left p-2 rounded hover:bg-blue-50 transition-colors"
              >
                <span className="text-sm text-blue-600">
                  {formatInTimezone(time, timezone, 'h:mm a')}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  (Click to schedule)
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}