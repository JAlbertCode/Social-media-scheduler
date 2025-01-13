'use client'

import { QueueManagerContainer } from '../../components/QueueManagerContainer'
import { ScheduledPost } from '../../types/calendar'
import { getUserTimezone } from '../../utils/timezone'

export default function QueuePage() {
  const handleSchedulePost = (post: ScheduledPost, date: Date) => {
    console.log('Scheduling post:', post, 'for', date)
    // Here we would normally schedule via backend
  }

  const handleRemovePost = (postId: string) => {
    console.log('Removing post:', postId)
    // Here we would normally remove via backend
  }

  // Sample unscheduled posts
  const unscheduledPosts: ScheduledPost[] = [
    {
      id: '1',
      content: 'Sample unscheduled post 1',
      platforms: ['Twitter'],
      scheduledTime: new Date(),
    },
    {
      id: '2',
      content: 'Sample unscheduled post 2',
      platforms: ['LinkedIn', 'Twitter'],
      scheduledTime: new Date(),
    }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Queue Management</h1>
      <QueueManagerContainer
        unscheduledPosts={unscheduledPosts}
        onSchedulePost={handleSchedulePost}
        onRemovePost={handleRemovePost}
        timezone={getUserTimezone()}
      />
    </div>
  )
}