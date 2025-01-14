import { prisma } from '@/lib/prisma';
import { PlatformError } from '../utils/errors';
import { APIManager } from '../platforms/api-manager';

interface ScheduledPost {
  id: string;
  userId: string;
  platform: string;
  content: string;
  mediaUrls?: string[];
  scheduledTime: Date;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error?: string;
}

export class Scheduler {
  private apiManager: APIManager;

  constructor() {
    this.apiManager = new APIManager();
  }

  /**
   * Schedule a new post
   */
  async schedulePost(postData: Omit<ScheduledPost, 'id' | 'status'>): Promise<ScheduledPost> {
    try {
      // Validate scheduling time
      if (new Date(postData.scheduledTime) <= new Date()) {
        throw new PlatformError(
          'VALIDATION_ERROR',
          'Scheduled time must be in the future'
        );
      }

      // Create scheduled post record
      const scheduledPost = await prisma.scheduledPost.create({
        data: {
          userId: postData.userId,
          platform: postData.platform,
          content: postData.content,
          mediaUrls: postData.mediaUrls,
          scheduledTime: postData.scheduledTime,
          status: 'PENDING'
        }
      });

      return scheduledPost;
    } catch (error) {
      throw new PlatformError(
        'PLATFORM_ERROR',
        `Failed to schedule post: ${error.message}`
      );
    }
  }

  /**
   * Process due posts
   */
  async processDuePosts(): Promise<void> {
    try {
      // Get posts that are due
      const duePosts = await prisma.scheduledPost.findMany({
        where: {
          status: 'PENDING',
          scheduledTime: {
            lte: new Date()
          }
        }
      });

      // Process each post
      for (const post of duePosts) {
        try {
          // Update status to processing
          await prisma.scheduledPost.update({
            where: { id: post.id },
            data: { status: 'PROCESSING' }
          });

          // Get user's platform credentials
          const credentials = await prisma.platformCredential.findFirst({
            where: {
              userId: post.userId,
              platform: post.platform
            }
          });

          if (!credentials) {
            throw new Error(`Platform credentials not found for ${post.platform}`);
          }

          // Post to platform using API manager
          await this.apiManager.execute(
            post.platform,
            async () => {
              // Platform-specific posting logic here
              // This would integrate with the individual platform clients
              const platformClient = await this.getPlatformClient(post.platform, credentials.accessToken);
              return platformClient.createPost({
                content: post.content,
                mediaUrls: post.mediaUrls
              });
            }
          );

          // Update status to completed
          await prisma.scheduledPost.update({
            where: { id: post.id },
            data: { status: 'COMPLETED' }
          });
        } catch (error) {
          // Update status to failed
          await prisma.scheduledPost.update({
            where: { id: post.id },
            data: {
              status: 'FAILED',
              error: error.message
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to process due posts:', error);
      throw error;
    }
  }

  /**
   * Get scheduled posts for a user
   */
  async getUserSchedule(userId: string): Promise<ScheduledPost[]> {
    return prisma.scheduledPost.findMany({
      where: {
        userId,
        status: {
          in: ['PENDING', 'PROCESSING']
        }
      },
      orderBy: {
        scheduledTime: 'asc'
      }
    });
  }

  /**
   * Update a scheduled post
   */
  async updateScheduledPost(
    postId: string,
    updates: Partial<Omit<ScheduledPost, 'id' | 'userId'>>
  ): Promise<ScheduledPost> {
    // Validate the post exists and belongs to user
    const post = await prisma.scheduledPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      throw new PlatformError('VALIDATION_ERROR', 'Scheduled post not found');
    }

    if (updates.scheduledTime && new Date(updates.scheduledTime) <= new Date()) {
      throw new PlatformError(
        'VALIDATION_ERROR',
        'Updated scheduled time must be in the future'
      );
    }

    return prisma.scheduledPost.update({
      where: { id: postId },
      data: updates
    });
  }

  /**
   * Delete a scheduled post
   */
  async deleteScheduledPost(postId: string): Promise<void> {
    await prisma.scheduledPost.delete({
      where: { id: postId }
    });
  }

  /**
   * Get platform-specific client
   */
  private async getPlatformClient(platform: string, accessToken: string) {
    // This would return the appropriate platform client based on the platform
    // Implementation would depend on how platform clients are structured
    switch (platform) {
      case 'TWITTER':
        const { TwitterClient } = await import('../platforms/twitter');
        return new TwitterClient(accessToken);
      case 'INSTAGRAM':
        const { InstagramClient } = await import('../platforms/instagram');
        return new InstagramClient(accessToken);
      case 'LINKEDIN':
        const { LinkedInClient } = await import('../platforms/linkedin');
        return new LinkedInClient(accessToken);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}