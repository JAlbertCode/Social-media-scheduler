import { PlatformType } from '../components/PostCreator'

export interface ScheduledPost {
  id: string
  content: string
  platforms: PlatformType[]
  scheduledTime: Date
  timezone?: string
  media?: { type: 'image' | 'video'; preview: string }[]
}

export interface DragItem {
  type: 'POST'
  id: string
  originalDate: Date
}