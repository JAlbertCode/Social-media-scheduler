/**
 * Instagram API client for handling Instagram Graph API interactions
 */
export class InstagramClient {
  private accessToken: string;
  private baseUrl = 'https://graph.instagram.com/v12.0';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get basic account information
   */
  async getAccountInfo() {
    const response = await fetch(`${this.baseUrl}/me?fields=id,username,account_type&access_token=${this.accessToken}`);
    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get list of media items
   */
  async getMediaList() {
    const response = await fetch(`${this.baseUrl}/me/media?fields=id,caption,media_type,thumbnail_url,permalink&access_token=${this.accessToken}`);
    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Create a new Instagram post
   */
  async createPost({ mediaId, caption, scheduledTime }: {
    mediaId: string;
    caption?: string;
    scheduledTime?: Date;
  }) {
    const params = new URLSearchParams({
      media_id: mediaId,
      access_token: this.accessToken,
    });

    if (caption) {
      params.append('caption', caption);
    }

    if (scheduledTime) {
      params.append('scheduled_publish_time', Math.floor(scheduledTime.getTime() / 1000).toString());
    }

    const response = await fetch(`${this.baseUrl}/me/media_publish`, {
      method: 'POST',
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload media to Instagram
   */
  async uploadMedia(url: string, mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM') {
    const params = new URLSearchParams({
      image_url: url,
      media_type: mediaType,
      access_token: this.accessToken,
    });

    const response = await fetch(`${this.baseUrl}/me/media`, {
      method: 'POST',
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }

    return response.json();
  }
}