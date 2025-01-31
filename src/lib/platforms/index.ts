import { PlatformType } from '@/components/PostCreator'
import { TwitterPlatform } from './twitter'
import { LinkedInPlatform } from './linkedin'
import { InstagramPlatform } from './instagram'
import { TikTokPlatform } from './tiktok'
import { YouTubePlatform } from './youtube'
import { ThreadsPlatform } from './threads'
import { BlueskyPlatform } from './bluesky'
import { SocialPlatform } from './types'

export class PlatformFactory {
  private static instances: Map<PlatformType, SocialPlatform> = new Map()

  static getPlatform(type: PlatformType): SocialPlatform {
    if (!this.instances.has(type)) {
      switch (type) {
        case 'Twitter':
          this.instances.set(type, new TwitterPlatform())
          case 'Threads':
          this.instances.set(type, new ThreadsPlatform())
          break
        case 'Bluesky':
          this.instances.set(type, new BlueskyPlatform())
          break
        case 'LinkedIn':
          this.instances.set(type, new LinkedInPlatform())
          break
        case 'Instagram':
          this.instances.set(type, new InstagramPlatform())
          break
        case 'TikTok':
          this.instances.set(type, new TikTokPlatform())
          break
        case 'YouTube':
          this.instances.set(type, new YouTubePlatform())
          break
        default:
          throw new Error(`Platform ${type} not implemented`)
      }
    }

    return this.instances.get(type)!
  }

  static async getPlatformUser(
    type: PlatformType,
    accessToken: string
  ) {
    const platform = this.getPlatform(type)
    return platform.getUser(accessToken)
  }

  static getAuthUrl(type: PlatformType): string {
    const platform = this.getPlatform(type)
    return platform.getAuthUrl()
  }

  static isImplemented(type: PlatformType): boolean {
    return ['Twitter', 'LinkedIn', 'Instagram', 'TikTok', 'YouTube', 'Bluesky'].includes(type)
  }
}