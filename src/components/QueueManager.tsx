'use client'

import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { PlatformType } from './PostCreator'
import { ScheduledPost } from '../types/calendar'

interface QueuedPost extends Omit<ScheduledPost, 'scheduledTime'> {
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

  const handleAutoSchedule = (post: QueuedPost) => {
    // Get next available time slot based on platform recommendations
    const nextSlot = new Date()
    nextSlot.setHours(nextSlot.getHours() + 1)
    onSchedule(post, nextSlot)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Post Queue - {platform}</h3>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="queue">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {posts.map((post, index) => (
                <Draggable
                  key={post.id}
                  draggableId={post.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm truncate">{post.content}</p>
                          <div className="flex gap-1 mt-1">
                            {post.platforms.map(p => (
                              <span
                                key={p}
                                className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleAutoSchedule(post)}
                            className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Schedule
                          </button>
                          <button
                            onClick={() => onRemove(post.id)}
                            className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            Remove
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

      {posts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No posts in queue. Drag unscheduled posts here to add them to the queue.
        </div>
      )}
    </div>
  )
}