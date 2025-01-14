import {
  SocialPlatform,
  SocialPlatformConfig,
  AccessTokenData,
  PlatformUser,
  MediaUploadResult,
  PostResult
} from './types'

interface InstagramConfig extends SocialPlatformConfig {
  graphApiVersion: string
  graphApiBaseUrl: string
}

interface InstagramTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface InstagramUser {
  id: string
  username: string
  name?: string
  profile_picture_url?: string
  media_count?: number
  followers_count?: number
}

interface InstagramMediaUpload {
  id: string
  status_code: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
}

interface InstagramPost {
  id: string
  permalink: string
  timestamp: string
  media_type: string
  media_url?: string
}

export class InstagramPlatform extends SocialPlatform {
  private config: InstagramConfig

  constructor() {
    const config: InstagramConfig = {
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/instagram`,
      scopes: [
        'instagram_basic',
        'instagram_content_publish',
        'pages_show_list',
        'pages_read_engagement'
      ],
      authUrl: 'https://api.instagram.com/oauth/authorize',
      tokenUrl: 'https://api.instagram.com/oauth/access_token',
      graphApiVersion: 'v18.0',
      graphApiBaseUrl: 'https://graph.instagram.com'
    }
    super(config, 'Instagram')
    this.config = config
  }

  async authorize(code: string): Promise<AccessTokenData> {
    try {
      // Exchange code for short-lived token
      const params = new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri,
        code
      })

      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        body: params
      })

      if (!response.ok) {
        throw await response.json()
      }

      const data: InstagramTokenResponse = await response.json()

      // Exchange short-lived token for long-lived token
      const longLivedToken = await this.getLongLivedToken(data.access_token)

      return {
        accessToken: longLivedToken,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  private async getLongLivedToken(shortLivedToken: string): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: this.config.clientSecret,
      access_token: shortLivedToken
    })

    const response = await fetch(
      `${this.config.graphApiBaseUrl}/access_token?${params}`
    )

    if (!response.ok) {
      throw await response.json()
    }

    const data = await response.json()
    return data.access_token
  }

  async refreshToken(token: string): Promise<AccessTokenData> {
    try {
      const params = new URLSearchParams({
        grant_type: 'ig_refresh_token',
        access_token: token
      })

      const response = await fetch(
        `${this.config.graphApiBaseUrl}/refresh_access_token?${params}`
      )

      if (!response.ok) {
        throw await response.json()
      }

      const data = await response.json()

      return {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000)
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(','),
      response_type: 'code'
    })

    return `${this.config.authUrl}?${params.toString()}`
  }

  async getUser(accessToken: string): Promise<PlatformUser> {
    try {
      const response = await fetch(
        `${this.config.graphApiBaseUrl}/me?fields=id,username,name,profile_picture_url&access_token=${accessToken}`
      )

      if (!response.ok) {
        throw await response.json()
      }

      const data: InstagramUser = await response.json()

      return {
        id: data.id,
        username: data.username,
        displayName: data.name,
        profileImage: data.profile_picture_url
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async uploadMedia(
    file: Buffer,
    mediaType: string,
    accessToken: string,
    caption?: string
  ): Promise<MediaUploadResult> {
    try {
      // First, upload the media to get a container
      const container = await this.createMediaContainer(file, mediaType, accessToken, caption)

      // Check media status until ready or failed
      let status = await this.checkMediaStatus(container.id, accessToken)
      let attempts = 0
      const maxAttempts = 10
      const delay = 1000 // 1 second

      while (status !== 'FINISHED' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay))
        status = await this.checkMediaStatus(container.id, accessToken)
        attempts++
      }

      if (status !== 'FINISHED') {
        throw new Error('Media upload failed or timed out')
      }

      return {
        mediaId: container.id,
        mediaType: container.media_type.toLowerCase() as 'image' | 'video'
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  private async createMediaContainer(
    file: Buffer,
    mediaType: string,
    accessToken: string,
    caption?: string
  ): Promise<InstagramMediaUpload> {
    const isVideo = mediaType.startsWith('video/')
    const endpoint = isVideo ? 'video' : 'image'

    const params = new URLSearchParams({
      access_token: accessToken,
      media_type: isVideo ? 'VIDEO' : 'IMAGE',
      caption: caption || '',
      // For videos, we need to include additional parameters
      ...(isVideo && {
        video_url: 'PENDING', // Will be replaced with actual URL after upload
      })
    })

    const response = await fetch(
      `${this.config.graphApiBaseUrl}/me/media?${params}`,
      {
        method: 'POST'
      }
    )

    if (!response.ok) {
      throw await response.json()
    }

    return await response.json()
  }

  private async checkMediaStatus(
    mediaId: string,
    accessToken: string
  ): Promise<string> {
    const response = await fetch(
      `${this.config.graphApiBaseUrl}/${mediaId}?fields=status_code&access_token=${accessToken}`
    )

    if (!response.ok) {
      throw await response.json()
    }

    const data = await response.json()
    return data.status_code
  }

  async createPost(
    content: string,
    mediaIds: string[],
    accessToken: string
  ): Promise<PostResult> {
    try {
      if (!mediaIds.length) {
        throw new Error('Instagram requires at least one media item')
      }

      // Create the media container if not already created
      const params = new URLSearchParams({
        access_token: accessToken,
        media_type: mediaIds.length > 1 ? 'CAROUSEL' : 'FEED',
        children: mediaIds.join(','),
        caption: content
      })

      const response = await fetch(
        `${this.config.graphApiBaseUrl}/me/media_publish`,
        {
          method: 'POST',
          body: params
        }
      )

      if (!response.ok) {
        throw await response.json()
      }

      const data: InstagramPost = await response.json()

      return {
        id: data.id,
        url: data.permalink,
        createdAt: new Date(data.timestamp),
        platform: 'Instagram'
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async deletePost(postId: string, accessToken: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.config.graphApiBaseUrl}/${postId}?access_token=${accessToken}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        throw await response.json()
      }
    } catch (error) {
      return this.handleError(error)
    }
  }
}