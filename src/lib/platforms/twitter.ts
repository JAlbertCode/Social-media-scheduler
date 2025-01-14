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
  scope?: string
}

interface TwitterUser {
  id: string
  username: string
  name: string
  profile_image_url?: string
  verified?: boolean
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
  }
}

interface TwitterMediaUpload {
  media_id_string: string
  media_key: string
  type: 'photo' | 'video' | 'animated_gif'
  url?: string
}

interface TwitterTweet {
  id: string
  text: string
  created_at: string
  conversation_id: string
  in_reply_to_user_id?: string
}

interface TwitterThreadConfig {
  replyToTweet?: string
  quoteTweet?: string
  excludeReplyUserIds?: string[]
  autoPopulateReplyMetadata?: boolean
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
        'tweet.moderate',
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
        redirect_uri: this.config.redirectUri,
        code_verifier: 'challenge' // In production, use proper PKCE
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
        expiresAt: data.expires_in 
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
        scope: data.scope
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
        refreshToken: data.refresh_token || refreshToken,
        expiresAt: data.expires_in 
          ? new Date(Date.now() + data.expires_in * 1000)
          : undefined,
        scope: data.scope
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
      code_challenge: 'challenge' // In production, use proper PKCE
    })

    return `${this.config.authUrl}?${params.toString()}`
  }

  async getUser(accessToken: string): Promise<PlatformUser> {
    try {
      const response = await fetch(
        `${this.config.apiBaseUrl}/users/me?user.fields=profile_image_url,verified,public_metrics`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw await response.json()
      }

      const data = await response.json()
      const user: TwitterUser = data.data

      return {
        id: user.id,
        username: user.username,
        displayName: user.name,
        profileImage: user.profile_image_url,
        isVerified: user.verified
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
      if (mediaType.startsWith('video/')) {
        return await this.uploadVideoChunked(file, mediaType, accessToken)
      }

      // For images, use simple upload
      const form = new FormData()
      form.append('media', new Blob([file], { type: mediaType }))

      const response = await fetch(
        `${this.config.uploadBaseUrl}/media/upload.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: form
        }
      )

      if (!response.ok) {
        throw await response.json()
      }

      const data: TwitterMediaUpload = await response.json()
      
      return {
        mediaId: data.media_id_string,
        mediaKey: data.media_key,
        mediaType: data.type === 'photo' ? 'image' : 'video',
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
      // INIT phase
      const initData = await this.uploadInit(file.length, mediaType, accessToken)

      // APPEND phase
      const chunkSize = 5 * 1024 * 1024 // 5MB chunks
      for (let i = 0; i < file.length; i += chunkSize) {
        const chunk = file.slice(i, i + chunkSize)
        await this.uploadAppend(
          initData.media_id_string,
          chunk,
          i / chunkSize,
          accessToken
        )
      }

      // FINALIZE phase
      const finalData = await this.uploadFinalize(initData.media_id_string, accessToken)

      return {
        mediaId: finalData.media_id_string,
        mediaKey: finalData.media_key,
        mediaType: 'video',
        url: finalData.url
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  private async uploadInit(
    totalBytes: number,
    mediaType: string,
    accessToken: string
  ): Promise<TwitterMediaUpload> {
    const response = await fetch(
      `${this.config.uploadBaseUrl}/media/upload.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: 'INIT',
          total_bytes: totalBytes,
          media_type: mediaType
        })
      }
    )

    if (!response.ok) {
      throw await response.json()
    }

    return response.json()
  }

  private async uploadAppend(
    mediaId: string,
    chunk: Buffer,
    segmentIndex: number,
    accessToken: string
  ): Promise<void> {
    const form = new FormData()
    form.append('command', 'APPEND')
    form.append('media_id', mediaId)
    form.append('segment_index', segmentIndex.toString())
    form.append('media', new Blob([chunk]))

    const response = await fetch(
      `${this.config.uploadBaseUrl}/media/upload.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: form
      }
    )

    if (!response.ok) {
      throw await response.json()
    }
  }

  private async uploadFinalize(
    mediaId: string,
    accessToken: string
  ): Promise<TwitterMediaUpload> {
    const response = await fetch(
      `${this.config.uploadBaseUrl}/media/upload.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: 'FINALIZE',
          media_id: mediaId
        })
      }
    )

    if (!response.ok) {
      throw await response.json()
    }

    return response.json()
  }

  async createPost(
    content: string,
    mediaIds: string[],
    accessToken: string,
    threadConfig?: TwitterThreadConfig
  ): Promise<PostResult> {
    try {
      const payload: any = {
        text: content,
        ...(mediaIds.length > 0 && {
          media: {
            media_ids: mediaIds
          }
        })
      }

      if (threadConfig) {
        if (threadConfig.replyToTweet) {
          payload.reply = {
            in_reply_to_tweet_id: threadConfig.replyToTweet,
            exclude_reply_user_ids: threadConfig.excludeReplyUserIds
          }
        }
        if (threadConfig.quoteTweet) {
          payload.quote_tweet_id = threadConfig.quoteTweet
        }
      }

      const response = await fetch(
        `${this.config.apiBaseUrl}/tweets`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        throw await response.json()
      }

      const tweet: TwitterTweet = (await response.json()).data

      return {
        id: tweet.id,
        url: `https://twitter.com/i/web/status/${tweet.id}`,
        createdAt: new Date(tweet.created_at),
        platform: 'Twitter',
        threadId: tweet.conversation_id
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
            'Authorization': `Bearer ${accessToken}`
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

  async createThread(
    tweets: Array<{
      content: string
      mediaIds?: string[]
    }>,
    accessToken: string
  ): Promise<PostResult[]> {
    const results: PostResult[] = []
    let previousTweet: PostResult | undefined

    for (const tweet of tweets) {
      const result = await this.createPost(
        tweet.content,
        tweet.mediaIds || [],
        accessToken,
        previousTweet ? {
          replyToTweet: previousTweet.id,
          autoPopulateReplyMetadata: true
        } : undefined
      )

      results.push(result)
      previousTweet = result
    }

    return results
  }
}