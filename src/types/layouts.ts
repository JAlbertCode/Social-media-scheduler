export type LayoutViewType = 
  | 'timeline'   // Traditional timeline view
  | 'calendar'   // Standard calendar view
  | 'kanban'     // Board-style view
  | 'grid'       // Grid of posts
  | 'list'       // List view
  | 'agenda'     // Detailed agenda view
  | 'custom'     // User-defined layout

export type LayoutColumnType =
  | 'date'
  | 'time'
  | 'content'
  | 'platforms'
  | 'media'
  | 'status'
  | 'analytics'
  | 'actions'
  | 'custom'

export interface LayoutColumn {
  id: string
  type: LayoutColumnType
  title: string
  width?: number | string
  visible: boolean
  order: number
  customRender?: string  // For custom columns, contains component name
}

export interface LayoutConfig {
  id: string
  name: string
  description?: string
  type: LayoutViewType
  columns: LayoutColumn[]
  filters: {
    platforms?: string[]
    dateRange?: {
      start?: Date
      end?: Date
    }
    status?: string[]
  }
  groupBy?: LayoutColumnType
  sortBy?: {
    column: LayoutColumnType
    direction: 'asc' | 'desc'
  }
  preferences: {
    compactView: boolean
    showAnalytics: boolean
    showPreviews: boolean
    enableDragDrop: boolean
    refreshInterval?: number
  }
}