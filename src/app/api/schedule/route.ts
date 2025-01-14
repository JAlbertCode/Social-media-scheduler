import { NextRequest, NextResponse } from 'next/server';
import { Scheduler } from '@/lib/services/scheduler';
import { PlatformError } from '@/lib/utils/errors';

const scheduler = new Scheduler();

export async function POST(req: NextRequest) {
  try {
    const { userId, platform, content, mediaUrls, scheduledTime } = await req.json();

    // Validate required fields
    if (!userId || !platform || !content || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const scheduledPost = await scheduler.schedulePost({
      userId,
      platform,
      content,
      mediaUrls,
      scheduledTime: new Date(scheduledTime)
    });

    return NextResponse.json(scheduledPost);
  } catch (error) {
    console.error('Scheduling error:', error);

    if (error instanceof PlatformError) {
      return NextResponse.json(
        { error: error.message, code: error.code, context: error.context },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to schedule post' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const schedule = await scheduler.getUserSchedule(userId);
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Schedule retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve schedule' },
      { status: 500 }
    );
  }
}