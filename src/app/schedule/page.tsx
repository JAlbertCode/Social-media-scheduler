'use client'

import { useState } from 'react'
import { Calendar } from '../../components/Calendar'
import { ScheduledPost } from '../../types/calendar'

export default function SchedulePage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      content: 'Sample post 1',
      platforms: ['Twitter'],
      scheduledTime: new Date()
    }
  ])

  const handleMovePost = (postId: string, newDate: Date) => {
    setPosts(currentPosts => 
      currentPosts.map(post => 
        post.id === postId
          ? { ...post, scheduledTime: newDate }
          : post
      )
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Content Calendar</h1>
      <Calendar
        posts={posts}
        onMovePost={handleMovePost}
        onSelectSlot={(date) => {
          console.log('Selected date:', date)
        }}
      />
    </div>
  )
}