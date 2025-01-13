import { PlatformType } from '../components/PostCreator'

// Common hashtag categories
const HASHTAG_CATEGORIES = {
  business: [
    'entrepreneur',
    'business',
    'marketing',
    'success',
    'startup',
    'innovation',
    'leadership'
  ],
  technology: [
    'tech',
    'programming',
    'coding',
    'developer',
    'software',
    'webdev',
    'ai'
  ],
  social: [
    'social',
    'community',
    'networking',
    'connections',
    'growth',
    'engagement'
  ]
} as const

// Platform-specific hashtag rules
const PLATFORM_HASHTAG_RULES = {
  Twitter: {
    maxHashtags: 3,
    recommendedPosition: 'end', // 'inline' | 'end'
    caseStyle: 'camelCase', // 'camelCase' | 'lowercase'
  },
  Instagram: {
    maxHashtags: 30,
    recommendedPosition: 'comment', // 'inline' | 'end' | 'comment'
    caseStyle: 'lowercase',
  },
  LinkedIn: {
    maxHashtags: 5,
    recommendedPosition: 'end',
    caseStyle: 'camelCase',
  }
} as const

// Function to analyze content and suggest relevant hashtags
export function analyzeContentForHashtags(
  content: string,
  platform: PlatformType
): string[] {
  const words = content.toLowerCase().split(/\s+/)
  const suggestedHashtags: Set<string> = new Set()

  // Analyze each word against our categories
  for (const [category, hashtags] of Object.entries(HASHTAG_CATEGORIES)) {
    for (const word of words) {
      if (hashtags.some(tag => word.includes(tag.toLowerCase()))) {
        // Add category-specific hashtags
        hashtags.forEach(tag => suggestedHashtags.add(formatHashtag(tag, platform)))
        break
      }
    }
  }

  // Limit suggestions based on platform
  return Array.from(suggestedHashtags).slice(0, PLATFORM_HASHTAG_RULES[platform].maxHashtags)
}

// Function to format hashtags according to platform rules
function formatHashtag(tag: string, platform: PlatformType): string {
  const rule = PLATFORM_HASHTAG_RULES[platform]
  
  if (rule.caseStyle === 'camelCase') {
    return '#' + tag.split(/[-_\s]/)
      .map((word, index) => 
        index === 0 ? word.toLowerCase() : 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('')
  }
  
  return '#' + tag.toLowerCase()
}

// Function to validate hashtags for a platform
export function validateHashtags(
  hashtags: string[],
  platform: PlatformType
): { valid: boolean; message?: string } {
  const rules = PLATFORM_HASHTAG_RULES[platform]
  
  if (hashtags.length > rules.maxHashtags) {
    return {
      valid: false,
      message: `${platform} allows maximum ${rules.maxHashtags} hashtags`
    }
  }

  return { valid: true }
}

// Function to get recommended hashtag position
export function getRecommendedHashtagPosition(
  platform: PlatformType
): 'inline' | 'end' | 'comment' {
  return PLATFORM_HASHTAG_RULES[platform].recommendedPosition
}

// Function to suggest trending hashtags by platform
export function getTrendingHashtags(platform: PlatformType): string[] {
  // This would typically fetch from an API
  // For now, return some static suggestions
  const commonTrending = [
    '#trending',
    '#viral',
    '#featured'
  ]

  const platformTrending = {
    Twitter: ['#twitterhacks', '#twittermarketing'],
    Instagram: ['#instadaily', '#instagood'],
    LinkedIn: ['#careertips', '#networking']
  }

  return [...commonTrending, ...(platformTrending[platform] || [])]
    .slice(0, PLATFORM_HASHTAG_RULES[platform].maxHashtags)
}