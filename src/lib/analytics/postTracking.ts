import { PlatformType } from '@/components/PostCreator'
import { prisma } from '../prisma'

export interface PostStatus {
  id: string
  platformId: string
  platform: PlatformType
  status: 'PENDING' | 'PUBLISHED' | 'FAILED' | 'DELETED'
  scheduledTime: Date
  publishedTime?: Date
  errorMessage?: string
  retryCount: number
  engagementMetrics?: {
    likes?: number
    comments?: number
    shares?: number
    views?: number
    clicks?: number
  }
  platformSpecificData?: Record<string, any>
}

export async function updatePostStatus(
  postId: string,
  platformId: string,
  status: PostStatus['status'],
  details?: {
    publishedTime?: Date
    errorMessage?: string
    engagementMetrics?: PostStatus['engagementMetrics']
    platformSpecificData?: Record<string, any>
  }
) {
  try {
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        status,
        publishedTime: details?.publishedTime,
        errorDetails: details?.errorMessage,
        metrics: details?.engagementMetrics ? JSON.stringify(details.engagementMetrics) : undefined,
        platformData: details?.platformSpecificData ? JSON.stringify(details.platformSpecificData) : undefined,
        updatedAt: new Date()
      }
    })

    // Log status change for audit trail
    await prisma.postStatusLog.create({
      data: {
        postId: post.id,
        status,
        platformId,
        errorMessage: details?.errorMessage,
        timestamp: new Date()
      }
    })

    return post
  } catch (error) {
    console.error('Failed to update post status:', error)
    throw error
  }
}

export async function getPostStatus(postId: string): Promise<PostStatus | null> {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        statusLogs: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    })

    if (!post) return null

    return {
      id: post.id,
      platformId: post.statusLogs[0]?.platformId || '',
      platform: post.platforms[0] as PlatformType, // Assuming first platform
      status: post.status,
      scheduledTime: post.scheduledTime!,
      publishedTime: post.publishedTime || undefined,
      errorMessage: post.errorDetails || undefined,
      retryCount: post.statusLogs.length,
      engagementMetrics: post.metrics ? JSON.parse(post.metrics) : undefined,
      platformSpecificData: post.platformData ? JSON.parse(post.platformData) : undefined
    }
  } catch (error) {
    console.error('Failed to get post status:', error)
    throw error
  }
}

export async function getFailedPosts(options?: {
  timeframe?: { start: Date; end: Date }
  platforms?: PlatformType[]
  limit?: number
}) {
  try {
    return await prisma.post.findMany({
      where: {
        status: 'FAILED',
        scheduledTime: options?.timeframe ? {
          gte: options.timeframe.start,
          lte: options.timeframe.end
        } : undefined,
        platforms: options?.platforms ? {
          hasSome: options.platforms
        } : undefined
      },
      include: {
        statusLogs: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { scheduledTime: 'desc' },
      take: options?.limit
    })
  } catch (error) {
    console.error('Failed to get failed posts:', error)
    throw error
  }
}

export async function detectSchedulingConflicts(
  userId: string,
  platform: PlatformType,
  scheduledTime: Date,
  buffer: number = 5 // minutes
) {
  const bufferStart = new Date(scheduledTime.getTime() - buffer * 60000)
  const bufferEnd = new Date(scheduledTime.getTime() + buffer * 60000)

  try {
    const conflictingPosts = await prisma.post.findMany({
      where: {
        userId,
        platforms: {
          has: platform
        },
        scheduledTime: {
          gte: bufferStart,
          lte: bufferEnd
        },
        status: {
          in: ['PENDING', 'PUBLISHED']
        }
      }
    })

    return conflictingPosts.length > 0
      ? {
          hasConflict: true,
          posts: conflictingPosts,
          suggestedTime: new Date(bufferEnd.getTime() + buffer * 60000)
        }
      : { hasConflict: false }
  } catch (error) {
    console.error('Failed to detect scheduling conflicts:', error)
    throw error
  }
}

export async function getPostAnalytics(
  postIds: string[],
  timeframe?: { start: Date; end: Date }
) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        id: { in: postIds },
        publishedTime: timeframe ? {
          gte: timeframe.start,
          lte: timeframe.end
        } : undefined
      }
    })

    return posts.map(post => ({
      id: post.id,
      metrics: post.metrics ? JSON.parse(post.metrics) : {},
      publishedTime: post.publishedTime,
      status: post.status,
      platforms: post.platforms
    }))
  } catch (error) {
    console.error('Failed to get post analytics:', error)
    throw error
  }
}