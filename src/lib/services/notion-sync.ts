import { prisma } from '@/lib/prisma';
import { NotionService } from './notion';
import { Scheduler } from './scheduler';
import { PlatformError } from '../utils/errors';

interface SyncConfig {
  userId: string;
  notionDatabaseId: string;
  templates: Record<string, {
    format: string;
    variables: string[];
  }>;
}

export class NotionSync {
  private notionService: NotionService;
  private scheduler: Scheduler;

  constructor(notionAccessToken: string) {
    this.notionService = new NotionService(notionAccessToken);
    this.scheduler = new Scheduler();
  }

  /**
   * Sync content from Notion to platform
   */
  async syncFromNotion(config: SyncConfig): Promise<void> {
    try {
      // Get ready-to-post pages from Notion
      const pages = await this.notionService.getPages(config.notionDatabaseId);

      for (const page of pages) {
        try {
          // Get platforms to post to from page properties
          const platforms = this.getPlatformsFromProperties(page.properties);

          for (const platform of platforms) {
            // Apply platform-specific template
            const template = config.templates[platform];
            if (!template) continue;

            const formattedContent = await this.notionService.applyTemplate(
              page.id,
              {
                platform,
                ...template
              }
            );

            // Schedule post
            const scheduledTime = this.getScheduledTimeFromProperties(page.properties);
            await this.scheduler.schedulePost({
              userId: config.userId,
              platform,
              content: formattedContent,
              scheduledTime
            });

            // Update page status in Notion
            await this.notionService.updatePageStatus(page.id, 'Scheduled');
          }
        } catch (error) {
          console.error(`Failed to process Notion page ${page.id}:`, error);
          // Update page status to indicate error
          await this.notionService.updatePageStatus(page.id, 'Error');
        }
      }
    } catch (error) {
      throw new PlatformError(
        'SYNC_ERROR',
        `Failed to sync from Notion: ${error.message}`
      );
    }
  }

  /**
   * Sync content status back to Notion
   */
  async syncToNotion(config: SyncConfig): Promise<void> {
    try {
      // Get all scheduled posts
      const scheduledPosts = await this.scheduler.getUserSchedule(config.userId);

      for (const post of scheduledPosts) {
        try {
          const notionPageId = this.extractNotionPageId(post.content);
          if (!notionPageId) continue;

          // Sync status back to Notion
          await this.notionService.syncContentStatus(
            notionPageId,
            this.mapStatusToNotion(post.status),
            post.platformUrls
          );
        } catch (error) {
          console.error(`Failed to sync post ${post.id} to Notion:`, error);
        }
      }
    } catch (error) {
      throw new PlatformError(
        'SYNC_ERROR',
        `Failed to sync to Notion: ${error.message}`
      );
    }
  }

  /**
   * Extract platforms from Notion page properties
   */
  private getPlatformsFromProperties(properties: Record<string, any>): string[] {
    try {
      const platformProperty = properties.Platforms;
      if (!platformProperty || !platformProperty.multi_select) return [];

      return platformProperty.multi_select.map(option => option.name);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get scheduled time from Notion page properties
   */
  private getScheduledTimeFromProperties(properties: Record<string, any>): Date {
    const scheduledTime = properties.ScheduledTime;
    if (!scheduledTime || !scheduledTime.date) {
      // Default to 24 hours from now if no time specified
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    return new Date(scheduledTime.date.start);
  }

  /**
   * Extract Notion page ID from post content
   */
  private extractNotionPageId(content: string): string | null {
    try {
      const match = content.match(/notion-page-id:([a-f0-9-]+)/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Map platform status to Notion status
   */
  private mapStatusToNotion(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Scheduled';
      case 'PROCESSING':
        return 'Publishing';
      case 'COMPLETED':
        return 'Published';
      case 'FAILED':
        return 'Failed';
      default:
        return 'Unknown';
    }
  }
}