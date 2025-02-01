'use client'

import { useState, useEffect } from 'react'
import { VStack } from '@chakra-ui/react'
import { Calendar } from '../../components/Calendar'
import { Timeline } from '../../components/Timeline'
import { TimezoneSelect } from '../../components/TimezoneSelect'
import { FrequencyRecommendations } from '../../components/FrequencyRecommendations'
import { QueueManagerContainer } from '../../components/QueueManagerContainer'
import { ScheduleGapAnalysis } from '../../components/ScheduleGapAnalysis'
import { CalendarManager } from '../../components/CalendarManager'
import { ScheduledPost } from '../../types/calendar'
import { CalendarConfig } from '../../types/calendars'
import { getUserTimezone, fromUTC, toUTC } from '../../utils/timezone'
import { PlatformType } from '../../components/PostCreator'

type ViewMode = 'calendar' | 'timeline'

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [timezone, setTimezone] = useState<string>('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(['Twitter', 'LinkedIn', 'Instagram'])
  const [activeFilter, setActiveFilter] = useState<PlatformType>('Twitter')
  const [isFrequencyPanelOpen, setIsFrequencyPanelOpen] = useState(true)
  const [calendars, setCalendars] = useState<CalendarConfig[]>([
    {
      id: '1',
      name: 'Main Campaign',
      color: '#3182CE',
      type: 'campaign',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Product Launch',
      color: '#38A169',
      type: 'product',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])
  const [activeCalendars, setActiveCalendars] = useState<string[]>(['1', '2'])

  useEffect(() => {
    setTimezone(getUserTimezone())
  }, [])
  
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

  const handleToggleCalendar = (calendarId: string) => {
    setActiveCalendars(prev =>
      prev.includes(calendarId)
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId]
    )
  }

  const handleAddCalendar = (calendar: Omit<CalendarConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCalendar: CalendarConfig = {
      ...calendar,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setCalendars(prev => [...prev, newCalendar])
    setActiveCalendars(prev => [...prev, newCalendar.id])
  }

  const handleEditCalendar = (calendar: CalendarConfig) => {
    setCalendars(prev =>
      prev.map(cal => cal.id === calendar.id ? calendar : cal)
    )
  }

  const handleDeleteCalendar = (calendarId: string) => {
    setCalendars(prev => prev.filter(cal => cal.id !== calendarId))
    setActiveCalendars(prev => prev.filter(id => id !== calendarId))
  }

  const getFilteredPostsByCalendar = () => {
    // In a real app, posts would have calendarIds
    // For now, we'll just return all posts if any calendar is active
    return activeCalendars.length > 0 ? scheduledPosts : []
  }

  const getPostCounts = () => {
    const counts: Record<PlatformType, number> = {
      Twitter: 0,
      LinkedIn: 0,
      Instagram: 0,
      TikTok: 0,
      YouTube: 0,
      Bluesky: 0,
    }

    scheduledPosts.forEach(post => {
      post.platforms.forEach(platform => {
        if (counts[platform] !== undefined) {
          counts[platform]++
        }
      })
    })

    return counts
  }

  const getFilteredPosts = () => {
    if (selectedPlatforms.length === 0) return scheduledPosts
    return scheduledPosts.filter(post =>
      post.platforms.some(platform => selectedPlatforms.includes(platform))
    )
  }

  if (!timezone) {
    return null; // or a loading spinner
  }

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
              Active Filter
            </label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as PlatformType)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {selectedPlatforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
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
              posts={getPostsInTimezone(getFilteredPostsByCalendar())}
              onMovePost={handleMovePost}
              onSelectSlot={(date) => {
                setSelectedDate(date)
                setViewMode('timeline')
              }}
              localTimezone={timezone}
              targetTimezones={["America/New_York", "Europe/London", "Asia/Tokyo"]}
            />
          ) : (
            <Timeline
              date={selectedDate}
              posts={getPostsInTimezone(getFilteredPosts())}
              onMovePost={handleMovePost}
            />
          )}
        </div>

        {isFrequencyPanelOpen && (
          <div className="fixed right-0 top-0 h-full w-[350px] bg-white border-l border-gray-200 overflow-y-auto p-4">
            <VStack spacing={4} align="stretch">
              <FrequencyRecommendations
                platform={activeFilter}
                existingPosts={getPostsForPlatform(activeFilter)}
                timezone={timezone}
                onSelectTime={(time) => {
                  setSelectedDate(time)
                  setViewMode('timeline')
                }}
              />

              <ScheduleGapAnalysis
                posts={getPostsInTimezone(getFilteredPosts())}
                date={selectedDate}
                recommendedMaxGap={8}
                recommendedMinGap={2}
              />

              <CalendarManager
                calendars={calendars}
                activeCalendars={activeCalendars}
                onToggleCalendar={handleToggleCalendar}
                onAddCalendar={handleAddCalendar}
                onEditCalendar={handleEditCalendar}
                onDeleteCalendar={handleDeleteCalendar}
              />
            </VStack>
          </div>
        )}
      </div>
    </div>
  )
}