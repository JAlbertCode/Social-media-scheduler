import { PlatformType } from '../types/platforms'
import { countMentions } from './mentionSuggestions'
import { validateHashtags } from './hashtagSuggestions'

interface MediaFile {
  file: File
  preview: string
  type: 'image' | 'video'
}

export function validateContent(
  text: string,
  platforms: PlatformType[],
  mediaFiles: MediaFile[] = []
): string | null {
  // Don't perform validation for content-free posts (e.g., image-only posts)
  if (!text && mediaFiles.length > 0) {
    return null
  }

  // Check platform-specific limits
  for (const platform of platforms) {
    // Mention validation
    const mentionResult = countMentions(text, platform)
    if (!mentionResult.valid) {
      return mentionResult.message
    }

    // Hashtag validation
    const hashtagResult = validateHashtags(
      (text.match(/#\w+/g) || []),
      platform
    )
    if (!hashtagResult.valid) {
      return hashtagResult.message
    }
  }

  // All validations passed
  return null
}