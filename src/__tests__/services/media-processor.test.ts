import { MediaProcessor } from '@/lib/services/media-processor';
import { PlatformError } from '@/lib/utils/errors';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';

// Mock sharp and ffmpeg
jest.mock('sharp');
jest.mock('fluent-ffmpeg');

describe('MediaProcessor', () => {
  let mediaProcessor: MediaProcessor;

  beforeEach(() => {
    mediaProcessor = new MediaProcessor();
    jest.clearAllMocks();
  });

  describe('processImage', () => {
    it('should process image according to platform specs', async () => {
      const inputBuffer = Buffer.from('test-image');
      const platform = 'INSTAGRAM';
      const type = 'feed';

      // Mock sharp operations
      const mockSharp = {
        metadata: jest.fn().mockResolvedValue({
          width: 1200,
          height: 1200,
          format: 'jpeg'
        }),
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed-image'))
      };

      (sharp as jest.Mock).mockReturnValue(mockSharp);

      const result = await mediaProcessor.processImage(inputBuffer, platform, type);

      expect(sharp).toHaveBeenCalledWith(inputBuffer);
      expect(mockSharp.resize).toHaveBeenCalledWith(1080, 1080, expect.any(Object));
      expect(mockSharp.jpeg).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should throw error for unsupported image type', async () => {
      const inputBuffer = Buffer.from('test-image');
      const platform = 'INSTAGRAM';
      const type = 'unsupported';

      await expect(mediaProcessor.processImage(inputBuffer, platform, type))
        .rejects
        .toThrow(PlatformError);
    });

    it('should handle processing errors', async () => {
      const inputBuffer = Buffer.from('test-image');
      const platform = 'INSTAGRAM';
      const type = 'feed';

      (sharp as jest.Mock).mockImplementation(() => {
        throw new Error('Processing failed');
      });

      await expect(mediaProcessor.processImage(inputBuffer, platform, type))
        .rejects
        .toThrow(PlatformError);
    });
  });

  describe('processVideo', () => {
    it('should process video according to platform specs', async () => {
      const inputPath = 'input.mp4';
      const platform = 'INSTAGRAM';
      const type = 'feed';

      // Mock ffmpeg operations
      const mockFfmpeg = {
        ffprobe: jest.fn().mockImplementation((path, callback) => {
          callback(null, {
            streams: [
              {
                codec_type: 'video',
                width: 1920,
                height: 1080
              }
            ],
            format: {
              duration: 30,
              format_name: 'mp4',
              bit_rate: '2000000'
            }
          });
        }),
        videoCodec: jest.fn().mockReturnThis(),
        audioCodec: jest.fn().mockReturnThis(),
        size: jest.fn().mockReturnThis(),
        videoBitrate: jest.fn().mockReturnThis(),
        audioBitrate: jest.fn().mockReturnThis(),
        fps: jest.fn().mockReturnThis(),
        format: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        save: jest.fn().mockImplementation(function(outputPath) {
          // Simulate successful processing
          const handlers = this.on.mock.calls.reduce((acc, [event, handler]) => {
            acc[event] = handler;
            return acc;
          }, {});
          handlers.end();
        })
      };

      (ffmpeg as unknown as jest.Mock).mockReturnValue(mockFfmpeg);

      const result = await mediaProcessor.processVideo(inputPath, platform, type);

      expect(ffmpeg).toHaveBeenCalledWith(inputPath);
      expect(mockFfmpeg.videoCodec).toHaveBeenCalledWith('libx264');
      expect(mockFfmpeg.size).toHaveBeenCalledWith('?x720');
      expect(result).toMatch(/processed\.mp4$/);
    });

    it('should throw error for videos exceeding duration limit', async () => {
      const inputPath = 'input.mp4';
      const platform = 'INSTAGRAM';
      const type = 'feed';

      // Mock ffmpeg to return a long duration
      (ffmpeg as unknown as jest.Mock).mockReturnValue({
        ffprobe: jest.fn().mockImplementation((path, callback) => {
          callback(null, {
            streams: [
              {
                codec_type: 'video',
                width: 1920,
                height: 1080
              }
            ],
            format: {
              duration: 120, // 2 minutes (exceeds Instagram feed limit)
              format_name: 'mp4',
              bit_rate: '2000000'
            }
          });
        })
      });

      await expect(mediaProcessor.processVideo(inputPath, platform, type))
        .rejects
        .toThrow(PlatformError);
    });

    it('should handle ffmpeg errors', async () => {
      const inputPath = 'input.mp4';
      const platform = 'INSTAGRAM';
      const type = 'feed';

      // Mock ffmpeg to simulate an error
      const mockFfmpeg = {
        ffprobe: jest.fn().mockImplementation((path, callback) => {
          callback(new Error('FFmpeg error'), null);
        })
      };

      (ffmpeg as unknown as jest.Mock).mockReturnValue(mockFfmpeg);

      await expect(mediaProcessor.processVideo(inputPath, platform, type))
        .rejects
        .toThrow(PlatformError);
    });

    it('should handle processing errors', async () => {
      const inputPath = 'input.mp4';
      const platform = 'INSTAGRAM';
      const type = 'feed';

      // Mock ffmpeg with valid metadata but failed processing
      const mockFfmpeg = {
        ffprobe: jest.fn().mockImplementation((path, callback) => {
          callback(null, {
            streams: [{ codec_type: 'video', width: 1920, height: 1080 }],
            format: { duration: 30, format_name: 'mp4', bit_rate: '2000000' }
          });
        }),
        videoCodec: jest.fn().mockReturnThis(),
        audioCodec: jest.fn().mockReturnThis(),
        size: jest.fn().mockReturnThis(),
        videoBitrate: jest.fn().mockReturnThis(),
        audioBitrate: jest.fn().mockReturnThis(),
        fps: jest.fn().mockReturnThis(),
        format: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        save: jest.fn().mockImplementation(function(outputPath) {
          const handlers = this.on.mock.calls.reduce((acc, [event, handler]) => {
            acc[event] = handler;
            return acc;
          }, {});
          handlers.error(new Error('Processing failed'));
        })
      };

      (ffmpeg as unknown as jest.Mock).mockReturnValue(mockFfmpeg);

      await expect(mediaProcessor.processVideo(inputPath, platform, type))
        .rejects
        .toThrow(PlatformError);
    });
  });
});