import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TaskScheduler } from '@/lib/services/task-scheduler';
import cron from 'node-cron';

// Singleton instance of TaskScheduler
let taskScheduler: TaskScheduler | null = null;

export async function POST(req: NextRequest) {
  try {
    const { userId, type, schedule, data, enabled = true } = await req.json();

    // Validate required fields
    if (!userId || !type || !schedule) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Validate cron expression
    if (!cron.validate(schedule)) {
      return NextResponse.json(
        { error: 'Invalid cron schedule' },
        { status: 400 }
      );
    }

    // Create new task
    const task = await prisma.scheduledTask.create({
      data: {
        userId,
        type,
        schedule,
        data,
        enabled,
        nextRun: cron.getTiming(schedule).next().toDate()
      }
    });

    // Schedule the task if enabled
    if (enabled) {
      if (!taskScheduler) {
        taskScheduler = new TaskScheduler();
        await taskScheduler.initialize();
      }
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get tasks with optional type filter
    const tasks = await prisma.scheduledTask.findMany({
      where: {
        userId,
        ...(type && { type })
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get recent task logs
    const taskIds = tasks.map(task => task.id);
    const logs = await prisma.taskLog.findMany({
      where: {
        taskId: {
          in: taskIds
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });

    return NextResponse.json({
      tasks,
      logs
    });
  } catch (error) {
    console.error('Task retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tasks' },
      { status: 500 }
    );
  }
}