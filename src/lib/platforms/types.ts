import { PlatformType } from '@/components/PostCreator'

export interface SocialPlatformConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  authUrl: string
  tokenUrl: string
}

export interface AccessTokenData {
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  tokenType?: string
}

export interface PlatformUser {
  id: string
  username: string
  displayName?: string
  profileImage?: string
  isVerified?: boolean
}

export interface MediaUploadResult {
  mediaId: string
  mediaType: 'image' | 'video'
  url?: string
}

export interface PostResult {
  id: string
  url?: string
  createdAt: Date
  platform: PlatformType
}

export interface PlatformError extends Error {
  code?: string
  statusCode?: number
  retryAfter?: number
}

export abstract class SocialPlatform {
  protected config: SocialPlatformConfig
  protected platformType: PlatformType

  constructor(config: SocialPlatformConfig, platformType: PlatformType) {
    this.config = config
    this.platformType = platformType
  }

  abstract authorize(code: string): Promise<AccessTokenData>
  abstract refreshToken(refreshToken: string): Promise<AccessTokenData>
  abstract getAuthUrl(): string
  abstract getUser(accessToken: string): Promise<PlatformUser>
  abstract uploadMedia(
    file: Buffer,
    mediaType: string,
    accessToken: string
  ): Promise<MediaUploadResult>
  abstract createPost(
    content: string,
    mediaIds: string[],
    accessToken: string,
    options?: Record<string, any>
  ): Promise<PostResult>
  abstract deletePost(postId: string, accessToken: string): Promise<void>

  protected async handleRateLimit(error: PlatformError): Promise<void> {
    if (error.retryAfter) {
      await new Promise(resolve => setTimeout(resolve, error.retryAfter * 1000))
    }
  }

  protected handleError(error: any): never {
    const platformError: PlatformError = new Error(
      error.message || 'Platform error occurred'
    )
    platformError.code = error.code
    platformError.statusCode = error.status || error.statusCode
    platformError.retryAfter = error.retryAfter
    throw platformError
  }
}