import {
  SocialPlatform,
  SocialPlatformConfig,
  AccessTokenData,
  PlatformUser,
  MediaUploadResult,
  PostResult
} from './types'
import { google } from 'googleapis'

interface YouTubeConfig extends SocialPlatformConfig {
  apiVersion: string
  uploadChunkSize: number
}

interface YouTubeTokenResponse {
  access_token: string
  refresh_token?: string
  expiry_date: number
  token_type: string
}

interface YouTubeUser {
  id: string
  snippet: {
    title: string
    description: string
    thumbnails: {
      default?: { url: string }
      medium?: { url: string }
      high?: { url: string }
    }
  }
  statistics?: {
    subscriberCount: string
    videoCount: string
  }
}

interface YouTubeVideo {
  id: string
  snippet: {
    publishedAt: string
    title: string
    description: string
  }
  status: {
    privacyStatus: string
    uploadStatus: string
  }
}

export class YouTubePlatform extends SocialPlatform {
  private config: YouTubeConfig
  private youtube: any // google.youtube type

  constructor() {
    const config: YouTubeConfig = {
      clientId: process.env.YOUTUBE_CLIENT_ID!,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/youtube`,
      scopes: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube.force-ssl'
      ],
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      apiVersion: 'v3',
      uploadChunkSize: 1024 * 1024 * 5 // 5MB chunks
    }
    super(config, 'YouTube')
    this.config = config

    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    )

    this.youtube = google.youtube({
      version: config.apiVersion,
      auth: oauth2Client
    })
  }

  async authorize(code: string): Promise<AccessTokenData> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        this.config.clientId,
        this.config.clientSecret,
        this.config.redirectUri
      )

      const { tokens } = await oauth2Client.getToken(code)

      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(tokens.expiry_date!),
        tokenType: tokens.token_type
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async refreshToken(refreshToken: string): Promise<AccessTokenData> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        this.config.clientId,
        this.config.clientSecret,
        this.config.redirectUri
      )

      oauth2Client.setCredentials({
        refresh_token: refreshToken
      })

      const { credentials } = await oauth2Client.refreshAccessToken()

      return {
        accessToken: credentials.access_token!,
        refreshToken: credentials.refresh_token || refreshToken,
        expiresAt: new Date(credentials.expiry_date!),
        tokenType: credentials.token_type
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  getAuthUrl(): string {
    const oauth2Client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    )

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
      include_granted_scopes: true
    })
  }

  async getUser(accessToken: string): Promise<PlatformUser> {
    try {
      const oauth2Client = new google.auth.OAuth2()
      oauth2Client.setCredentials({ access_token: accessToken })

      const response = await this.youtube.channels.list({
        auth: oauth2Client,
        part: ['snippet', 'statistics'],
        mine: true
      })

      const channel: YouTubeUser = response.data.items[0]

      return {
        id: channel.id,
        username: channel.snippet.title,
        displayName: channel.snippet.title,
        profileImage: channel.snippet.thumbnails.high?.url ||
                     channel.snippet.thumbnails.medium?.url ||
                     channel.snippet.thumbnails.default?.url
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async uploadMedia(
    file: Buffer,
    mediaType: string,
    accessToken: string,
    metadata: {
      title: string
      description: string
      tags?: string[]
      privacyStatus?: 'private' | 'unlisted' | 'public'
    }
  ): Promise<MediaUploadResult> {
    try {
      if (!mediaType.startsWith('video/')) {
        throw new Error('YouTube only supports video uploads')
      }

      const oauth2Client = new google.auth.OAuth2()
      oauth2Client.setCredentials({ access_token: accessToken })

      // Create resumable upload session
      const res = await this.youtube.videos.insert({
        auth: oauth2Client,
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags
          },
          status: {
            privacyStatus: metadata.privacyStatus || 'private'
          }
        },
        media: {
          body: file
        }
      }, {
        onUploadProgress: (evt: any) => {
          const progress = (evt.bytesRead / file.length) * 100
          console.log(`Upload progress: ${progress.toFixed(2)}%`)
        }
      })

      const video: YouTubeVideo = res.data

      return {
        mediaId: video.id,
        mediaType: 'video',
        url: `https://youtube.com/watch?v=${video.id}`
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async createPost(
    content: string,
    mediaIds: string[],
    accessToken: string,
    options?: {
      privacyStatus?: 'private' | 'unlisted' | 'public'
      scheduledTime?: Date
    }
  ): Promise<PostResult> {
    try {
      if (!mediaIds.length) {
        throw new Error('YouTube requires a video for posting')
      }

      const oauth2Client = new google.auth.OAuth2()
      oauth2Client.setCredentials({ access_token: accessToken })

      // Update video details
      const response = await this.youtube.videos.update({
        auth: oauth2Client,
        part: ['status'],
        requestBody: {
          id: mediaIds[0],
          status: {
            privacyStatus: options?.privacyStatus || 'private',
            ...(options?.scheduledTime && {
              publishAt: options.scheduledTime.toISOString()
            })
          }
        }
      })

      const video: YouTubeVideo = response.data

      return {
        id: video.id,
        url: `https://youtube.com/watch?v=${video.id}`,
        createdAt: new Date(video.snippet.publishedAt),
        platform: 'YouTube'
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async deletePost(postId: string, accessToken: string): Promise<void> {
    try {
      const oauth2Client = new google.auth.OAuth2()
      oauth2Client.setCredentials({ access_token: accessToken })

      await this.youtube.videos.delete({
        auth: oauth2Client,
        id: postId
      })
    } catch (error) {
      return this.handleError(error)
    }
  }
}