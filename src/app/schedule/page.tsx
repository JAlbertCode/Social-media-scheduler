'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '../../components/Calendar'
import { Timeline } from '../../components/Timeline'
import { TimezoneSelect } from '../../components/TimezoneSelect'
import { FrequencyRecommendations } from '../../components/FrequencyRecommendations'
import { QueueManagerContainer } from '../../components/QueueManagerContainer'
import { ScheduledPost } from '../../types/calendar'
import { getUserTimezone, fromUTC, toUTC } from '../../utils/timezone'
import { PlatformType } from '../../components/PostCreator'

type ViewMode = 'calendar' | 'timeline' | 'queue'

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [timezone, setTimezone] = useState(getUserTimezone())
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('Twitter')
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [unscheduledPosts, setUnscheduledPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      content: 'Sample post 1',
      platforms: ['Twitter'],
      scheduledTime: new Date()
    }
  ])

  const handleMovePost = (postId: string, newDate: Date) => {
    setScheduledPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          const utcDate = toUTC(newDate, timezone)
          return { ...post, scheduledTime: utcDate, timezone }
        }
        return post
      })
    )
  }

  const handleSchedulePost = (post: ScheduledPost, date: Date) => {
    // Remove from unscheduled and add to scheduled
    setUnscheduledPosts(current => current.filter(p => p.id !== post.id))
    setScheduledPosts(current => [...current, { ...post, scheduledTime: date }])
  }

  const handleRemovePost = (postId: string) => {
    setUnscheduledPosts(current => current.filter(p => p.id !== postId))
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
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Content Calendar</h1>
        <div className="flex items-center gap-4">
          <div className="w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <TimezoneSelect
              value={timezone}
              onChange={(newTimezone) => setTimezone(newTimezone)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded ${
                viewMode === 'calendar'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded ${
                viewMode === 'timeline'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('queue')}
              className={`px-4 py-2 rounded ${
                viewMode === 'queue'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Queue
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'queue' ? (
        <QueueManagerContainer
          unscheduledPosts={unscheduledPosts}
          onSchedulePost={handleSchedulePost}
          onRemovePost={handleRemovePost}
          timezone={timezone}
        />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3">
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Analysis
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as PlatformType)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="Twitter">Twitter</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
              </select>
            </div>
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
        </div>
      )}
    </div>
  )
}