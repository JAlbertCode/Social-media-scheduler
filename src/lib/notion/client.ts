import { Client } from '@notionhq/client'
import { NotionPage, NotionConfig, ContentStatus } from './types'

export class NotionIntegration {
  private client: Client
  private config: NotionConfig

  constructor(accessToken: string, config: NotionConfig) {
    this.client = new Client({
      auth: accessToken
    })
    this.config = config
  }

  async getPage(pageId: string): Promise<NotionPage> {
    try {
      const page = await this.client.pages.retrieve({ page_id: pageId })
      const pageContent = await this.getPageContent(pageId)
      
      return this.formatPage(page, pageContent)
    } catch (error) {
      console.error('Failed to get Notion page:', error)
      throw error
    }
  }

  async getPageContent(pageId: string): Promise<string> {
    try {
      const blocks = await this.client.blocks.children.list({
        block_id: pageId
      })

      return this.formatBlocks(blocks.results)
    } catch (error) {
      console.error('Failed to get page content:', error)
      throw error
    }
  }

  private formatBlocks(blocks: any[]): string {
    let content = ''

    for (const block of blocks) {
      switch (block.type) {
        case 'paragraph':
          content += block.paragraph.rich_text
            .map((text: any) => text.plain_text)
            .join('') + '\\n\\n'
          break
        case 'heading_1':
          content += '# ' + block.heading_1.rich_text
            .map((text: any) => text.plain_text)
            .join('') + '\\n\\n'
          break
        case 'heading_2':
          content += '## ' + block.heading_2.rich_text
            .map((text: any) => text.plain_text)
            .join('') + '\\n\\n'
          break
        case 'heading_3':
          content += '### ' + block.heading_3.rich_text
            .map((text: any) => text.plain_text)
            .join('') + '\\n\\n'
          break
        case 'bulleted_list_item':
          content += '• ' + block.bulleted_list_item.rich_text
            .map((text: any) => text.plain_text)
            .join('') + '\\n'
          break
        case 'numbered_list_item':
          content += '1. ' + block.numbered_list_item.rich_text
            .map((text: any) => text.plain_text)
            .join('') + '\\n'
          break
        case 'quote':
          content += '> ' + block.quote.rich_text
            .map((text: any) => text.plain_text)
            .join('') + '\\n\\n'
          break
        // Add more block types as needed
      }
    }

    return content.trim()
  }

  private formatPage(page: any, content: string): NotionPage {
    const properties = page.properties

    return {
      id: page.id,
      title: properties.title?.title[0]?.plain_text || 'Untitled',
      url: page.url,
      lastEdited: new Date(page.last_edited_time),
      createdTime: new Date(page.created_time),
      status: this.getPropertyValue(properties[this.config.statusField]) as ContentStatus,
      platforms: this.getPropertyValue(properties[this.config.platformsField]),
      scheduledTime: this.getPropertyValue(properties[this.config.scheduleField]),
      content,
      tags: this.getPropertyValue(properties[this.config.tagsField]),
      coverImage: page.cover?.external?.url || page.cover?.file?.url
    }
  }

  private getPropertyValue(property: any): any {
    if (!property) return undefined

    switch (property.type) {
      case 'title':
        return property.title[0]?.plain_text
      case 'rich_text':
        return property.rich_text[0]?.plain_text
      case 'select':
        return property.select?.name
      case 'multi_select':
        return property.multi_select.map((item: any) => item.name)
      case 'date':
        return property.date?.start ? new Date(property.date.start) : undefined
      case 'checkbox':
        return property.checkbox
      case 'number':
        return property.number
      default:
        return undefined
    }
  }

  async updatePageStatus(
    pageId: string,
    status: ContentStatus,
    additionalProperties?: Record<string, any>
  ): Promise<void> {
    try {
      await this.client.pages.update({
        page_id: pageId,
        properties: {
          [this.config.statusField]: {
            select: {
              name: status
            }
          },
          ...additionalProperties
        }
      })
    } catch (error) {
      console.error('Failed to update page status:', error)
      throw error
    }
  }

  async getDatabase(
    options?: {
      filter?: any
      sorts?: any[]
    }
  ): Promise<NotionPage[]> {
    try {
      const response = await this.client.databases.query({
        database_id: this.config.databaseId,
        filter: options?.filter,
        sorts: options?.sorts
      })

      const pages = await Promise.all(
        response.results.map(async (page: any) => {
          const content = await this.getPageContent(page.id)
          return this.formatPage(page, content)
        })
      )

      return pages
    } catch (error) {
      console.error('Failed to query database:', error)
      throw error
    }
  }

  async createPage(
    properties: Record<string, any>,
    content?: string
  ): Promise<NotionPage> {
    try {
      const page = await this.client.pages.create({
        parent: {
          database_id: this.config.databaseId
        },
        properties
      })

      if (content) {
        await this.client.blocks.children.append({
          block_id: page.id,
          children: [{
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{
                type: 'text',
                text: { content }
              }]
            }
          }]
        })
      }

      return this.formatPage(page, content || '')
    } catch (error) {
      console.error('Failed to create page:', error)
      throw error
    }
  }
}