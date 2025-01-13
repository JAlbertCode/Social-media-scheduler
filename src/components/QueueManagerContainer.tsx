'use client'

import React, { useState } from 'react'
import { QueueManager } from './QueueManager'
import { PlatformType } from './PostCreator'
import { ScheduledPost } from '../types/calendar'
import { getRecommendedTimes } from '../utils/frequency'

interface QueueManagerContainerProps {
  unscheduledPosts: ScheduledPost[]
  onSchedulePost: (post: ScheduledPost, date: Date) => void
  onRemovePost: (postId: string) => void
  timezone: string
}

interface QueueMap {
  [platform: string]: {
    id: string
    content: string
    platforms: PlatformType[]
    queuePosition: number
  }[]
}

export function QueueManagerContainer({
  unscheduledPosts,
  onSchedulePost,
  onRemovePost,
  timezone
}: QueueManagerContainerProps) {
  const [queues, setQueues] = useState<QueueMap>(() => {
    const initialQueues: QueueMap = {}
    unscheduledPosts.forEach(post => {
      post.platforms.forEach(platform => {
        if (!initialQueues[platform]) {
          initialQueues[platform] = []
        }
        initialQueues[platform].push({
          id: post.id,
          content: post.content,
          platforms: post.platforms,
          queuePosition: initialQueues[platform].length
        })
      })
    })
    return initialQueues
  })

  const handleReorder = (platform: PlatformType, posts: any[]) => {
    setQueues(current => ({
      ...current,
      [platform]: posts
    }))
  }

  const handleAutoSchedule = (platform: PlatformType, post: any) => {
    // Get next recommended time
    const recommendedTimes = getRecommendedTimes(
      platform,
      timezone,
      [] // You would pass existing scheduled times here
    )

    if (recommendedTimes.length > 0) {
      handleSchedule(platform, post, recommendedTimes[0])
    }
  }

  const handleSchedule = (platform: PlatformType, post: any, date: Date) => {
    // Remove from queue
    setQueues(current => ({
      ...current,
      [platform]: current[platform].filter(p => p.id !== post.id)
    }))

    // Schedule the post
    const originalPost = unscheduledPosts.find(p => p.id === post.id)
    if (originalPost) {
      onSchedulePost({
        ...originalPost,
        scheduledTime: date
      }, date)
    }
  }

  const handleRemove = (platform: PlatformType, postId: string) => {
    setQueues(current => ({
      ...current,
      [platform]: current[platform].filter(p => p.id !== postId)
    }))
    onRemovePost(postId)
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {Object.entries(queues).map(([platform, posts]) => (
        <div key={platform} className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{platform} Queue</h3>
            <span className="text-sm text-gray-500">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'} in queue
            </span>
          </div>
          
          <QueueManager
            platform={platform as PlatformType}
            posts={posts}
            onReorder={(newPosts) => handleReorder(platform as PlatformType, newPosts)}
            onSchedule={(post, date) => handleSchedule(platform as PlatformType, post, date)}
            onRemove={(postId) => handleRemove(platform as PlatformType, postId)}
          />
          
          {posts.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No posts in queue</p>
              <p className="text-sm text-gray-400">Drag unscheduled posts here</p>
            </div>
          )}
        </div>
      ))}

      {Object.keys(queues).length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No platforms configured</p>
          <p className="text-sm text-gray-400">Add posts to start building your queue</p>
        </div>
      )}
    </div>
  )
}