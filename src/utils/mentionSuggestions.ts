'use client'

import { PlatformType } from '../types/platforms'

// This would typically come from your API/backend
interface UserSuggestion {
  id: string
  username: string
  displayName: string
  platform: PlatformType
  avatar?: string
  verified?: boolean
}

// Mock data for demonstration
const MOCK_USERS: UserSuggestion[] = [
  {
    id: '1',
    username: 'techleader',
    displayName: 'Tech Leader',
    platform: 'Twitter',
    verified: true
  },
  {
    id: '2',
    username: 'marketingpro',
    displayName: 'Marketing Pro',
    platform: 'Twitter'
  },
  {
    id: '3',
    username: 'john.doe',
    displayName: 'John Doe',
    platform: 'LinkedIn'
  },
  {
    id: '4',
    username: 'social.media.expert',
    displayName: 'Social Media Expert',
    platform: 'Instagram'
  },
  {
    id: '5',
    username: 'tiktok.creator',
    displayName: 'TikTok Creator',
    platform: 'TikTok',
    verified: true
  },
  {
    id: '6',
    username: 'youtube.channel',
    displayName: 'YouTube Channel',
    platform: 'YouTube',
    verified: true
  },
  {
    id: '7',
    username: 'bluesky.pioneer',
    displayName: 'Bluesky Pioneer',
    platform: 'Bluesky'
  },
  {
    id: '8',
    username: 'threads.connector',
    displayName: 'Threads Connector',
    platform: 'Threads'
  },
  {
    id: '9',
    username: 'warpcast.dev',
    displayName: 'Warpcast Developer',
    platform: 'Warpcast',
    verified: true
  }
]

// Platform-specific mention rules
const PLATFORM_MENTION_RULES: Record<PlatformType, {
  prefix: string;
  maxLength: number;
  validCharacters: RegExp;
  maxMentions: number;
}> = {
  Twitter: {
    prefix: '@',
    maxLength: 15,
    validCharacters: /^[A-Za-z0-9_]+$/,
    maxMentions: 10
  },
  LinkedIn: {
    prefix: '@',
    maxLength: 100,
    validCharacters: /^[A-Za-z0-9._-]+$/,
    maxMentions: 5
  },
  Instagram: {
    prefix: '@',
    maxLength: 30,
    validCharacters: /^[A-Za-z0-9._]+$/,
    maxMentions: 20
  },
  TikTok: {
    prefix: '@',
    maxLength: 24,
    validCharacters: /^[A-Za-z0-9._]+$/,
    maxMentions: 5
  },
  YouTube: {
    prefix: '@',
    maxLength: 30,
    validCharacters: /^[A-Za-z0-9._-]+$/,
    maxMentions: 5
  },
  Bluesky: {
    prefix: '@',
    maxLength: 30,
    validCharacters: /^[A-Za-z0-9._-]+$/,
    maxMentions: 10
  },
  Threads: {
    prefix: '@',
    maxLength: 30,
    validCharacters: /^[A-Za-z0-9._]+$/,
    maxMentions: 10
  },
  Warpcast: {
    prefix: '@',
    maxLength: 30,
    validCharacters: /^[A-Za-z0-9._-]+$/,
    maxMentions: 20
  }
}

// Function to get mention suggestions based on input
export async function getMentionSuggestions(
  query: string,
  platform: PlatformType,
  limit: number = 5
): Promise<UserSuggestion[]> {
  // In a real app, this would make an API call
  // For now, we'll filter our mock data
  return MOCK_USERS
    .filter(user => 
      user.platform === platform &&
      (user.username.toLowerCase().includes(query.toLowerCase()) ||
       user.displayName.toLowerCase().includes(query.toLowerCase()))
    )
    .slice(0, limit)
}

// Function to validate a mention
export function validateMention(
  mention: string,
  platform: PlatformType
): { valid: boolean; message?: string } {
  const rules = PLATFORM_MENTION_RULES[platform]
  
  if (!mention.match(rules.validCharacters)) {
    return {
      valid: false,
      message: `Invalid characters in mention. Only ${rules.validCharacters.toString()} allowed.`
    }
  }

  if (mention.length > rules.maxLength) {
    return {
      valid: false,
      message: `Mention too long. Maximum length is ${rules.maxLength} characters.`
    }
  }

  return { valid: true }
}

// Function to count mentions in text
export function countMentions(
  text: string,
  platform: PlatformType
): { count: number; valid: boolean; message?: string } {
  const rules = PLATFORM_MENTION_RULES[platform]
  const mentions = text.match(new RegExp(`${rules.prefix}\\w+`, 'g')) || []
  
  if (mentions.length > rules.maxMentions) {
    return {
      count: mentions.length,
      valid: false,
      message: `Too many mentions. Maximum is ${rules.maxMentions} for ${platform}.`
    }
  }

  return {
    count: mentions.length,
    valid: true
  }
}

// Function to get platform-specific mention rules
export function getMentionRules(platform: PlatformType) {
  return PLATFORM_MENTION_RULES[platform]
}

// Function to format a mention according to platform rules
export function formatMention(user: UserSuggestion): string {
  const rules = PLATFORM_MENTION_RULES[user.platform]
  return `${rules.prefix}${user.username}`
}