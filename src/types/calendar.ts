import { PlatformType } from './platforms'

export interface ScheduledPost {
  id: string
  content: string
  platforms: PlatformType[]
  scheduledTime: Date
}

export interface DragItem {
  type: string
  id: string
  originalDate: Date
  content: string
  platforms: PlatformType[]
}