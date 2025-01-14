import { PlatformType } from '@/components/PostCreator'

export interface NotionPage {
  id: string
  title: string
  url: string
  lastEdited: Date
  createdTime: Date
  status?: ContentStatus
  platforms?: PlatformType[]
  scheduledTime?: Date
  content?: string
  tags?: string[]
  coverImage?: string
}

export type ContentStatus = 
  | 'Draft'
  | 'Ready'
  | 'Scheduled'
  | 'Published'
  | 'Failed'
  | 'Archived'

export interface NotionConfig {
  databaseId: string
  contentField: string
  statusField: string
  platformsField: string
  scheduleField: string
  tagsField: string
}

export interface NotionSyncResult {
  added: NotionPage[]
  updated: NotionPage[]
  failed: Array<{
    pageId: string
    error: string
  }>
}

export interface NotionTemplate {
  id: string
  name: string
  description?: string
  platforms: PlatformType[]
  formatting: {
    titleFormat?: string
    contentFormat: string
    variables: string[]
  }
}