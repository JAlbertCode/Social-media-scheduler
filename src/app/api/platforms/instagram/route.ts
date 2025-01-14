import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InstagramClient } from '@/lib/platforms/instagram';

export async function POST(req: NextRequest) {
  try {
    const { action, mediaId, caption, scheduledTime } = await req.json();
    
    // Get user's Instagram credentials from database
    const credentials = await prisma.platformCredential.findFirst({
      where: { 
        platform: 'INSTAGRAM',
        // Add user context when auth is implemented
      }
    });

    if (!credentials) {
      return NextResponse.json({ error: 'Instagram credentials not found' }, { status: 404 });
    }

    const client = new InstagramClient(credentials.accessToken);

    switch (action) {
      case 'post':
        const result = await client.createPost({
          mediaId,
          caption,
          scheduledTime: new Date(scheduledTime)
        });
        return NextResponse.json(result);

      case 'schedule':
        const scheduled = await prisma.scheduledPost.create({
          data: {
            platform: 'INSTAGRAM',
            mediaId,
            caption,
            scheduledTime: new Date(scheduledTime),
            // Add user reference when auth is implemented
          }
        });
        return NextResponse.json(scheduled);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Instagram API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');
    
    const credentials = await prisma.platformCredential.findFirst({
      where: { 
        platform: 'INSTAGRAM',
        // Add user context when auth is implemented
      }
    });

    if (!credentials) {
      return NextResponse.json({ error: 'Instagram credentials not found' }, { status: 404 });
    }

    const client = new InstagramClient(credentials.accessToken);

    switch (action) {
      case 'account':
        const account = await client.getAccountInfo();
        return NextResponse.json(account);

      case 'media':
        const media = await client.getMediaList();
        return NextResponse.json(media);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Instagram API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}