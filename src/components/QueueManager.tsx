'use client'

import React from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { PlatformType } from './PostCreator'

interface QueuedPost {
  id: string
  content: string
  platforms: PlatformType[]
  queuePosition: number
}

interface QueueManagerProps {
  posts: QueuedPost[]
  platform: PlatformType
  onReorder: (posts: QueuedPost[]) => void
  onSchedule: (post: QueuedPost, date: Date) => void
  onRemove: (postId: string) => void
}

export function QueueManager({
  posts,
  platform,
  onReorder,
  onSchedule,
  onRemove
}: QueueManagerProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(posts)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      queuePosition: index
    }))

    onReorder(updatedItems)
  }

  const handleScheduleNow = (post: QueuedPost) => {
    // Schedule for the next available time slot
    const nextSlot = new Date()
    nextSlot.setMinutes(nextSlot.getMinutes() + 15) // 15 minutes from now
    onSchedule(post, nextSlot)
  }

  const handleScheduleLater = (post: QueuedPost) => {
    // Schedule for tomorrow at 9 AM
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    onSchedule(post, tomorrow)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="queue">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
          >
            {posts.map((post, index) => (
              <Draggable
                key={post.id}
                draggableId={post.id}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`
                      bg-white border rounded-lg shadow-sm
                      ${snapshot.isDragging ? 'shadow-md' : ''}
                      transition-shadow duration-200
                    `}
                  >
                    <div className="p-4">
                      {/* Drag Handle */}
                      <div 
                        {...provided.dragHandleProps}
                        className="flex items-center justify-between mb-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">☰</span>
                          <span className="text-sm text-gray-500">
                            Position {index + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {post.platforms.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-gray-700 mb-4">
                        {post.content.length > 100
                          ? `${post.content.substring(0, 100)}...`
                          : post.content
                        }
                      </p>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleScheduleNow(post)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Schedule Now
                          </button>
                          <button
                            onClick={() => handleScheduleLater(post)}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            Schedule Later
                          </button>
                        </div>
                        <button
                          onClick={() => onRemove(post.id)}
                          className="p-1 text-red-500 hover:text-red-600"
                        >
                          <span className="sr-only">Remove</span>
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}