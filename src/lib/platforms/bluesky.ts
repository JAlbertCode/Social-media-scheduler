import { BskyAgent } from '@atproto/api'
import { 
  SocialPlatform, 
  SocialPlatformConfig, 
  AccessTokenData, 
  PlatformUser, 
  MediaUploadResult, 
  PostResult 
} from './types'

export class BlueskyPlatform extends SocialPlatform {
  private agent: BskyAgent

  constructor(config: SocialPlatformConfig) {
    super(config, 'bluesky')
    this.agent = new BskyAgent({ service: 'https://bsky.social' })
  }

  getAuthUrl(): string {
    // Bluesky uses direct authentication with username/password or app password
    return ''
  }

  async authorize(code: string): Promise<AccessTokenData> {
    try {
      const [identifier, password] = Buffer.from(code, 'base64')
        .toString()
        .split(':')

      await this.agent.login({ identifier, password })
      
      return {
        accessToken: this.agent.session?.accessJwt || '',
        refreshToken: this.agent.session?.refreshJwt,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async refreshToken(refreshToken: string): Promise<AccessTokenData> {
    try {
      await this.agent.resumeSession({ refreshJwt: refreshToken })
      
      return {
        accessToken: this.agent.session?.accessJwt || '',
        refreshToken: this.agent.session?.refreshJwt,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getUser(accessToken: string): Promise<PlatformUser> {
    try {
      await this.agent.resumeSession({ accessJwt: accessToken })
      const profile = await this.agent.getProfile({ actor: this.agent.session?.did })

      return {
        id: profile.data.did,
        username: profile.data.handle,
        displayName: profile.data.displayName,
        profileImage: profile.data.avatar,
        isVerified: false // Bluesky doesn't have traditional verification
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
      await this.agent.resumeSession({ accessJwt: accessToken })
      const upload = await this.agent.uploadBlob(file, { encoding: mediaType })

      return {
        mediaId: upload.data.blob.ref.toString(),
        mediaType: mediaType.startsWith('image/') ? 'image' : 'video',
        url: `https://bsky.social/blob/${upload.data.blob.ref}`
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async createPost(
    content: string,
    mediaIds: string[],
    accessToken: string,
    options?: Record<string, any>
  ): Promise<PostResult> {
    try {
      await this.agent.resumeSession({ accessJwt: accessToken })

      const post = await this.agent.post({
        text: content,
        embed: mediaIds.length > 0 ? {
          $type: 'app.bsky.embed.images',
          images: mediaIds.map(id => ({
            image: id,
            alt: options?.altText || ''
          }))
        } : undefined
      })

      return {
        id: post.uri,
        url: `https://bsky.social/profile/${this.agent.session?.handle}/post/${post.cid}`,
        createdAt: new Date(),
        platform: this.platformType
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async deletePost(postId: string, accessToken: string): Promise<void> {
    try {
      await this.agent.resumeSession({ accessJwt: accessToken })
      await this.agent.deletePost(postId)
    } catch (error) {
      this.handleError(error)
    }
  }
}