'use client'

import { useDrag } from 'react-dnd'
import { ScheduledPost, DragItem } from '../types/calendar'

interface DraggablePostProps {
  post: ScheduledPost
}

export function DraggablePost({ post }: DraggablePostProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'POST',
    item: {
      type: 'POST',
      id: post.id,
      originalDate: post.scheduledTime
    } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="text-xs mb-1 p-1 rounded bg-blue-50 text-blue-700 truncate cursor-move"
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
  )
}