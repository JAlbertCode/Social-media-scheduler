/**
 * LinkedIn API client for managing posts and company pages
 */
export class LinkedInClient {
  private accessToken: string;
  private baseUrl = 'https://api.linkedin.com/v2';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user profile information
   */
  async getProfile() {
    return this.request('/me?fields=id,localizedFirstName,localizedLastName,profilePicture');
  }

  /**
   * Get list of company pages user has access to
   */
  async getCompanyPages() {
    return this.request('/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR');
  }

  /**
   * Create a text-only post
   */
  async createTextPost(text: string, visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC') {
    const payload = {
      author: `urn:li:person:${await this.getAuthorId()}`,
      commentary: text,
      visibility: visibility,
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false
    };

    return this.request('/ugcPosts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Create a post with media (image or video)
   */
  async createMediaPost(text: string, mediaUrl: string, mediaType: 'IMAGE' | 'VIDEO', visibility: 'PUBLIC' | 'CONNECTIONS' = 'PUBLIC') {
    // First register the media upload
    const registerUpload = await this.request('/assets?action=registerUpload', {
      method: 'POST',
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: [mediaType === 'IMAGE' ? 'urn:li:digitalmediaRecipe:feedshare-image' : 'urn:li:digitalmediaRecipe:feedshare-video'],
          owner: `urn:li:person:${await this.getAuthorId()}`,
          serviceRelationships: [{
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent'
          }]
        }
      })
    });

    // Upload the media using the upload URL provided
    const uploadUrl = registerUpload.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
    await fetch(uploadUrl, {
      method: 'PUT',
      body: await fetch(mediaUrl).then(r => r.blob()),
    });

    // Create the post with the media asset
    const payload = {
      author: `urn:li:person:${await this.getAuthorId()}`,
      commentary: text,
      visibility: visibility,
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      content: {
        media: {
          id: registerUpload.value.asset,
          title: {
            text: text.substring(0, 50) // LinkedIn requires a title for media
          }
        }
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false
    };

    return this.request('/ugcPosts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Schedule a post for future publishing
   */
  async schedulePost(post: any, scheduledTime: Date) {
    // LinkedIn API doesn't support direct scheduling, so we'll store this in our database
    // The actual posting will be handled by a scheduled task
    return {
      ...post,
      scheduledTime: scheduledTime.toISOString(),
    };
  }

  private async getAuthorId(): Promise<string> {
    const profile = await this.getProfile();
    return profile.id;
  }
}