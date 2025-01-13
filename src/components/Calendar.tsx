'use client'

import React, { useState } from 'react'
import { DndProvider, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ScheduledPost, DragItem } from '../types/calendar'
import { DraggablePost } from './DraggablePost'

interface CalendarProps {
  posts: ScheduledPost[]
  onSelectSlot?: (date: Date) => void
  onMovePost?: (postId: string, newDate: Date) => void
}

function CalendarDay({ 
  date,
  posts,
  isCurrentMonth,
  onDrop,
  onClick
}: { 
  date: Date
  posts: ScheduledPost[]
  isCurrentMonth: boolean
  onDrop: (item: DragItem) => void
  onClick: () => void
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'POST',
    drop: (item: DragItem) => onDrop(item),
    collect: monitor => ({
      isOver: !!monitor.isOver()
    })
  }))

  return (
    <div
      ref={drop}
      onClick={onClick}
      className={`
        min-h-24 p-2 bg-white cursor-pointer
        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
        ${isOver ? 'bg-blue-50' : 'hover:bg-gray-50'}
      `}
    >
      <div className="font-medium text-sm mb-1">
        {isCurrentMonth ? date.getDate() : ''}
      </div>
      {posts.map((post) => (
        <DraggablePost key={post.id} post={post} />
      ))}
    </div>
  )
}

export function Calendar({ posts, onSelectSlot, onMovePost }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const days = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  
  const getPostsForDay = (date: Date) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduledTime)
      return postDate.getDate() === date.getDate() &&
             postDate.getMonth() === date.getMonth() &&
             postDate.getFullYear() === date.getFullYear()
    })
  }

  const changeMonth = (increment: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + increment))
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white rounded-lg shadow">
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

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}

          {Array.from({ length: 42 }, (_, i) => {
            const dayNumber = i - firstDay + 1
            const isCurrentMonth = dayNumber > 0 && dayNumber <= days
            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              dayNumber
            )
            const dayPosts = isCurrentMonth ? getPostsForDay(date) : []
            
            return (
              <CalendarDay
                key={i}
                date={date}
                posts={dayPosts}
                isCurrentMonth={isCurrentMonth}
                onDrop={(item) => {
                  if (onMovePost && isCurrentMonth) {
                    onMovePost(item.id, date)
                  }
                }}
                onClick={() => {
                  if (isCurrentMonth && onSelectSlot) {
                    onSelectSlot(date)
                  }
                }}
              />
            )
          })}
        </div>
      </div>
    </DndProvider>
  )
}