'use client'

import { useState } from 'react'
import { QueueManagerContainer } from '../../components/QueueManagerContainer'
import { Timeline } from '../../components/Timeline'
import { FrequencyRecommendations } from '../../components/FrequencyRecommendations'
import { ScheduledPost } from '../../types/calendar'
import { PlatformType } from '../../components/PostCreator'
import { getUserTimezone } from '../../utils/timezone'

export default function QueuePage() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('Twitter')
  const [showRecommendations, setShowRecommendations] = useState(true)
  const timezone = getUserTimezone()

  // Sample unscheduled posts - would come from backend
  const [unscheduledPosts, setUnscheduledPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      content: 'Exciting news coming soon! Stay tuned for our latest updates. #announcement',
      platforms: ['Twitter', 'LinkedIn'],
      scheduledTime: new Date()
    },
    {
      id: '2',
      content: 'Check out our new product lineup - perfect for your workflow needs!',
      platforms: ['Twitter', 'Instagram'],
      scheduledTime: new Date()
    },
    {
      id: '3',
      content: 'Join us for an exclusive webinar on social media management strategies.',
      platforms: ['LinkedIn'],
      scheduledTime: new Date()
    }
  ])

  // Sample scheduled posts
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: '4',
      content: 'Already scheduled post example',
      platforms: ['Twitter'],
      scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 24) // Tomorrow
    }
  ])

  const handleSchedulePost = (post: ScheduledPost, date: Date) => {
    // Move post from unscheduled to scheduled
    setUnscheduledPosts(current => current.filter(p => p.id !== post.id))
    setScheduledPosts(current => [...current, { ...post, scheduledTime: date }])
  }

  const handleRemovePost = (postId: string) => {
    setUnscheduledPosts(current => current.filter(p => p.id !== postId))
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex h-full">
        {/* Main Queue Area */}
        <div className={
          showRecommendations 
            ? 'flex-1 overflow-auto p-4 pr-[400px]' 
            : 'flex-1 overflow-auto p-4'
        }>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Content Queue</h1>
              <button
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                {showRecommendations ? 'Hide Recommendations' : 'Show Recommendations'}
              </button>
            </div>

            <div className="space-x-2">
              {(['Twitter', 'LinkedIn', 'Instagram'] as PlatformType[]).map(platform => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={
                    selectedPlatform === platform
                      ? 'px-4 py-2 bg-blue-500 text-white rounded-lg'
                      : 'px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200'
                  }
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Queue Manager */}
          <div className="bg-white rounded-lg shadow-lg">
            <QueueManagerContainer
              unscheduledPosts={unscheduledPosts}
              onSchedulePost={handleSchedulePost}
              onRemovePost={handleRemovePost}
              timezone={timezone}
            />
          </div>

          {/* Next 24 Hours Timeline */}
          <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Next 24 Hours</h2>
            <Timeline
              date={new Date()}
              posts={scheduledPosts}
              onMovePost={(postId, newDate) => {
                setScheduledPosts(current =>
                  current.map(post =>
                    post.id === postId
                      ? { ...post, scheduledTime: newDate }
                      : post
                  )
                )
              }}
            />
          </div>
        </div>

        {/* Recommendations Panel */}
        {showRecommendations && (
          <div className="fixed right-0 top-0 h-full w-[400px] bg-white border-l border-gray-200 overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">Posting Recommendations</h2>
            <FrequencyRecommendations
              platform={selectedPlatform}
              existingPosts={scheduledPosts.map(post => post.scheduledTime)}
              timezone={timezone}
              onSelectTime={(time) => {
                // Handle recommended time selection
                if (unscheduledPosts.length > 0) {
                  handleSchedulePost(unscheduledPosts[0], time)
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}