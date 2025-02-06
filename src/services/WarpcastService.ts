import { WarpcastPost, WarpcastConfig } from '../types/warpcast';

export class WarpcastService {
  private config: WarpcastConfig;

  constructor(config: WarpcastConfig) {
    this.config = config;
  }

  async createPost(post: WarpcastPost): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // For testing purposes, just return success
      return {
        success: true,
        id: `warpcast-${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async schedulePost(post: WarpcastPost): Promise<{ success: boolean; error?: string }> {
    try {
      // For testing purposes, just return success
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async validatePost(post: WarpcastPost): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Validate content length (Warpcast typically has a character limit)
    if (post.content.length > 320) {
      errors.push('Content exceeds 320 character limit');
    }

    // Validate media (if present)
    if (post.media && post.media.length > 4) {
      errors.push('Maximum of 4 media items allowed');
    }

    // Validate scheduled time
    if (post.scheduledTime && new Date(post.scheduledTime) < new Date()) {
      errors.push('Scheduled time must be in the future');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
