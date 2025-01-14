import { NextRequest, NextResponse } from 'next/server';
import { Scheduler } from '@/lib/services/scheduler';
import { PlatformError } from '@/lib/utils/errors';

const scheduler = new Scheduler();

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await req.json();
    const updatedPost = await scheduler.updateScheduledPost(params.id, updates);
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Update error:', error);

    if (error instanceof PlatformError) {
      return NextResponse.json(
        { error: error.message, code: error.code, context: error.context },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update scheduled post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await scheduler.deleteScheduledPost(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete scheduled post' },
      { status: 500 }
    );
  }
}