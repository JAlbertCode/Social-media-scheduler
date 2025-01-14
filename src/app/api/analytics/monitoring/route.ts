import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import {
  monitorScheduledPosts,
  notifyFailedPosts,
  retryFailedPosts
} from '@/lib/analytics/monitoringService'

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe')
    const platforms = searchParams.get('platforms')?.split(',')

    // Get monitoring data
    const result = await monitorScheduledPosts()

    // Get additional stats for response
    const stats = {
      totalPosts: await prisma.post.count({
        where: {
          userId: session.user.id,
          platforms: platforms ? { hasSome: platforms } : undefined,
          scheduledTime: timeframe ? {
            gte: new Date(Date.now() - parseInt(timeframe) * 60000)
          } : undefined
        }
      }),
      failedPosts: result.failedPosts.length,
      retryCount: result.retries
    }

    // Notify about failures if any
    if (result.failedPosts.length > 0) {
      await notifyFailedPosts(result)
    }

    return NextResponse.json({
      success: result.success,
      stats,
      failedPosts: result.failedPosts
    })
  } catch (error) {
    console.error('Monitoring error:', error)
    return NextResponse.json(
      { error: 'Failed to monitor posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postIds, maxRetries } = await request.json()

    if (!postIds?.length) {
      return NextResponse.json(
        { error: 'No post IDs provided' },
        { status: 400 }
      )
    }

    // Verify user owns these posts
    const posts = await prisma.post.findMany({
      where: {
        id: { in: postIds },
        userId: session.user.id
      }
    })

    if (posts.length !== postIds.length) {
      return NextResponse.json(
        { error: 'Some posts not found or not owned by user' },
        { status: 403 }
      )
    }

    // Retry failed posts
    const results = await retryFailedPosts(postIds, maxRetries)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Retry error:', error)
    return NextResponse.json(
      { error: 'Failed to retry posts' },
      { status: 500 }
    )
  }
}