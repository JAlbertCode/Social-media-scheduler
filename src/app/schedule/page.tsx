'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '../../components/Calendar'
import { Timeline } from '../../components/Timeline'
import { TimezoneSelect } from '../../components/TimezoneSelect'
import { ScheduledPost } from '../../types/calendar'
import { getUserTimezone, fromUTC, toUTC } from '../../utils/timezone'

type ViewMode = 'calendar' | 'timeline'

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [timezone, setTimezone] = useState(getUserTimezone())
  const [posts, setPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      content: 'Sample post 1',
      platforms: ['Twitter'],
      scheduledTime: new Date(),
      timezone: getUserTimezone()
    }
  ])

  const handleMovePost = (postId: string, newDate: Date) => {
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          // Convert the new date to UTC based on the current timezone
          const utcDate = toUTC(newDate, timezone)
          return { ...post, scheduledTime: utcDate, timezone }
        }
        return post
      })
    )
  }

  const getPostsInTimezone = (posts: ScheduledPost[]): ScheduledPost[] => {
    return posts.map(post => ({
      ...post,
      scheduledTime: fromUTC(post.scheduledTime, timezone)
    }))
  }

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone)
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
              onChange={handleTimezoneChange}
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
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <Calendar
          posts={getPostsInTimezone(posts)}
          onMovePost={handleMovePost}
          onSelectSlot={(date) => {
            setSelectedDate(date)
            setViewMode('timeline')
          }}
        />
      ) : (
        <Timeline
          date={selectedDate}
          posts={getPostsInTimezone(posts)}
          onMovePost={handleMovePost}
        />
      )}
    </div>
  )
}