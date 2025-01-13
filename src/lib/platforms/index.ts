import { PlatformType } from '@/components/PostCreator'
import { TwitterPlatform } from './twitter'
import { SocialPlatform } from './types'

export class PlatformFactory {
  private static instances: Map<PlatformType, SocialPlatform> = new Map()

  static getPlatform(type: PlatformType): SocialPlatform {
    if (!this.instances.has(type)) {
      switch (type) {
        case 'Twitter':
          this.instances.set(type, new TwitterPlatform())
          break
        // Add other platforms here as they're implemented
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
}