import { Client } from '@notionhq/client';
import { PlatformError } from '../utils/errors';

interface NotionPage {
  id: string;
  properties: Record<string, any>;
  content: string;
}

interface ContentTemplate {
  platform: string;
  format: string;
  variables: string[];
}

export class NotionService {
  private client: Client;
  
  constructor(accessToken: string) {
    this.client = new Client({ auth: accessToken });
  }

  /**
   * Fetch pages from a specific database
   */
  async getPages(databaseId: string): Promise<NotionPage[]> {
    try {
      const response = await this.client.databases.query({
        database_id: databaseId,
        filter: {
          property: 'Status',
          select: {
            equals: 'Ready to Post'
          }
        }
      });

      const pages = await Promise.all(
        response.results.map(async page => ({
          id: page.id,
          properties: page.properties,
          content: await this.getPageContent(page.id)
        }))
      );

      return pages;
    } catch (error) {
      throw new PlatformError(
        'API_ERROR',
        `Failed to fetch Notion pages: ${error.message}`
      );
    }
  }

  /**
   * Get content from a specific page
   */
  private async getPageContent(pageId: string): Promise<string> {
    try {
      const blocks = await this.client.blocks.children.list({
        block_id: pageId
      });

      return this.parseBlocks(blocks.results);
    } catch (error) {
      throw new PlatformError(
        'API_ERROR',
        `Failed to fetch page content: ${error.message}`
      );
    }
  }

  /**
   * Parse Notion blocks into formatted content
   */
  private parseBlocks(blocks: any[]): string {
    let content = '';

    for (const block of blocks) {
      switch (block.type) {
        case 'paragraph':
          content += block.paragraph.rich_text.map(text => text.plain_text).join('') + '\n\n';
          break;
        case 'heading_1':
          content += '# ' + block.heading_1.rich_text.map(text => text.plain_text).join('') + '\n\n';
          break;
        case 'heading_2':
          content += '## ' + block.heading_2.rich_text.map(text => text.plain_text).join('') + '\n\n';
          break;
        case 'bulleted_list_item':
          content += '• ' + block.bulleted_list_item.rich_text.map(text => text.plain_text).join('') + '\n';
          break;
        case 'numbered_list_item':
          content += '1. ' + block.numbered_list_item.rich_text.map(text => text.plain_text).join('') + '\n';
          break;
        // Add more block types as needed
      }
    }

    return content.trim();
  }

  /**
   * Update page status
   */
  async updatePageStatus(pageId: string, status: string): Promise<void> {
    try {
      await this.client.pages.update({
        page_id: pageId,
        properties: {
          Status: {
            select: {
              name: status
            }
          }
        }
      });
    } catch (error) {
      throw new PlatformError(
        'API_ERROR',
        `Failed to update page status: ${error.message}`
      );
    }
  }

  /**
   * Apply content template to page content
   */
  async applyTemplate(
    pageId: string,
    template: ContentTemplate
  ): Promise<string> {
    try {
      const page = await this.getPageContent(pageId);
      let formattedContent = template.format;

      // Replace template variables with page content
      for (const variable of template.variables) {
        const value = this.extractVariable(page, variable);
        formattedContent = formattedContent.replace(`{${variable}}`, value);
      }

      return formattedContent;
    } catch (error) {
      throw new PlatformError(
        'API_ERROR',
        `Failed to apply template: ${error.message}`
      );
    }
  }

  /**
   * Extract variable value from page content
   */
  private extractVariable(content: string, variable: string): string {
    // Implement variable extraction logic based on your needs
    // This is a simple example
    const regex = new RegExp(`${variable}:\\s*([^\\n]+)`);
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Sync content status back to Notion
   */
  async syncContentStatus(
    pageId: string,
    status: string,
    platformUrls?: Record<string, string>
  ): Promise<void> {
    try {
      const updates: any = {
        Status: {
          select: {
            name: status
          }
        }
      };

      if (platformUrls) {
        updates.PlatformUrls = {
          rich_text: [{
            type: 'text',
            text: {
              content: JSON.stringify(platformUrls, null, 2)
            }
          }]
        };
      }

      await this.client.pages.update({
        page_id: pageId,
        properties: updates
      });
    } catch (error) {
      throw new PlatformError(
        'API_ERROR',
        `Failed to sync content status: ${error.message}`
      );
    }
  }
}