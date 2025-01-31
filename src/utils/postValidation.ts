import { ScheduledPost } from '../types/calendar'
import { isWithinInterval, addMinutes, subMinutes } from 'date-fns'

interface ConflictResult {
  hasConflict: boolean
  conflicts?: ScheduledPost[]
  type?: 'same-time' | 'too-close' | 'platform-limit'
}

const PLATFORM_LIMITS = {
  Twitter: { postsPerHour: 4, minInterval: 15 },   // 15 mins between posts
  LinkedIn: { postsPerHour: 2, minInterval: 30 },  // 30 mins between posts
  Instagram: { postsPerHour: 3, minInterval: 20 }, // 20 mins between posts
  Bluesky: { postsPerHour: 4, minInterval: 15 },   // 15 mins between posts
}

export function detectConflicts(
  post: ScheduledPost,
  existingPosts: ScheduledPost[],
  excludePostId?: string
): ConflictResult {
  // Exclude the post being checked if it's an edit
  const otherPosts = existingPosts.filter(p => p.id !== excludePostId)
  
  // Check for exact same time conflicts
  const sameTimeConflicts = otherPosts.filter(p => 
    p.scheduledTime.getTime() === post.scheduledTime.getTime() &&
    p.platforms.some(platform => post.platforms.includes(platform))
  )
  
  if (sameTimeConflicts.length > 0) {
    return { 
      hasConflict: true, 
      conflicts: sameTimeConflicts,
      type: 'same-time'
    }
  }

  // Check for minimum interval between posts per platform
  for (const platform of post.platforms) {
    const platformLimit = PLATFORM_LIMITS[platform]
    if (!platformLimit) continue

    const interval = {
      start: subMinutes(post.scheduledTime, platformLimit.minInterval),
      end: addMinutes(post.scheduledTime, platformLimit.minInterval)
    }

    const tooCloseConflicts = otherPosts.filter(p =>
      p.platforms.includes(platform) &&
      isWithinInterval(p.scheduledTime, interval)
    )

    if (tooCloseConflicts.length > 0) {
      return {
        hasConflict: true,
        conflicts: tooCloseConflicts,
        type: 'too-close'
      }
    }

    // Check hourly limit
    const hourInterval = {
      start: subMinutes(post.scheduledTime, 30),
      end: addMinutes(post.scheduledTime, 30)
    }

    const postsInHour = otherPosts.filter(p =>
      p.platforms.includes(platform) &&
      isWithinInterval(p.scheduledTime, hourInterval)
    )

    if (postsInHour.length >= platformLimit.postsPerHour) {
      return {
        hasConflict: true,
        conflicts: postsInHour,
        type: 'platform-limit'
      }
    }
  }

  return { hasConflict: false }
}

export function getConflictMessage(result: ConflictResult): string {
  if (!result.hasConflict) return ''

  switch (result.type) {
    case 'same-time':
      return 'There is already a post scheduled at this time for the same platform(s)'
    case 'too-close':
      return 'This post is too close to another post on the same platform'
    case 'platform-limit':
      return 'This would exceed the maximum number of posts per hour for this platform'
    default:
      return 'This schedule conflicts with existing posts'
  }
}