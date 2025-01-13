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
  // Organize posts by platform
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

  const handleSchedule = (platform: PlatformType, post: any, date: Date) => {
    // Remove from queue
    setQueues(current => ({
      ...current,
      [platform]: current[platform].filter(p => p.id !== post.id)
    }))

    // Schedule the post
    onSchedulePost({
      id: post.id,
      content: post.content,
      platforms: post.platforms,
      scheduledTime: date
    }, date)
  }

  const handleRemove = (platform: PlatformType, postId: string) => {
    setQueues(current => ({
      ...current,
      [platform]: current[platform].filter(p => p.id !== postId)
    }))
    onRemovePost(postId)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(queues).map(([platform, posts]) => (
          <QueueManager
            key={platform}
            platform={platform as PlatformType}
            posts={posts}
            onReorder={(newPosts) => handleReorder(platform as PlatformType, newPosts)}
            onSchedule={(post, date) => handleSchedule(platform as PlatformType, post, date)}
            onRemove={(postId) => handleRemove(platform as PlatformType, postId)}
          />
        ))}
      </div>

      {Object.keys(queues).length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No platforms configured for queueing.</p>
          <p className="text-sm text-gray-400">Add posts to start building your queue.</p>
        </div>
      )}
    </div>
  )
}