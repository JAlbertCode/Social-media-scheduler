import {
  SocialPlatform,
  SocialPlatformConfig,
  AccessTokenData,
  PlatformUser,
  MediaUploadResult,
  PostResult
} from './types'

interface TikTokConfig extends SocialPlatformConfig {
  apiVersion: string
  apiBaseUrl: string
}

interface TikTokTokenResponse {
  access_token: string
  refresh_token: string
  open_id: string
  expires_in: number
  refresh_expires_in: number
}

interface TikTokUser {
  open_id: string
  union_id: string
  avatar_url: string
  display_name: string
  bio_description: string
  profile_deep_link: string
  is_verified: boolean
  follower_count: number
  following_count: number
  likes_count: number
}

interface TikTokVideoUpload {
  video_id: string
  upload_url: string
}

interface TikTokPost {
  share_id: string
  item_id: string
  create_time: number
}

export class TikTokPlatform extends SocialPlatform {
  private config: TikTokConfig

  constructor() {
    const config: TikTokConfig = {
      clientId: process.env.TIKTOK_CLIENT_KEY!,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/tiktok`,
      scopes: [
        'user.info.basic',
        'video.list',
        'video.upload',
        'video.publish'
      ],
      authUrl: 'https://www.tiktok.com/auth/authorize/',
      tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
      apiVersion: 'v2',
      apiBaseUrl: 'https://open-api.tiktok.com'
    }
    super(config, 'TikTok')
    this.config = config
  }

  async authorize(code: string): Promise<AccessTokenData> {
    try {
      const params = new URLSearchParams({
        client_key: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: 'authorization_code'
      })

      const response = await fetch(`${this.config.tokenUrl}?${params}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw await response.json()
      }

      const data = await response.json()
      const tokenData: TikTokTokenResponse = data.data

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        tokenType: 'Bearer'
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async refreshToken(refreshToken: string): Promise<AccessTokenData> {
    try {
      const params = new URLSearchParams({
        client_key: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })

      const response = await fetch(
        `${this.config.apiBaseUrl}/oauth/refresh_token/?${params}`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw await response.json()
      }

      const data = await response.json()
      const tokenData: TikTokTokenResponse = data.data

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        tokenType: 'Bearer'
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_key: this.config.clientId,
      response_type: 'code',
      scope: this.config.scopes.join(','),
      redirect_uri: this.config.redirectUri,
      state: 'tiktok'
    })

    return `${this.config.authUrl}?${params.toString()}`
  }

  async getUser(accessToken: string): Promise<PlatformUser> {
    try {
      const params = new URLSearchParams({
        access_token: accessToken,
        fields: [
          'open_id',
          'union_id',
          'avatar_url',
          'display_name',
          'bio_description',
          'profile_deep_link',
          'is_verified',
          'follower_count',
          'following_count',
          'likes_count'
        ].join(',')
      })

      const response = await fetch(
        `${this.config.apiBaseUrl}/user/info/?${params}`
      )

      if (!response.ok) {
        throw await response.json()
      }

      const data = await response.json()
      const userData: TikTokUser = data.data.user

      return {
        id: userData.open_id,
        username: userData.display_name,
        profileImage: userData.avatar_url,
        isVerified: userData.is_verified
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async uploadMedia(
    file: Buffer,
    mediaType: string,
    accessToken: string
  ): Promise<MediaUploadResult> {
    try {
      // TikTok only supports video uploads
      if (!mediaType.startsWith('video/')) {
        throw new Error('TikTok only supports video uploads')
      }

      // Get upload URL
      const uploadInfo = await this.createUpload(accessToken)

      // Upload video to TikTok's servers
      await this.uploadVideo(uploadInfo.upload_url, file)

      return {
        mediaId: uploadInfo.video_id,
        mediaType: 'video'
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  private async createUpload(accessToken: string): Promise<TikTokVideoUpload> {
    const response = await fetch(
      `${this.config.apiBaseUrl}/share/video/upload/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw await response.json()
    }

    const data = await response.json()
    return data.data
  }

  private async uploadVideo(uploadUrl: string, file: Buffer): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'video/mp4'
      },
      body: file
    })

    if (!response.ok) {
      throw await response.json()
    }
  }

  async createPost(
    content: string,
    mediaIds: string[],
    accessToken: string
  ): Promise<PostResult> {
    try {
      if (!mediaIds.length) {
        throw new Error('TikTok requires a video for posting')
      }

      const params = new URLSearchParams({
        access_token: accessToken,
        video_id: mediaIds[0],
        title: content.slice(0, 150), // TikTok caption limit
        privacy_level: 'PUBLIC'
      })

      const response = await fetch(
        `${this.config.apiBaseUrl}/share/video/publish/?${params}`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw await response.json()
      }

      const data = await response.json()
      const postData: TikTokPost = data.data

      return {
        id: postData.share_id,
        createdAt: new Date(postData.create_time * 1000),
        platform: 'TikTok'
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async deletePost(postId: string, accessToken: string): Promise<void> {
    try {
      const params = new URLSearchParams({
        access_token: accessToken,
        share_id: postId
      })

      const response = await fetch(
        `${this.config.apiBaseUrl}/share/video/delete/?${params}`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw await response.json()
      }
    } catch (error) {
      return this.handleError(error)
    }
  }
}