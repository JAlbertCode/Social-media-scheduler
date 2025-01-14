import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LinkedInClient } from '@/lib/platforms/linkedin';

export async function POST(req: NextRequest) {
  try {
    const { action, text, mediaUrl, mediaType, visibility, scheduledTime } = await req.json();
    
    const credentials = await prisma.platformCredential.findFirst({
      where: { 
        platform: 'LINKEDIN',
        // Add user context when auth is implemented
      }
    });

    if (!credentials) {
      return NextResponse.json({ error: 'LinkedIn credentials not found' }, { status: 404 });
    }

    const client = new LinkedInClient(credentials.accessToken);

    switch (action) {
      case 'post':
        let result;
        if (mediaUrl) {
          result = await client.createMediaPost(text, mediaUrl, mediaType, visibility);
        } else {
          result = await client.createTextPost(text, visibility);
        }
        return NextResponse.json(result);

      case 'schedule':
        // Create the post object but don't publish
        let post;
        if (mediaUrl) {
          post = await client.createMediaPost(text, mediaUrl, mediaType, visibility);
        } else {
          post = await client.createTextPost(text, visibility);
        }
        
        // Schedule it
        const scheduled = await prisma.scheduledPost.create({
          data: {
            platform: 'LINKEDIN',
            content: JSON.stringify(post),
            scheduledTime: new Date(scheduledTime),
            // Add user reference when auth is implemented
          }
        });
        return NextResponse.json(scheduled);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('LinkedIn API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get('action');
    
    const credentials = await prisma.platformCredential.findFirst({
      where: { 
        platform: 'LINKEDIN',
        // Add user context when auth is implemented
      }
    });

    if (!credentials) {
      return NextResponse.json({ error: 'LinkedIn credentials not found' }, { status: 404 });
    }

    const client = new LinkedInClient(credentials.accessToken);

    switch (action) {
      case 'profile':
        const profile = await client.getProfile();
        return NextResponse.json(profile);

      case 'pages':
        const pages = await client.getCompanyPages();
        return NextResponse.json(pages);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('LinkedIn API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}