import { prisma } from '../prisma'
import { NotionIntegration } from './client'
import { NotionSyncResult, NotionPage, ContentStatus } from './types'
import { ScheduledPost } from '../types/calendar'

interface SyncOptions {
  userId: string
  notionAccessToken: string
  databaseId: string
  syncDirection?: 'notion-to-app' | 'app-to-notion' | 'bidirectional'
  statusMapping?: Record<string, ContentStatus>
}

export async function syncContent(
  options: SyncOptions
): Promise<NotionSyncResult> {
  const result: NotionSyncResult = {
    added: [],
    updated: [],
    failed: []
  }

  try {
    const notion = new NotionIntegration(options.notionAccessToken, {
      databaseId: options.databaseId,
      contentField: 'Content',
      statusField: 'Status',
      platformsField: 'Platforms',
      scheduleField: 'Schedule',
      tagsField: 'Tags'
    })

    // Get existing sync records
    const existingSyncs = await prisma.notionSync.findMany({
      where: {
        userId: options.userId
      }
    })

    // Map of notion page IDs to our post IDs
    const syncMap = new Map(existingSyncs.map(sync => [
      sync.notionPageId,
      sync.postId
    ]))

    if (options.syncDirection !== 'app-to-notion') {
      // Sync from Notion to our app
      const notionPages = await notion.getDatabase({
        filter: {
          property: 'Status',
          select: {
            does_not_equal: 'Archived'
          }
        }
      })

      for (const page of notionPages) {
        try {
          if (syncMap.has(page.id)) {
            // Update existing post
            const postId = syncMap.get(page.id)!
            await updatePost(postId, page)
            result.updated.push(page)
          } else {
            // Create new post
            const post = await createPost(options.userId, page)
            await createSyncRecord(options.userId, post.id, page.id)
            result.added.push(page)
          }
        } catch (error) {
          result.failed.push({
            pageId: page.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }

    if (options.syncDirection !== 'notion-to-app') {
      // Sync from our app to Notion
      const posts = await prisma.post.findMany({
        where: {
          userId: options.userId,
          notionSync: null // Only sync posts not yet synced to Notion
        }
      })

      for (const post of posts) {
        try {
          const page = await createNotionPage(notion, post)
          await createSyncRecord(options.userId, post.id, page.id)
          result.added.push(page)
        } catch (error) {
          result.failed.push({
            pageId: post.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }

    return result
  } catch (error) {
    console.error('Sync failed:', error)
    throw error
  }
}

async function updatePost(
  postId: string,
  notionPage: NotionPage
): Promise<void> {
  await prisma.post.update({
    where: { id: postId },
    data: {
      content: notionPage.content,
      platforms: notionPage.platforms,
      scheduledTime: notionPage.scheduledTime,
      status: mapNotionStatus(notionPage.status),
      updatedAt: new Date()
    }
  })
}

async function createPost(
  userId: string,
  notionPage: NotionPage
): Promise<ScheduledPost> {
  return await prisma.post.create({
    data: {
      userId,
      content: notionPage.content!,
      platforms: notionPage.platforms || [],
      scheduledTime: notionPage.scheduledTime,
      status: mapNotionStatus(notionPage.status),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
}

async function createNotionPage(
  notion: NotionIntegration,
  post: ScheduledPost
): Promise<NotionPage> {
  return await notion.createPage(
    {
      'Title': {
        title: [{
          text: { content: post.content.slice(0, 50) + '...' }
        }]
      },
      'Content': {
        rich_text: [{
          text: { content: post.content }
        }]
      },
      'Status': {
        select: {
          name: mapPostStatus(post.status)
        }
      },
      'Platforms': {
        multi_select: post.platforms.map(platform => ({
          name: platform
        }))
      },
      'Schedule': post.scheduledTime ? {
        date: {
          start: post.scheduledTime.toISOString()
        }
      } : undefined
    },
    post.content
  )
}

async function createSyncRecord(
  userId: string,
  postId: string,
  notionPageId: string
): Promise<void> {
  await prisma.notionSync.create({
    data: {
      userId,
      postId,
      notionPageId,
      lastSynced: new Date()
    }
  })
}

function mapNotionStatus(status?: ContentStatus): 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED' {
  switch (status) {
    case 'Ready':
      return 'SCHEDULED'
    case 'Published':
      return 'PUBLISHED'
    case 'Failed':
      return 'FAILED'
    default:
      return 'DRAFT'
  }
}

function mapPostStatus(status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED'): ContentStatus {
  switch (status) {
    case 'SCHEDULED':
      return 'Ready'
    case 'PUBLISHED':
      return 'Published'
    case 'FAILED':
      return 'Failed'
    default:
      return 'Draft'
  }
}

// Template handling
export async function createFromTemplate(
  notion: NotionIntegration,
  templateId: string,
  variables: Record<string, string>
): Promise<NotionPage> {
  const template = await notion.getPage(templateId)
  
  // Replace variables in content
  let content = template.content || ''
  for (const [key, value] of Object.entries(variables)) {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }

  return await notion.createPage(
    {
      'Title': {
        title: [{
          text: { content: template.title }
        }]
      },
      'Content': {
        rich_text: [{
          text: { content }
        }]
      },
      'Status': {
        select: {
          name: 'Draft'
        }
      },
      'Platforms': {
        multi_select: template.platforms?.map(platform => ({
          name: platform
        })) || []
      }
    },
    content
  )
}