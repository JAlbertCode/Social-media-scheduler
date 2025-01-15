import { Scheduler } from '@/lib/services/scheduler';
import { prismaMock } from '../../../jest.setup';
import { PlatformError } from '@/lib/utils/errors';

describe('Scheduler', () => {
  let scheduler: Scheduler;

  beforeEach(() => {
    scheduler = new Scheduler();
  });

  describe('schedulePost', () => {
    it('should create a scheduled post', async () => {
      const postData = {
        userId: 'user123',
        platform: 'TWITTER',
        content: 'Test post',
        scheduledTime: new Date(Date.now() + 3600000) // 1 hour from now
      };

      const expectedPost = {
        id: 'post123',
        ...postData,
        status: 'PENDING'
      };

      prismaMock.scheduledPost.create.mockResolvedValue(expectedPost);

      const result = await scheduler.schedulePost(postData);

      expect(result).toEqual(expectedPost);
      expect(prismaMock.scheduledPost.create).toHaveBeenCalledWith({
        data: {
          userId: postData.userId,
          platform: postData.platform,
          content: postData.content,
          scheduledTime: postData.scheduledTime,
          status: 'PENDING'
        }
      });
    });

    it('should reject scheduling in the past', async () => {
      const postData = {
        userId: 'user123',
        platform: 'TWITTER',
        content: 'Test post',
        scheduledTime: new Date(Date.now() - 3600000) // 1 hour ago
      };

      await expect(scheduler.schedulePost(postData))
        .rejects
        .toThrow(PlatformError);
    });
  });

  describe('processDuePosts', () => {
    it('should process due posts', async () => {
      const duePosts = [
        {
          id: 'post1',
          userId: 'user123',
          platform: 'TWITTER',
          content: 'Test post 1',
          status: 'PENDING',
          scheduledTime: new Date()
        },
        {
          id: 'post2',
          userId: 'user123',
          platform: 'INSTAGRAM',
          content: 'Test post 2',
          status: 'PENDING',
          scheduledTime: new Date()
        }
      ];

      prismaMock.scheduledPost.findMany.mockResolvedValue(duePosts);
      prismaMock.platformCredential.findFirst.mockResolvedValue({
        userId: 'user123',
        platform: 'TWITTER',
        accessToken: 'token123'
      });

      await scheduler.processDuePosts();

      expect(prismaMock.scheduledPost.findMany).toHaveBeenCalledWith({
        where: {
          status: 'PENDING',
          scheduledTime: {
            lte: expect.any(Date)
          }
        }
      });

      expect(prismaMock.scheduledPost.update).toHaveBeenCalledTimes(duePosts.length);
    });

    it('should handle failed posts correctly', async () => {
      const duePost = {
        id: 'post1',
        userId: 'user123',
        platform: 'TWITTER',
        content: 'Test post',
        status: 'PENDING',
        scheduledTime: new Date()
      };

      prismaMock.scheduledPost.findMany.mockResolvedValue([duePost]);
      prismaMock.platformCredential.findFirst.mockResolvedValue(null); // Simulate missing credentials

      await scheduler.processDuePosts();

      expect(prismaMock.scheduledPost.update).toHaveBeenCalledWith({
        where: { id: duePost.id },
        data: {
          status: 'FAILED',
          error: expect.any(String)
        }
      });
    });
  });

  describe('getUserSchedule', () => {
    it('should return user\'s scheduled posts', async () => {
      const userId = 'user123';
      const scheduledPosts = [
        {
          id: 'post1',
          userId,
          platform: 'TWITTER',
          content: 'Test post 1',
          status: 'PENDING',
          scheduledTime: new Date()
        }
      ];

      prismaMock.scheduledPost.findMany.mockResolvedValue(scheduledPosts);

      const result = await scheduler.getUserSchedule(userId);

      expect(result).toEqual(scheduledPosts);
      expect(prismaMock.scheduledPost.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          status: {
            in: ['PENDING', 'PROCESSING']
          }
        },
        orderBy: {
          scheduledTime: 'asc'
        }
      });
    });
  });

  describe('updateScheduledPost', () => {
    it('should update a scheduled post', async () => {
      const postId = 'post123';
      const updates = {
        content: 'Updated content',
        scheduledTime: new Date(Date.now() + 7200000) // 2 hours from now
      };

      const existingPost = {
        id: postId,
        userId: 'user123',
        platform: 'TWITTER',
        content: 'Original content',
        status: 'PENDING',
        scheduledTime: new Date(Date.now() + 3600000)
      };

      prismaMock.scheduledPost.findUnique.mockResolvedValue(existingPost);
      prismaMock.scheduledPost.update.mockResolvedValue({
        ...existingPost,
        ...updates
      });

      const result = await scheduler.updateScheduledPost(postId, updates);

      expect(result).toEqual({
        ...existingPost,
        ...updates
      });
      expect(prismaMock.scheduledPost.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: updates
      });
    });

    it('should reject invalid updates', async () => {
      const postId = 'post123';
      const updates = {
        scheduledTime: new Date(Date.now() - 3600000) // 1 hour ago
      };

      const existingPost = {
        id: postId,
        userId: 'user123',
        platform: 'TWITTER',
        content: 'Original content',
        status: 'PENDING',
        scheduledTime: new Date(Date.now() + 3600000)
      };

      prismaMock.scheduledPost.findUnique.mockResolvedValue(existingPost);

      await expect(scheduler.updateScheduledPost(postId, updates))
        .rejects
        .toThrow(PlatformError);
    });

    it('should reject non-existent post', async () => {
      const postId = 'nonexistent';
      const updates = {
        content: 'Updated content'
      };

      prismaMock.scheduledPost.findUnique.mockResolvedValue(null);

      await expect(scheduler.updateScheduledPost(postId, updates))
        .rejects
        .toThrow(PlatformError);
    });
  });

  describe('deleteScheduledPost', () => {
    it('should delete a scheduled post', async () => {
      const postId = 'post123';

      await scheduler.deleteScheduledPost(postId);

      expect(prismaMock.scheduledPost.delete).toHaveBeenCalledWith({
        where: { id: postId }
      });
    });
  });
});