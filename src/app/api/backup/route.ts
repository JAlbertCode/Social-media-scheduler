import { NextRequest, NextResponse } from 'next/server';
import { BackupService } from '@/lib/services/backup';
import { Logger } from '@/lib/services/logger';
import { withErrorHandler } from '@/lib/middleware/error-handler';

const logger = Logger.getInstance();

// Initialize backup service with configuration
const backupService = new BackupService({
  storage: {
    bucket: process.env.BACKUP_STORAGE_BUCKET || 'social-media-scheduler-backups',
    path: process.env.BACKUP_STORAGE_PATH || 'backups'
  },
  database: {
    url: process.env.DATABASE_URL || '',
    backupPath: process.env.BACKUP_DB_PATH || '/tmp/backups/db'
  },
  files: {
    paths: [
      process.env.UPLOAD_DIR || '/uploads',
      process.env.LOG_DIR || '/logs'
    ],
    backupPath: process.env.BACKUP_FILES_PATH || '/tmp/backups/files'
  },
  retention: {
    days: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    minBackups: parseInt(process.env.BACKUP_MIN_COUNT || '5')
  }
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  // Check admin authentication
  const authHeader = req.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Start backup process
    await backupService.runBackup();
    
    return NextResponse.json({
      message: 'Backup started successfully'
    });
  } catch (error) {
    logger.error({
      message: 'Failed to start backup',
      category: 'system',
      error
    });

    throw error;
  }
});

export const GET = withErrorHandler(async (req: NextRequest) => {
  // Check admin authentication
  const authHeader = req.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    const backups = await backupService.listBackups(limit);
    
    return NextResponse.json({
      backups
    });
  } catch (error) {
    logger.error({
      message: 'Failed to list backups',
      category: 'system',
      error
    });

    throw error;
  }
});