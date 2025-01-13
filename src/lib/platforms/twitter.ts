import {
  SocialPlatform,
  SocialPlatformConfig,
  AccessTokenData,
  PlatformUser,
  MediaUploadResult,
  PostResult
} from './types'

interface TwitterConfig extends SocialPlatformConfig {
  apiVersion: string
  apiBaseUrl: string
  uploadBaseUrl: string
}

interface TwitterTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type: string
}

interface TwitterUser {
  id: string
  username: string
  name: string
  profile_image_url?: string
  verified?: boolean
}

interface TwitterMediaUpload {
  media_id_string: string
  media_type: string
  url?: string
}

interface TwitterTweet {
  id: string
  text: string
  created_at: string
}

export class TwitterPlatform extends SocialPlatform {
  private config: TwitterConfig

  constructor() {
    const config: TwitterConfig = {
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/twitter`,
      scopes: [
        'tweet.read',
        'tweet.write',
        'users.read',
        'offline.access'
      ],
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      apiVersion: '2',
      apiBaseUrl: 'https://api.twitter.com/2',
      uploadBaseUrl: 'https://upload.twitter.com/1.1'
    }
    super(config, 'Twitter')
    this.config = config
  }

  async authorize(code: string): Promise<AccessTokenData> {
    try {
      const params = new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri
      })

      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })

      if (!response.ok) {
        throw await response.json()
      }

      const data: TwitterTokenResponse = await response.json()
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: data.token_type,
        expiresAt: data.expires_in 
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async refreshToken(refreshToken: string): Promise<AccessTokenData> {
    try {
      const params = new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })

      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })

      if (!response.ok) {
        throw await response.json()
      }

      const data: TwitterTokenResponse = await response.json()
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: data.token_type,
        expiresAt: data.expires_in 
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state: 'twitter',
      code_challenge_method: 'S256',
      code_challenge: 'challenge' // In production, generate this properly
    })

    return `${this.config.authUrl}?${params.toString()}`
  }

  async getUser(accessToken: string): Promise<PlatformUser> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw await response.json()
      }

      const data: { data: TwitterUser } = await response.json()
      
      return {
        id: data.data.id,
        username: data.data.username,
        displayName: data.data.name,
        profileImage: data.data.profile_image_url,
        isVerified: data.data.verified
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
      // For videos, use chunked upload
      const isVideo = mediaType.startsWith('video/')
      
      if (isVideo) {
        return await this.uploadVideoChunked(file, mediaType, accessToken)
      }

      // For images, use simple upload
      const form = new FormData()
      form.append('media', new Blob([file], { type: mediaType }))

      const response = await fetch(`${this.config.uploadBaseUrl}/media/upload.json`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: form
      })

      if (!response.ok) {
        throw await response.json()
      }

      const data: TwitterMediaUpload = await response.json()
      
      return {
        mediaId: data.media_id_string,
        mediaType: data.media_type === 'video' ? 'video' : 'image',
        url: data.url
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  private async uploadVideoChunked(
    file: Buffer,
    mediaType: string,
    accessToken: string
  ): Promise<MediaUploadResult> {
    try {
      // INIT
      const initResponse = await fetch(
        `${this.config.uploadBaseUrl}/media/upload.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            command: 'INIT',
            total_bytes: file.length,
            media_type: mediaType
          })
        }
      )

      if (!initResponse.ok) {
        throw await initResponse.json()
      }

      const { media_id_string } = await initResponse.json()

      // APPEND
      const chunkSize = 5 * 1024 * 1024 // 5MB chunks
      let segmentIndex = 0

      for (let i = 0; i < file.length; i += chunkSize) {
        const chunk = file.slice(i, i + chunkSize)
        const form = new FormData()
        form.append('command', 'APPEND')
        form.append('media_id', media_id_string)
        form.append('segment_index', segmentIndex.toString())
        form.append('media', new Blob([chunk]))

        const appendResponse = await fetch(
          `${this.config.uploadBaseUrl}/media/upload.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            body: form
          }
        )

        if (!appendResponse.ok) {
          throw await appendResponse.json()
        }

        segmentIndex++
      }

      // FINALIZE
      const finalizeResponse = await fetch(
        `${this.config.uploadBaseUrl}/media/upload.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            command: 'FINALIZE',
            media_id: media_id_string
          })
        }
      )

      if (!finalizeResponse.ok) {
        throw await finalizeResponse.json()
      }

      const finalData: TwitterMediaUpload = await finalizeResponse.json()
      
      return {
        mediaId: finalData.media_id_string,
        mediaType: 'video',
        url: finalData.url
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async createPost(
    content: string,
    mediaIds: string[],
    accessToken: string,
    options?: { reply_to?: string }
  ): Promise<PostResult> {
    try {
      const payload: any = {
        text: content
      }

      if (mediaIds.length > 0) {
        payload.media = {
          media_ids: mediaIds
        }
      }

      if (options?.reply_to) {
        payload.reply = {
          in_reply_to_tweet_id: options.reply_to
        }
      }

      const response = await fetch(`${this.config.apiBaseUrl}/tweets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw await response.json()
      }

      const data: { data: TwitterTweet } = await response.json()
      
      return {
        id: data.data.id,
        url: `https://twitter.com/i/web/status/${data.data.id}`,
        createdAt: new Date(data.data.created_at),
        platform: 'Twitter'
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async deletePost(postId: string, accessToken: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.config.apiBaseUrl}/tweets/${postId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
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