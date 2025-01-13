'use client'

import React, { useState } from 'react'
import { PlatformType } from './PostCreator'

interface ScheduledPost {
  content: string
  platforms: PlatformType[]
  scheduledTime: Date
  media?: { type: 'image' | 'video'; preview: string }[]
}

interface CalendarProps {
  posts: ScheduledPost[]
  onSelectSlot?: (date: Date) => void
}

export function Calendar({ posts, onSelectSlot }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const days = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  
  // Get posts for a specific day
  const getPostsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return posts.filter(post => {
      const postDate = new Date(post.scheduledTime)
      return postDate.getDate() === day &&
             postDate.getMonth() === date.getMonth() &&
             postDate.getFullYear() === date.getFullYear()
    })
  }

  // Previous/Next month
  const changeMonth = (increment: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + increment))
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {/* Week days header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {Array.from({ length: 42 }, (_, i) => {
          const dayNumber = i - firstDay + 1
          const isCurrentMonth = dayNumber > 0 && dayNumber <= days
          const dayPosts = isCurrentMonth ? getPostsForDay(dayNumber) : []
          
          return (
            <div
              key={i}
              onClick={() => {
                if (isCurrentMonth && onSelectSlot) {
                  onSelectSlot(new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    dayNumber
                  ))
                }
              }}
              className={`
                min-h-24 p-2 bg-white hover:bg-gray-50 cursor-pointer
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
              `}
            >
              <div className="font-medium text-sm mb-1">
                {isCurrentMonth ? dayNumber : ''}
              </div>
              {/* Posts for this day */}
              {dayPosts.map((post, index) => (
                <div
                  key={index}
                  className="text-xs mb-1 p-1 rounded bg-blue-50 text-blue-700 truncate"
                >
                  {post.content.substring(0, 30)}
                  {post.content.length > 30 ? '...' : ''}
                  <div className="flex gap-1 mt-1">
                    {post.platforms.map(platform => (
                      <span
                        key={platform}
                        className="px-1 bg-blue-100 rounded text-[10px]"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}