import { PlatformType } from '../components/PostCreator'

interface TimeSlot {
  hour: number
  score: number
}

interface PlatformRecommendation {
  platform: PlatformType
  optimalFrequency: number // posts per day
  bestTimes: TimeSlot[]
  minimumGap: number // hours between posts
}

// Platform-specific recommendations based on general best practices
const platformGuidelines: Record<PlatformType, PlatformRecommendation> = {
  Twitter: {
    platform: 'Twitter',
    optimalFrequency: 3,
    bestTimes: [
      { hour: 9, score: 0.9 },
      { hour: 12, score: 0.8 },
      { hour: 15, score: 0.85 },
      { hour: 18, score: 0.7 }
    ],
    minimumGap: 3
  },
  LinkedIn: {
    platform: 'LinkedIn',
    optimalFrequency: 1,
    bestTimes: [
      { hour: 10, score: 0.9 },
      { hour: 14, score: 0.8 }
    ],
    minimumGap: 24
  },
  Instagram: {
    platform: 'Instagram',
    optimalFrequency: 2,
    bestTimes: [
      { hour: 11, score: 0.9 },
      { hour: 15, score: 0.85 },
      { hour: 19, score: 0.8 }
    ],
    minimumGap: 6
  },
  TikTok: {
    platform: 'TikTok',
    optimalFrequency: 2,
    bestTimes: [
      { hour: 13, score: 0.9 },
      { hour: 17, score: 0.85 },
      { hour: 21, score: 0.8 }
    ],
    minimumGap: 4
  },
  YouTube: {
    platform: 'YouTube',
    optimalFrequency: 1,
    bestTimes: [
      { hour: 15, score: 0.9 },
      { hour: 20, score: 0.85 }
    ],
    minimumGap: 24
  },
  Bluesky: {
    platform: 'Bluesky',
    optimalFrequency: 3,
    bestTimes: [
      { hour: 9, score: 0.9 },
      { hour: 13, score: 0.85 },
      { hour: 17, score: 0.8 }
    ],
    minimumGap: 3
  }
} as const

export function getRecommendedTimes(
  platform: PlatformType,
  timezone: string,
  existingPosts: Date[]
): Date[] {
  const guidelines = platformGuidelines[platform]
  const today = new Date()
  const recommended: Date[] = []

  // Sort best times by score
  const sortedTimes = [...guidelines.bestTimes].sort((a, b) => b.score - a.score)

  // Get available slots that don't conflict with existing posts
  for (const timeSlot of sortedTimes) {
    const proposedDate = new Date(today)
    proposedDate.setHours(timeSlot.hour, 0, 0, 0)

    // Check if this time conflicts with existing posts
    const hasConflict = existingPosts.some(post => {
      const hoursDiff = Math.abs(proposedDate.getHours() - post.getHours())
      return hoursDiff < guidelines.minimumGap
    })

    if (!hasConflict && recommended.length < guidelines.optimalFrequency) {
      recommended.push(proposedDate)
    }
  }

  return recommended
}

export function analyzePostingPattern(posts: Date[], platform: PlatformType): {
  frequency: number
  consistency: number
  recommendations: string[]
} {
  const guidelines = platformGuidelines[platform]
  const recommendations: string[] = []

  // Calculate average posts per day
  const days = new Set(posts.map(post => post.toDateString())).size
  const frequency = posts.length / Math.max(days, 1)

  // Check posting time consistency
  const timeDistribution = posts.reduce((acc, post) => {
    const hour = post.getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  // Calculate consistency score (0-1)
  const maxPosts = Math.max(...Object.values(timeDistribution))
  const consistency = maxPosts / posts.length

  // Generate recommendations
  if (frequency > guidelines.optimalFrequency) {
    recommendations.push('Consider reducing posting frequency to ' + guidelines.optimalFrequency + ' posts per day for better engagement')
  } else if (frequency < guidelines.optimalFrequency) {
    recommendations.push('Try increasing posting frequency to ' + guidelines.optimalFrequency + ' posts per day for better visibility')
  }

  if (consistency < 0.5) {
    recommendations.push('Your posting times are inconsistent. Try sticking to regular time slots for better audience engagement')
  }

  return {
    frequency,
    consistency,
    recommendations
  }
}