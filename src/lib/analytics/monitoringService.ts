import { PlatformType } from '@/components/PostCreator'
import { PlatformFactory } from '../platforms'
import { prisma } from '../prisma'
import { updatePostStatus, getPostStatus } from './postTracking'

interface MonitoringResult {
  success: boolean
  failedPosts: Array<{
    id: string
    platform: PlatformType
    error: string
  }>
  retries: number
}

export async function monitorScheduledPosts(): Promise<MonitoringResult> {
  const result: MonitoringResult = {
    success: true,
    failedPosts: [],
    retries: 0
  }

  try {
    // Get pending posts that should have been published
    const pendingPosts = await prisma.post.findMany({
      where: {
        status: 'PENDING',
        scheduledTime: {
          lte: new Date() // Posts that should have been published by now
        }
      },
      include: {
        statusLogs: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    })

    for (const post of pendingPosts) {
      // Check each platform the post should be published to
      for (const platform of post.platforms as PlatformType[]) {
        try {
          // Get platform instance
          const platformInstance = PlatformFactory.getPlatform(platform)
          
          // Get user's account for this platform
          const account = await prisma.account.findFirst({
            where: {
              userId: post.userId,
              provider: platform.toLowerCase()
            }
          })

          if (!account?.access_token) {
            throw new Error(`No valid account found for ${platform}`)
          }

          // Verify post status on platform
          const postStatus = await platformInstance.getPostStatus(
            post.statusLogs[0]?.platformId || '',
            account.access_token
          )

          if (postStatus.published) {
            // Update post status to published
            await updatePostStatus(post.id, postStatus.platformPostId, 'PUBLISHED', {
              publishedTime: postStatus.publishedAt,
              engagementMetrics: postStatus.metrics
            })
          } else if (postStatus.failed) {
            result.failedPosts.push({
              id: post.id,
              platform,
              error: postStatus.error || 'Unknown error'
            })

            await updatePostStatus(post.id, postStatus.platformPostId, 'FAILED', {
              errorMessage: postStatus.error
            })

            result.success = false
          } else {
            // Still pending, increment retry count
            result.retries++
          }
        } catch (error) {
          console.error(`Error monitoring post ${post.id} for ${platform}:`, error)
          result.failedPosts.push({
            id: post.id,
            platform,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          result.success = false
        }
      }
    }

    return result
  } catch (error) {
    console.error('Failed to monitor scheduled posts:', error)
    throw error
  }
}

export async function notifyFailedPosts(result: MonitoringResult) {
  if (result.failedPosts.length === 0) return

  // Group failures by user
  const failuresByUser = await prisma.post.groupBy({
    by: ['userId'],
    where: {
      id: {
        in: result.failedPosts.map(p => p.id)
      }
    }
  })

  // Notify each user
  for (const { userId } of failuresByUser) {
    const userFailures = result.failedPosts.filter(
      failure => failure.id === userId
    )

    try {
      // Get user's notification preferences
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          // Add other notification preferences here
        }
      })

      if (!user?.email) continue

      // Send notification email
      // In a real app, use your email service here
      console.log('Would send email to', user.email, 'about failed posts:', userFailures)
    } catch (error) {
      console.error(`Failed to notify user ${userId}:`, error)
    }
  }
}

export async function retryFailedPosts(
  failedPostIds: string[],
  maxRetries: number = 3
) {
  const results = {
    success: [] as string[],
    permanentFailures: [] as string[]
  }

  for (const postId of failedPostIds) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          statusLogs: {
            orderBy: { timestamp: 'desc' },
            take: maxRetries
          }
        }
      })

      if (!post) continue

      // If exceeded max retries, mark as permanent failure
      if (post.statusLogs.length >= maxRetries) {
        results.permanentFailures.push(postId)
        continue
      }

      // Attempt to republish
      for (const platform of post.platforms as PlatformType[]) {
        try {
          const platformInstance = PlatformFactory.getPlatform(platform)
          
          const account = await prisma.account.findFirst({
            where: {
              userId: post.userId,
              provider: platform.toLowerCase()
            }
          })

          if (!account?.access_token) {
            throw new Error(`No valid account found for ${platform}`)
          }

          // Retry publishing
          const result = await platformInstance.createPost(
            post.content,
            post.media ? JSON.parse(post.media).mediaIds : [],
            account.access_token
          )

          // Update status
          await updatePostStatus(post.id, result.id, 'PENDING')
          results.success.push(postId)
        } catch (error) {
          console.error(`Failed to retry post ${postId} for ${platform}:`, error)
        }
      }
    } catch (error) {
      console.error(`Failed to process retry for post ${postId}:`, error)
    }
  }

  return results
}