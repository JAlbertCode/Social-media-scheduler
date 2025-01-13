'use client'

import { useState } from 'react'
import { Calendar } from '../../components/Calendar'
import { Timeline } from '../../components/Timeline'
import { TimezoneSelect } from '../../components/TimezoneSelect'
import { FrequencyRecommendations } from '../../components/FrequencyRecommendations'
import { QueueManagerContainer } from '../../components/QueueManagerContainer'
import { ScheduledPost } from '../../types/calendar'
import { getUserTimezone, fromUTC, toUTC } from '../../utils/timezone'
import { PlatformType } from '../../components/PostCreator'

type ViewMode = 'calendar' | 'timeline'

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [timezone, setTimezone] = useState(getUserTimezone())
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('Twitter')
  const [isFrequencyPanelOpen, setIsFrequencyPanelOpen] = useState(true)
  
  // Sample data - this would come from your backend
  const [scheduledPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      content: 'Sample scheduled post for Twitter',
      platforms: ['Twitter'],
      scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
    },
    {
      id: '2',
      content: 'Sample LinkedIn & Twitter post',
      platforms: ['LinkedIn', 'Twitter'],
      scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4 hours from now
    }
  ])

  const handleMovePost = (postId: string, newDate: Date) => {
    console.log('Moving post', postId, 'to', newDate)
    // Here we would update the post's scheduled time in the backend
  }

  const getPostsInTimezone = (posts: ScheduledPost[]): ScheduledPost[] => {
    return posts.map(post => ({
      ...post,
      scheduledTime: fromUTC(post.scheduledTime, timezone)
    }))
  }

  const getPostsForPlatform = (platform: PlatformType): Date[] => {
    return scheduledPosts
      .filter(post => post.platforms.includes(platform))
      .map(post => new Date(post.scheduledTime))
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              View Mode
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={
                  viewMode === 'calendar'
                    ? 'px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white'
                    : 'px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={
                  viewMode === 'timeline'
                    ? 'px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white'
                    : 'px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              >
                Timeline
              </button>
            </div>
          </div>

          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as PlatformType)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Twitter">Twitter</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram">Instagram</option>
            </select>
          </div>

          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <TimezoneSelect
              value={timezone}
              onChange={setTimezone}
            />
          </div>
        </div>

        <button
          onClick={() => setIsFrequencyPanelOpen(!isFrequencyPanelOpen)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          {isFrequencyPanelOpen ? 'Hide Analytics' : 'Show Analytics'}
        </button>
      </div>

      <div className="flex h-full">
        <div className={
          isFrequencyPanelOpen 
            ? 'flex-1 overflow-auto px-4 pr-[350px]'
            : 'flex-1 overflow-auto px-4'
        }>
          {viewMode === 'calendar' ? (
            <Calendar
              posts={getPostsInTimezone(scheduledPosts)}
              onMovePost={handleMovePost}
              onSelectSlot={(date) => {
                setSelectedDate(date)
                setViewMode('timeline')
              }}
            />
          ) : (
            <Timeline
              date={selectedDate}
              posts={getPostsInTimezone(scheduledPosts)}
              onMovePost={handleMovePost}
            />
          )}
        </div>

        {isFrequencyPanelOpen && (
          <div className="fixed right-0 top-0 h-full w-[350px] bg-white border-l border-gray-200 overflow-y-auto p-4">
            <FrequencyRecommendations
              platform={selectedPlatform}
              existingPosts={getPostsForPlatform(selectedPlatform)}
              timezone={timezone}
              onSelectTime={(time) => {
                setSelectedDate(time)
                setViewMode('timeline')
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}