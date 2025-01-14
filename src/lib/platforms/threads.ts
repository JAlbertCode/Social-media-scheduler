import {
  SocialPlatform,
  SocialPlatformConfig,
  AccessTokenData,
  PlatformUser,
  MediaUploadResult,
  PostResult
} from './types'

interface ThreadsConfig extends SocialPlatformConfig {
  apiVersion: string
  apiBaseUrl: string
}

interface ThreadsUser {
  id: string
  username: string
  full_name: string
  profile_pic_url: string
  follower_count: number
  bio: string
}

interface ThreadsMedia {
  id: string
  media_type: 'image' | 'video'
  url: string
}

interface ThreadsPost {
  id: string
  code: string // used for URL generation
  text: string
  created_at: number
  reply_to?: string
}

export class ThreadsPlatform extends SocialPlatform {
  private config: ThreadsConfig

  constructor() {
    const config: ThreadsConfig = {
      // Threads uses the same app credentials as Instagram
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/threads`,
      scopes: [
        'threads_api',
        'threads_messaging',
        'instagram_basic'
      ],
      authUrl: 'https://www.instagram.com/oauth/authorize',
      tokenUrl: 'https://api.instagram.com/oauth/access_token',
      apiVersion: 'v1',
      apiBaseUrl: 'https://www.threads.net/api'
    }
    super(config, 'Threads')
    this.config = config
  }

  async authorize(code: string): Promise<AccessTokenData> {
    try {
      // Use Instagram's OAuth flow since Threads shares the same authentication
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

      const data = await response.json()

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
      `${this.config.apiBaseUrl}/access_token?${params}`
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
        `${this.config.apiBaseUrl}/refresh_access_token?${params}`
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
        `${this.config.apiBaseUrl}/users/me?fields=id,username,full_name,profile_pic_url,follower_count,bio`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw await response.json()
      }

      const user: ThreadsUser = await response.json()

      return {
        id: user.id,
        username: user.username,
        displayName: user.full_name,
        profileImage: user.profile_pic_url
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
      // Upload media using Instagram's API since Threads shares the same media infrastructure
      const form = new FormData()
      form.append('media', new Blob([file], { type: mediaType }))

      const response = await fetch(
        `${this.config.apiBaseUrl}/media`,
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

      const data: ThreadsMedia = await response.json()

      return {
        mediaId: data.id,
        mediaType: data.media_type,
        url: data.url
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
      replyTo?: string
      shareToInstagram?: boolean
    }
  ): Promise<PostResult> {
    try {
      const payload: any = {
        text: content,
        ...(mediaIds.length > 0 && {
          media_ids: mediaIds
        }),
        ...(options?.replyTo && {
          reply_to: options.replyTo
        }),
        share_to_instagram: options?.shareToInstagram ?? false
      }

      const response = await fetch(
        `${this.config.apiBaseUrl}/text/create_text_post`,
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

      const post: ThreadsPost = await response.json()

      return {
        id: post.id,
        url: `https://www.threads.net/t/${post.code}`,
        createdAt: new Date(post.created_at * 1000),
        platform: 'Threads'
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async deletePost(postId: string, accessToken: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.config.apiBaseUrl}/delete_post`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            post_id: postId
          })
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
    threadPosts: Array<{
      content: string
      mediaIds?: string[]
    }>,
    accessToken: string,
    options?: {
      shareToInstagram?: boolean
    }
  ): Promise<PostResult[]> {
    const results: PostResult[] = []
    let previousPost: PostResult | undefined

    for (const post of threadPosts) {
      const result = await this.createPost(
        post.content,
        post.mediaIds || [],
        accessToken,
        {
          replyTo: previousPost?.id,
          shareToInstagram: options?.shareToInstagram
        }
      )

      results.push(result)
      previousPost = result

      // Add a small delay between posts to maintain order
      if (threadPosts.indexOf(post) < threadPosts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return results
  }
}