import { PlatformType } from '../components/PostCreator'

interface LinkPreview {
  url: string
  title?: string
  description?: string
  image?: string
  domain: string
}

// Platform-specific link rules
const PLATFORM_LINK_RULES = {
  Twitter: {
    linkLength: 23, // Twitter t.co links are always 23 characters
    maxLinks: 5,
    showPreview: true
  },
  LinkedIn: {
    linkLength: -1, // Actual length of URL
    maxLinks: 3,
    showPreview: true
  },
  Instagram: {
    linkLength: -1,
    maxLinks: 1,
    showPreview: false // Instagram doesn't show link previews in posts
  }
} as const

// Helper function to find URLs in text
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.match(urlRegex) || []
}

// Validate links for platform-specific rules
export function validateLinks(
  urls: string[],
  platform: PlatformType
): { valid: boolean; message?: string } {
  const rules = PLATFORM_LINK_RULES[platform]

  if (urls.length > rules.maxLinks) {
    return {
      valid: false,
      message: `${platform} allows maximum ${rules.maxLinks} links per post`
    }
  }

  return { valid: true }
}

// Calculate adjusted content length considering platform-specific link handling
export function calculateContentLength(
  content: string,
  platform: PlatformType
): number {
  const urls = extractUrls(content)
  const rules = PLATFORM_LINK_RULES[platform]

  let length = content.length

  // Adjust for platform-specific link lengths
  urls.forEach(url => {
    if (rules.linkLength > 0) {
      // Replace URL length with platform-specific length
      length = length - url.length + rules.linkLength
    }
  })

  return length
}

// Mock function to get link preview data
// In a real app, this would make an API call to a link preview service
export async function getLinkPreview(url: string): Promise<LinkPreview> {
  // For demo purposes, generate a preview based on the URL
  const domain = new URL(url).hostname

  return {
    url,
    title: `Title from ${domain}`,
    description: 'This is a sample description for the link preview...',
    image: 'https://via.placeholder.com/300x200',
    domain
  }
}

// Check if platform supports link previews
export function supportsLinkPreview(platform: PlatformType): boolean {
  return PLATFORM_LINK_RULES[platform].showPreview
}

// Format URL for display (e.g., remove http/https, trailing slashes)
export function formatUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
}

// Get character count impact of adding a link
export function getLinkCharacterImpact(
  url: string,
  platform: PlatformType
): number {
  const rules = PLATFORM_LINK_RULES[platform]
  return rules.linkLength > 0 ? rules.linkLength : url.length
}