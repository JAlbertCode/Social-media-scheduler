'use client'

import React from 'react'
import { useDrop } from 'react-dnd'
import { ScheduledPost, DragItem } from '../types/calendar'
import { DraggablePost } from './DraggablePost'

interface TimelineProps {
  posts: ScheduledPost[]
  onMovePost?: (postId: string, newTime: Date) => void
  date: Date
}

export function Timeline({ posts, onMovePost, date }: TimelineProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  const getPostsForHour = (hour: number) => {
    return posts.filter(post => {
      const postTime = new Date(post.scheduledTime)
      return postTime.getHours() === hour &&
             postTime.getDate() === date.getDate() &&
             postTime.getMonth() === date.getMonth() &&
             postTime.getFullYear() === date.getFullYear()
    })
  }

  const TimeSlot = ({ hour }: { hour: number }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'POST',
      drop: (item: DragItem) => {
        if (onMovePost) {
          const newDate = new Date(date)
          newDate.setHours(hour)
          onMovePost(item.id, newDate)
        }
      },
      collect: monitor => ({
        isOver: !!monitor.isOver()
      })
    }))

    const hourPosts = getPostsForHour(hour)
    const formattedHour = hour.toString().padStart(2, '0') + ':00'

    return (
      <div
        ref={drop}
        className={`
          flex border-b border-gray-200 min-h-[100px]
          ${isOver ? 'bg-blue-50' : 'hover:bg-gray-50'}
        `}
      >
        <div className="w-20 p-2 border-r border-gray-200 flex-shrink-0">
          <span className="text-sm text-gray-500">{formattedHour}</span>
        </div>
        <div className="flex-grow p-2">
          {hourPosts.map((post) => (
            <DraggablePost key={post.id} post={post} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {date.toLocaleDateString(undefined, { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h2>
      </div>
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {hours.map((hour) => (
          <TimeSlot key={hour} hour={hour} />
        ))}
      </div>
    </div>
  )
}