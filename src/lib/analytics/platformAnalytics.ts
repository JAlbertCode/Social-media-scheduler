import { PlatformType } from '@/components/PostCreator'
import { prisma } from '../prisma'

export interface AnalyticsPeriod {
  start: Date
  end: Date
}

export interface PlatformMetrics {
  likes: number
  comments: number
  shares: number
  views?: number
  clicks?: number
  engagement: number // Calculated engagement rate
}

export interface PostMetrics extends PlatformMetrics {
  postId: string
  publishedTime: Date
  url?: string
}

export interface PlatformAnalytics {
  platform: PlatformType
  totalPosts: number
  metrics: PlatformMetrics
  bestTime: {
    dayOfWeek: number
    hour: number
    engagement: number
  }
  topPosts: PostMetrics[]
  recentPerformance: {
    date: Date
    engagement: number
  }[]
}

export async function getPlatformAnalytics(
  userId: string,
  platform: PlatformType,
  period: AnalyticsPeriod,
  options?: {
    topPostsLimit?: number
    includeDeleted?: boolean
  }
): Promise<PlatformAnalytics> {
  const posts = await prisma.post.findMany({
    where: {
      userId,
      platforms: {
        has: platform
      },
      publishedTime: {
        gte: period.start,
        lte: period.end
      },
      status: options?.includeDeleted 
        ? { in: ['PUBLISHED', 'DELETED'] }
        : 'PUBLISHED'
    },
    orderBy: {
      publishedTime: 'desc'
    }
  })

  // Calculate platform-wide metrics
  const metrics = calculateAggregateMetrics(posts)

  // Find best posting time
  const bestTime = findBestPostingTime(posts)

  // Get top performing posts
  const topPosts = getTopPosts(posts, options?.topPostsLimit || 5)

  // Calculate recent performance trend
  const recentPerformance = calculateRecentPerformance(posts)

  return {
    platform,
    totalPosts: posts.length,
    metrics,
    bestTime,
    topPosts,
    recentPerformance
  }
}

function calculateAggregateMetrics(posts: any[]): PlatformMetrics {
  const totals = posts.reduce((acc, post) => {
    const metrics = JSON.parse(post.metrics || '{}')
    return {
      likes: acc.likes + (metrics.likes || 0),
      comments: acc.comments + (metrics.comments || 0),
      shares: acc.shares + (metrics.shares || 0),
      views: acc.views + (metrics.views || 0),
      clicks: acc.clicks + (metrics.clicks || 0)
    }
  }, { likes: 0, comments: 0, shares: 0, views: 0, clicks: 0 })

  const totalEngagements = totals.likes + totals.comments + totals.shares
  const engagement = posts.length > 0
    ? totalEngagements / (posts.length * (totals.views || posts.length))
    : 0

  return {
    ...totals,
    engagement
  }
}

function findBestPostingTime(posts: any[]): {
  dayOfWeek: number
  hour: number
  engagement: number
} {
  // Group posts by day and hour
  const timeSlots = new Map<string, {
    count: number
    engagement: number
  }>()

  posts.forEach(post => {
    const publishedTime = new Date(post.publishedTime)
    const dayHourKey = `${publishedTime.getDay()}-${publishedTime.getHours()}`
    const metrics = JSON.parse(post.metrics || '{}')
    const engagement = calculatePostEngagement(metrics)

    const current = timeSlots.get(dayHourKey) || { count: 0, engagement: 0 }
    timeSlots.set(dayHourKey, {
      count: current.count + 1,
      engagement: current.engagement + engagement
    })
  })

  // Find slot with highest average engagement
  let bestSlot = { dayOfWeek: 0, hour: 0, engagement: 0 }
  timeSlots.forEach((value, key) => {
    const avgEngagement = value.engagement / value.count
    if (avgEngagement > bestSlot.engagement) {
      const [day, hour] = key.split('-').map(Number)
      bestSlot = {
        dayOfWeek: day,
        hour,
        engagement: avgEngagement
      }
    }
  })

  return bestSlot
}

function getTopPosts(posts: any[], limit: number): PostMetrics[] {
  return posts
    .map(post => ({
      postId: post.id,
      publishedTime: post.publishedTime,
      url: JSON.parse(post.platformData || '{}').url,
      ...JSON.parse(post.metrics || '{}'),
      engagement: calculatePostEngagement(JSON.parse(post.metrics || '{}'))
    }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, limit)
}

function calculatePostEngagement(metrics: any): number {
  const totalEngagements = 
    (metrics.likes || 0) +
    (metrics.comments || 0) +
    (metrics.shares || 0)
  
  return metrics.views
    ? totalEngagements / metrics.views
    : totalEngagements
}

function calculateRecentPerformance(posts: any[]): {
  date: Date
  engagement: number
}[] {
  // Group posts by date
  const dailyEngagement = new Map<string, {
    date: Date
    total: number
    count: number
  }>()

  posts.forEach(post => {
    const date = new Date(post.publishedTime)
    date.setHours(0, 0, 0, 0)
    const dateKey = date.toISOString()
    const metrics = JSON.parse(post.metrics || '{}')
    const engagement = calculatePostEngagement(metrics)

    const current = dailyEngagement.get(dateKey) || {
      date,
      total: 0,
      count: 0
    }

    dailyEngagement.set(dateKey, {
      date,
      total: current.total + engagement,
      count: current.count + 1
    })
  })

  // Convert to array and calculate averages
  return Array.from(dailyEngagement.values())
    .map(({ date, total, count }) => ({
      date,
      engagement: total / count
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

export async function getComparativePlatformAnalytics(
  userId: string,
  period: AnalyticsPeriod
): Promise<Record<PlatformType, PlatformAnalytics>> {
  const platforms: PlatformType[] = ['Twitter', 'LinkedIn', 'Instagram']
  const analytics: Partial<Record<PlatformType, PlatformAnalytics>> = {}

  for (const platform of platforms) {
    try {
      analytics[platform] = await getPlatformAnalytics(userId, platform, period)
    } catch (error) {
      console.error(`Failed to get analytics for ${platform}:`, error)
    }
  }

  return analytics as Record<PlatformType, PlatformAnalytics>
}