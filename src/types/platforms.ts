export type PlatformType = 'Twitter' | 'LinkedIn' | 'Instagram' | 'TikTok' | 'YouTube' | 'Bluesky' | 'Threads' | 'Warpcast'

export const PLATFORM_LIMITS: Record<PlatformType, { characterLimit: number; mediaLimit: number }> = {
  Twitter: {
    characterLimit: 280,
    mediaLimit: 4,
  },
  LinkedIn: {
    characterLimit: 3000,
    mediaLimit: 9,
  },
  Instagram: {
    characterLimit: 2200,
    mediaLimit: 10,
  },
  TikTok: {
    characterLimit: 2200,
    mediaLimit: 1,
  },
  YouTube: {
    characterLimit: 1000,
    mediaLimit: 1,
  },
  Bluesky: {
    characterLimit: 300,
    mediaLimit: 4,
  },
  Threads: {
    characterLimit: 500,
    mediaLimit: 10,
  },
  Warpcast: {
    characterLimit: 320,
    mediaLimit: 4,
  }
}

export const PLATFORM_CONFIG = {
  Twitter: { 
    icon: 'FaTwitter', 
    color: '#1DA1F2',  // Twitter blue
  },
  LinkedIn: { 
    icon: 'FaLinkedin', 
    color: '#0A66C2',  // LinkedIn blue
  },
  Instagram: { 
    icon: 'FaInstagram', 
    color: '#E4405F',  // Instagram pink
  },
  TikTok: { 
    icon: 'FaTiktok', 
    color: '#000000',  // TikTok black
  },
  YouTube: { 
    icon: 'FaYoutube', 
    color: '#FF0000',  // YouTube red
  },
  Bluesky: { 
    icon: 'SiBluesky', 
    color: '#0560FF',  // Bluesky blue
  },
  Threads: {
    icon: 'FaThreads',
    color: '#000000',  // Threads black
  },
  Warpcast: {
    icon: 'FaFire',
    color: '#4A148C',  // Warpcast purple
  }
} as const