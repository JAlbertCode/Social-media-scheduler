export interface CalendarConfig {
  id: string
  name: string
  description?: string
  color: string
  type: 'campaign' | 'product' | 'brand' | 'team' | 'custom'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  metadata?: {
    startDate?: Date
    endDate?: Date
    budget?: number
    owner?: string
    team?: string[]
    tags?: string[]
  }
}

export interface CalendarPost {
  postId: string
  calendarIds: string[]  // A post can belong to multiple calendars
}