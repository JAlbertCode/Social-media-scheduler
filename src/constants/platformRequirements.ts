export const PLATFORM_REQUIREMENTS = {
  TWITTER: {
    image: {
      minWidth: 600,
      maxWidth: 4096,
      minHeight: 335,
      maxHeight: 4096,
      aspectRatio: undefined, // flexible
      maxSize: 5 * 1024 * 1024, // 5MB
      formats: ['.jpg', '.jpeg', '.png', '.gif']
    },
    video: {
      minDuration: 0,
      maxDuration: 140, // seconds
      maxSize: 512 * 1024 * 1024, // 512MB
      formats: ['.mp4', '.mov']
    }
  },
  INSTAGRAM: {
    image: {
      feed: {
        aspectRatio: 1, // 1:1 square
        minWidth: 1080,
        minHeight: 1080,
        formats: ['.jpg', '.jpeg', '.png']
      },
      story: {
        aspectRatio: 9/16, // vertical
        minWidth: 1080,
        minHeight: 1920,
        formats: ['.jpg', '.jpeg', '.png']
      }
    },
    video: {
      feed: {
        minDuration: 3,
        maxDuration: 60,
        aspectRatio: 1,
        formats: ['.mp4']
      },
      reels: {
        minDuration: 3,
        maxDuration: 90,
        aspectRatio: 9/16,
        formats: ['.mp4']
      }
    }
  },
  TIKTOK: {
    video: {
      minDuration: 3,
      maxDuration: 180, // 3 minutes
      aspectRatio: 9/16,
      minWidth: 1080,
      minHeight: 1920,
      formats: ['.mp4', '.mov']
    }
  },
  LINKEDIN: {
    image: {
      maxWidth: 1200,
      maxHeight: 1200,
      maxSize: 5 * 1024 * 1024, // 5MB
      formats: ['.jpg', '.jpeg', '.png', '.gif']
    },
    video: {
      maxDuration: 600, // 10 minutes
      maxSize: 5 * 1024 * 1024 * 1024, // 5GB
      formats: ['.mp4']
    }
  },
  YOUTUBE_SHORTS: {
    video: {
      maxDuration: 60,
      aspectRatio: 9/16,
      minWidth: 1080,
      minHeight: 1920,
      formats: ['.mp4', '.mov']
    }
  }
} as const;

export type PlatformType = keyof typeof PLATFORM_REQUIREMENTS;
export type MediaType = 'image' | 'video';
export type ContentType = 'feed' | 'story' | 'reels';