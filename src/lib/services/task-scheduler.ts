import cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { Scheduler } from './scheduler';
import { NotionSync } from './notion-sync';
import { PlatformError } from '../utils/errors';

interface Task {
  id: string;
  type: 'POST' | 'SYNC' | 'CLEANUP';
  schedule: string;
  data: Record<string, any>;
  lastRun?: Date;
  nextRun?: Date;
  enabled: boolean;
}

export class TaskScheduler {
  private tasks: Map<string, cron.ScheduledTask>;
  private scheduler: Scheduler;

  constructor() {
    this.tasks = new Map();
    this.scheduler = new Scheduler();
  }

  /**
   * Initialize and start all scheduled tasks
   */
  async initialize(): Promise<void> {
    try {
      // Schedule post processing task
      this.scheduleCronTask('process-posts', '*/5 * * * *', async () => {
        await this.processScheduledPosts();
      });

      // Schedule Notion sync task
      this.scheduleCronTask('notion-sync', '0 * * * *', async () => {
        await this.syncNotionContent();
      });

      // Schedule cleanup task
      this.scheduleCronTask('cleanup', '0 0 * * *', async () => {
        await this.cleanupOldRecords();
      });

      // Load user-specific tasks
      const userTasks = await prisma.scheduledTask.findMany({
        where: { enabled: true }
      });

      for (const task of userTasks) {
        this.scheduleUserTask(task);
      }
    } catch (error) {
      console.error('Failed to initialize task scheduler:', error);
      throw error;
    }
  }

  /**
   * Schedule a task with cron expression
   */
  private scheduleCronTask(
    name: string,
    schedule: string,
    handler: () => Promise<void>
  ): void {
    try {
      const task = cron.schedule(schedule, async () => {
        try {
          await handler();
        } catch (error) {
          console.error(`Task ${name} failed:`, error);
          await this.logTaskError(name, error);
        }
      });

      this.tasks.set(name, task);
    } catch (error) {
      console.error(`Failed to schedule task ${name}:`, error);
      throw error;
    }
  }

  /**
   * Schedule a user-specific task
   */
  private async scheduleUserTask(task: Task): Promise<void> {
    try {
      const handler = async () => {
        switch (task.type) {
          case 'POST':
            await this.handlePostTask(task);
            break;
          case 'SYNC':
            await this.handleSyncTask(task);
            break;
          default:
            throw new Error(`Unknown task type: ${task.type}`);
        }
      };

      this.scheduleCronTask(task.id, task.schedule, handler);

      // Update next run time
      await this.updateTaskNextRun(task.id);
    } catch (error) {
      console.error(`Failed to schedule user task ${task.id}:`, error);
      throw error;
    }
  }

  /**
   * Process scheduled posts that are due
   */
  private async processScheduledPosts(): Promise<void> {
    try {
      await this.scheduler.processDuePosts();
    } catch (error) {
      console.error('Failed to process scheduled posts:', error);
      throw error;
    }
  }

  /**
   * Sync Notion content for users with auto-sync enabled
   */
  private async syncNotionContent(): Promise<void> {
    try {
      const configs = await prisma.notionSyncConfig.findMany({
        where: {
          syncEnabled: true,
          autoSyncInterval: {
            gt: 0
          }
        },
        include: {
          notionCredential: true
        }
      });

      for (const config of configs) {
        try {
          const notionSync = new NotionSync(config.notionCredential.accessToken);
          await notionSync.syncFromNotion({
            userId: config.userId,
            notionDatabaseId: config.databaseId,
            templates: config.templates
          });
        } catch (error) {
          console.error(`Failed to sync Notion content for user ${config.userId}:`, error);
          await this.logTaskError(`notion-sync-${config.userId}`, error);
        }
      }
    } catch (error) {
      console.error('Failed to sync Notion content:', error);
      throw error;
    }
  }

  /**
   * Clean up old records and logs
   */
  private async cleanupOldRecords(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await prisma.$transaction([
        // Clean up old task logs
        prisma.taskLog.deleteMany({
          where: {
            createdAt: {
              lt: thirtyDaysAgo
            }
          }
        }),
        // Clean up old completed/failed posts
        prisma.scheduledPost.deleteMany({
          where: {
            status: {
              in: ['COMPLETED', 'FAILED']
            },
            updatedAt: {
              lt: thirtyDaysAgo
            }
          }
        })
      ]);
    } catch (error) {
      console.error('Failed to clean up old records:', error);
      throw error;
    }
  }

  /**
   * Handle post scheduling task
   */
  private async handlePostTask(task: Task): Promise<void> {
    try {
      await this.scheduler.schedulePost(task.data);
    } catch (error) {
      console.error(`Failed to handle post task ${task.id}:`, error);
      throw error;
    }
  }

  /**
   * Handle sync task
   */
  private async handleSyncTask(task: Task): Promise<void> {
    try {
      const { userId, direction } = task.data;
      const credentials = await prisma.notionCredential.findUnique({
        where: { userId }
      });

      if (!credentials) {
        throw new Error('Notion credentials not found');
      }

      const notionSync = new NotionSync(credentials.accessToken);
      if (direction === 'from-notion') {
        await notionSync.syncFromNotion(task.data);
      } else {
        await notionSync.syncToNotion(task.data);
      }
    } catch (error) {
      console.error(`Failed to handle sync task ${task.id}:`, error);
      throw error;
    }
  }

  /**
   * Log task error
   */
  private async logTaskError(taskId: string, error: Error): Promise<void> {
    try {
      await prisma.taskLog.create({
        data: {
          taskId,
          status: 'ERROR',
          message: error.message,
          stackTrace: error.stack
        }
      });
    } catch (logError) {
      console.error('Failed to log task error:', logError);
    }
  }

  /**
   * Update task's next run time
   */
  private async updateTaskNextRun(taskId: string): Promise<void> {
    try {
      const task = cron.getTiming(this.tasks.get(taskId).options.schedule);
      await prisma.scheduledTask.update({
        where: { id: taskId },
        data: {
          lastRun: new Date(),
          nextRun: new Date(task.next().getTime())
        }
      });
    } catch (error) {
      console.error(`Failed to update task next run ${taskId}:`, error);
    }
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    for (const task of this.tasks.values()) {
      task.stop();
    }
    this.tasks.clear();
  }
}