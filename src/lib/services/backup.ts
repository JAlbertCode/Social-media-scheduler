import { prisma } from '@/lib/prisma';
import { Logger } from './logger';
import { Storage } from '@google-cloud/storage';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createReadStream, createWriteStream } from 'fs';
import { join } from 'path';
import { createGzip } from 'zlib';
import archiver from 'archiver';

const execAsync = promisify(exec);
const logger = Logger.getInstance();

interface BackupConfig {
  storage: {
    bucket: string;
    path: string;
  };
  database: {
    url: string;
    backupPath: string;
  };
  files: {
    paths: string[];
    backupPath: string;
  };
  retention: {
    days: number;
    minBackups: number;
  };
}

export class BackupService {
  private storage: Storage;
  private config: BackupConfig;

  constructor(config: BackupConfig) {
    this.config = config;
    this.storage = new Storage();
  }

  /**
   * Run full backup
   */
  async runBackup(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup-${timestamp}`;

    try {
      logger.info({
        message: 'Starting backup process',
        category: 'system',
        metadata: { backupId }
      });

      // Create backup record
      const backup = await prisma.backup.create({
        data: {
          id: backupId,
          status: 'IN_PROGRESS',
          type: 'FULL',
          startTime: new Date()
        }
      });

      // Run database backup
      const dbBackupPath = await this.backupDatabase(backupId);

      // Run file backup
      const fileBackupPath = await this.backupFiles(backupId);

      // Create manifest
      const manifest = await this.createManifest(backupId, {
        database: dbBackupPath,
        files: fileBackupPath
      });

      // Upload to cloud storage
      await this.uploadToCloud(backupId, [
        dbBackupPath,
        fileBackupPath,
        manifest
      ]);

      // Verify backup
      const verified = await this.verifyBackup(backupId);

      // Update backup record
      await prisma.backup.update({
        where: { id: backupId },
        data: {
          status: verified ? 'COMPLETED' : 'VERIFICATION_FAILED',
          endTime: new Date(),
          size: await this.getBackupSize(backupId),
          manifest
        }
      });

      // Cleanup old backups
      await this.cleanupOldBackups();

      logger.info({
        message: 'Backup completed successfully',
        category: 'system',
        metadata: { backupId, verified }
      });
    } catch (error) {
      logger.error({
        message: 'Backup failed',
        category: 'system',
        metadata: { backupId },
        error
      });

      await prisma.backup.update({
        where: { id: backupId },
        data: {
          status: 'FAILED',
          endTime: new Date(),
          error: error.message
        }
      });

      throw error;
    }
  }

  /**
   * Backup database using pg_dump
   */
  private async backupDatabase(backupId: string): Promise<string> {
    const backupPath = join(this.config.database.backupPath, `${backupId}.sql.gz`);

    try {
      // Create backup directory if it doesn't exist
      await execAsync(`mkdir -p ${this.config.database.backupPath}`);

      // Run pg_dump and compress output
      const dumpProcess = exec(`pg_dump "${this.config.database.url}"`);
      const gzip = createGzip();
      const writeStream = createWriteStream(backupPath);

      dumpProcess.stdout?.pipe(gzip).pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        dumpProcess.on('error', reject);
      });

      return backupPath;
    } catch (error) {
      throw new Error(`Database backup failed: ${error.message}`);
    }
  }

  /**
   * Backup specified files and directories
   */
  private async backupFiles(backupId: string): Promise<string> {
    const backupPath = join(this.config.files.backupPath, `${backupId}-files.tar.gz`);

    try {
      const output = createWriteStream(backupPath);
      const archive = archiver('tar', { gzip: true });

      archive.pipe(output);

      // Add each path to the archive
      for (const path of this.config.files.paths) {
        archive.directory(path, path);
      }

      await archive.finalize();

      return backupPath;
    } catch (error) {
      throw new Error(`File backup failed: ${error.message}`);
    }
  }

  /**
   * Create backup manifest
   */
  private async createManifest(
    backupId: string,
    paths: { database: string; files: string }
  ): Promise<string> {
    const manifestPath = join(this.config.files.backupPath, `${backupId}-manifest.json`);
    const manifest = {
      id: backupId,
      timestamp: new Date().toISOString(),
      paths,
      config: this.config
    };

    await promisify(require('fs').writeFile)(
      manifestPath,
      JSON.stringify(manifest, null, 2)
    );

    return manifestPath;
  }

  /**
   * Upload backup files to cloud storage
   */
  private async uploadToCloud(backupId: string, paths: string[]): Promise<void> {
    const bucket = this.storage.bucket(this.config.storage.bucket);
    const destinationPath = join(this.config.storage.path, backupId);

    for (const path of paths) {
      const filename = path.split('/').pop();
      await bucket.upload(path, {
        destination: join(destinationPath, filename as string)
      });
    }
  }

  /**
   * Verify backup integrity
   */
  private async verifyBackup(backupId: string): Promise<boolean> {
    try {
      const bucket = this.storage.bucket(this.config.storage.bucket);
      const backupPath = join(this.config.storage.path, backupId);

      // List all files in backup
      const [files] = await bucket.getFiles({ prefix: backupPath });

      // Verify each file exists and is not empty
      for (const file of files) {
        const [metadata] = await file.getMetadata();
        if (!metadata || metadata.size === '0') {
          throw new Error(`Invalid file: ${file.name}`);
        }
      }

      return true;
    } catch (error) {
      logger.error({
        message: 'Backup verification failed',
        category: 'system',
        metadata: { backupId },
        error
      });
      return false;
    }
  }

  /**
   * Get total size of backup
   */
  private async getBackupSize(backupId: string): Promise<number> {
    const bucket = this.storage.bucket(this.config.storage.bucket);
    const backupPath = join(this.config.storage.path, backupId);

    const [files] = await bucket.getFiles({ prefix: backupPath });
    
    return files.reduce((total, file) => {
      const size = parseInt(file.metadata.size || '0');
      return total + size;
    }, 0);
  }

  /**
   * Clean up old backups based on retention policy
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - this.config.retention.days);

      // Get all backups
      const backups = await prisma.backup.findMany({
        where: {
          status: 'COMPLETED',
          startTime: {
            lt: retentionDate
          }
        },
        orderBy: {
          startTime: 'desc'
        }
      });

      // Keep minimum number of backups
      const backupsToDelete = backups.slice(this.config.retention.minBackups);

      for (const backup of backupsToDelete) {
        // Delete from cloud storage
        const bucket = this.storage.bucket(this.config.storage.bucket);
        const backupPath = join(this.config.storage.path, backup.id);
        await bucket.deleteFiles({ prefix: backupPath });

        // Delete from database
        await prisma.backup.delete({
          where: { id: backup.id }
        });
      }
    } catch (error) {
      logger.error({
        message: 'Backup cleanup failed',
        category: 'system',
        error
      });
    }
  }

  /**
   * List available backups
   */
  async listBackups(limit: number = 10): Promise<any[]> {
    return prisma.backup.findMany({
      orderBy: {
        startTime: 'desc'
      },
      take: limit
    });
  }

  /**
   * Restore from backup
   */
  async restore(backupId: string): Promise<void> {
    throw new Error('Restore functionality not implemented');
    // TODO: Implement restore functionality
  }
}