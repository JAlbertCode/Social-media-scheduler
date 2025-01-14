import { NextRequest, NextResponse } from 'next/server';
import { MediaProcessor } from '@/lib/services/media-processor';
import { PlatformError } from '@/lib/utils/errors';

const mediaProcessor = new MediaProcessor();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const platform = formData.get('platform') as string;
    const type = formData.get('type') as string;
    const mediaType = formData.get('mediaType') as 'image' | 'video';

    if (!file || !platform || !type || !mediaType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let processedFile;
    const buffer = await file.arrayBuffer();

    if (mediaType === 'image') {
      processedFile = await mediaProcessor.processImage(
        Buffer.from(buffer),
        platform,
        type
      );

      // Return processed image
      return new NextResponse(processedFile, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Disposition': `attachment; filename="processed_${file.name}"`
        }
      });
    } else {
      // For videos, we'll need to handle file saving differently
      // This is a simplified version - in production you'd want to use cloud storage
      const tempPath = `/tmp/${file.name}`;
      require('fs').writeFileSync(tempPath, Buffer.from(buffer));

      const processedPath = await mediaProcessor.processVideo(
        tempPath,
        platform,
        type
      );

      const processedBuffer = require('fs').readFileSync(processedPath);
      
      // Cleanup temp files
      require('fs').unlinkSync(tempPath);
      require('fs').unlinkSync(processedPath);

      return new NextResponse(processedBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `attachment; filename="processed_${file.name}"`
        }
      });
    }
  } catch (error) {
    console.error('Media processing error:', error);

    if (error instanceof PlatformError) {
      return NextResponse.json(
        { error: error.message, code: error.code, context: error.context },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Media processing failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Return supported platforms and their media specifications
  return NextResponse.json({
    platforms: {
      INSTAGRAM: {
        image: {
          feed: { width: 1080, height: 1080, maxAspectRatio: 1.91, minAspectRatio: 0.8 },
          story: { width: 1080, height: 1920 },
          carousel: { width: 1080, height: 1080 }
        },
        video: {
          feed: { maxDuration: 60, format: 'mp4', maxSize: 4096 },
          story: { maxDuration: 15, format: 'mp4', maxSize: 4096 },
          reels: { maxDuration: 90, format: 'mp4', maxSize: 4096 }
        }
      },
      TWITTER: {
        image: {
          inline: { width: 1200, height: 675 },
          card: { width: 800, height: 418 }
        },
        video: {
          tweet: { maxDuration: 140, format: 'mp4', maxSize: 512 }
        }
      },
      LINKEDIN: {
        image: {
          share: { width: 1200, height: 627 },
          company: { width: 1128, height: 376 }
        },
        video: {
          post: { maxDuration: 600, format: 'mp4', maxSize: 5120 }
        }
      }
    }
  });
}