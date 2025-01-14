export interface PreviewMedia {
  type: 'image' | 'video'
  url: string
  previewUrl?: string
  aspectRatio?: number
  altText?: string
}

export interface ProfileData {
  name: string
  username: string
  profileImage?: string
  isVerified?: boolean
  bio?: string
  followers?: number
}

export interface PreviewEngagement {
  likes?: number
  comments?: number
  shares?: number
  retweets?: number
  impressions?: number
}

export interface PreviewMetadata {
  scheduledTime?: Date
  timezone?: string
  visibility?: 'public' | 'private' | 'connections'
  hashtags?: string[]
  mentions?: string[]
  links?: string[]
}