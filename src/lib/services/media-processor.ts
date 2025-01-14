import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { PlatformError } from '../utils/errors';

interface MediaDimensions {
  width: number;
  height: number;
}

interface VideoMetadata extends MediaDimensions {
  duration: number;
  format: string;
  bitrate: number;
}

interface ImageMetadata extends MediaDimensions {
  format: string;
  aspectRatio: number;
}

const PLATFORM_IMAGE_SPECS = {
  INSTAGRAM: {
    feed: { width: 1080, height: 1080, maxAspectRatio: 1.91, minAspectRatio: 0.8 },
    story: { width: 1080, height: 1920 },
    carousel: { width: 1080, height: 1080 }
  },
  TWITTER: {
    inline: { width: 1200, height: 675 },
    card: { width: 800, height: 418 }
  },
  LINKEDIN: {
    share: { width: 1200, height: 627 },
    company: { width: 1128, height: 376 }
  }
};

const PLATFORM_VIDEO_SPECS = {
  INSTAGRAM: {
    feed: { maxDuration: 60, format: 'mp4', maxSize: 4096 },
    story: { maxDuration: 15, format: 'mp4', maxSize: 4096 },
    reels: { maxDuration: 90, format: 'mp4', maxSize: 4096 }
  },
  TWITTER: {
    tweet: { maxDuration: 140, format: 'mp4', maxSize: 512 }
  },
  LINKEDIN: {
    post: { maxDuration: 600, format: 'mp4', maxSize: 5120 }
  }
};

export class MediaProcessor {
  /**
   * Process an image for a specific platform and post type
   */
  async processImage(
    input: Buffer,
    platform: keyof typeof PLATFORM_IMAGE_SPECS,
    type: string
  ): Promise<Buffer> {
    try {
      const metadata = await this.getImageMetadata(input);
      const specs = PLATFORM_IMAGE_SPECS[platform][type];

      if (!specs) {
        throw new PlatformError(
          'VALIDATION_ERROR',
          `Unsupported image type '${type}' for platform '${platform}'`
        );
      }

      let processedImage = sharp(input);

      // Resize and maintain aspect ratio within platform limits
      processedImage = processedImage.resize(specs.width, specs.height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      });

      // Convert to appropriate format
      processedImage = processedImage.jpeg({ quality: 85 });

      return processedImage.toBuffer();
    } catch (error) {
      throw new PlatformError(
        'PLATFORM_ERROR',
        `Image processing failed: ${error.message}`,
        { platform, type }
      );
    }
  }

  /**
   * Process a video for a specific platform and post type
   */
  async processVideo(
    input: string,
    platform: keyof typeof PLATFORM_VIDEO_SPECS,
    type: string
  ): Promise<string> {
    try {
      const metadata = await this.getVideoMetadata(input);
      const specs = PLATFORM_VIDEO_SPECS[platform][type];

      if (!specs) {
        throw new PlatformError(
          'VALIDATION_ERROR',
          `Unsupported video type '${type}' for platform '${platform}'`
        );
      }

      // Validate duration
      if (metadata.duration > specs.maxDuration) {
        throw new PlatformError(
          'VALIDATION_ERROR',
          `Video duration exceeds platform limit of ${specs.maxDuration} seconds`,
          { platform, type, duration: metadata.duration }
        );
      }

      // Process video using ffmpeg
      return new Promise((resolve, reject) => {
        const outputPath = input.replace(/\.[^/.]+$/, '') + '_processed.mp4';
        
        ffmpeg(input)
          .videoCodec('libx264')
          .audioCodec('aac')
          .size('?x720') // 720p height, maintain aspect ratio
          .videoBitrate('2000k')
          .audioBitrate('128k')
          .fps(30)
          .format(specs.format)
          .on('end', () => resolve(outputPath))
          .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
          .save(outputPath);
      });
    } catch (error) {
      throw new PlatformError(
        'PLATFORM_ERROR',
        `Video processing failed: ${error.message}`,
        { platform, type }
      );
    }
  }

  /**
   * Get metadata for an image
   */
  private async getImageMetadata(input: Buffer): Promise<ImageMetadata> {
    const metadata = await sharp(input).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      aspectRatio: metadata.width / metadata.height
    };
  }

  /**
   * Get metadata for a video
   */
  private async getVideoMetadata(input: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(input, (err, metadata) => {
        if (err) return reject(err);
        
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        
        resolve({
          width: videoStream.width,
          height: videoStream.height,
          duration: metadata.format.duration,
          format: metadata.format.format_name,
          bitrate: metadata.format.bit_rate
        });
      });
    });
  }
}