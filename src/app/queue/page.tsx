'use client'

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useState } from 'react'
import { QueueManagerContainer } from '../../components/QueueManagerContainer'
import { Timeline } from '../../components/Timeline'
import { FrequencyRecommendations } from '../../components/FrequencyRecommendations'
import { ScheduledPost } from '../../types/calendar'
import { PlatformType } from '../../components/PostCreator'
import { getUserTimezone } from '../../utils/timezone'

function QueuePageContent() {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('Twitter')
  const [showRecommendations, setShowRecommendations] = useState(true)
  const timezone = getUserTimezone()

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

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: '4',
      content: 'Already scheduled post example',
      platforms: ['Twitter'],
      scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 24)
    }
  ])

  const handleSchedulePost = (post: ScheduledPost, date: Date) => {
    setUnscheduledPosts(current => current.filter(p => p.id !== post.id))
    setScheduledPosts(current => [...current, { ...post, scheduledTime: date }])
  }

  const handleRemovePost = (postId: string) => {
    setUnscheduledPosts(current => current.filter(p => p.id !== postId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-full">
          {/* Main Queue Area */}
          <div className={
            showRecommendations 
              ? 'flex-1 pr-[400px]' 
              : 'flex-1'
          }>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Content Queue</h1>
                <button
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {showRecommendations ? 'Hide Recommendations' : 'Show Recommendations'}
                </button>
              </div>

              <div className="flex space-x-3 mb-6">
                {(['Twitter', 'LinkedIn', 'Instagram'] as PlatformType[]).map(platform => (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-colors duration-200
                      ${selectedPlatform === platform
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}
                    `}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {/* Queue Manager */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <QueueManagerContainer
                unscheduledPosts={unscheduledPosts}
                onSchedulePost={handleSchedulePost}
                onRemovePost={handleRemovePost}
                timezone={timezone}
              />
            </div>

            {/* Next 24 Hours Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Next 24 Hours</h2>
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
            <div className="fixed right-0 top-0 h-full w-[400px] bg-white border-l border-gray-200 overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Posting Recommendations</h2>
                <FrequencyRecommendations
                  platform={selectedPlatform}
                  existingPosts={scheduledPosts.map(post => post.scheduledTime)}
                  timezone={timezone}
                  onSelectTime={(time) => {
                    if (unscheduledPosts.length > 0) {
                      handleSchedulePost(unscheduledPosts[0], time)
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function QueuePage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <QueuePageContent />
    </DndProvider>
  );
}