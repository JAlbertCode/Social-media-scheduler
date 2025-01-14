import { NextRequest, NextResponse } from 'next/server';
import { NotionSync } from '@/lib/services/notion-sync';
import { PlatformError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, direction } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's Notion credentials
    const credentials = await prisma.notionCredential.findUnique({
      where: { userId }
    });

    if (!credentials) {
      return NextResponse.json(
        { error: 'Notion credentials not found' },
        { status: 404 }
      );
    }

    const notionSync = new NotionSync(credentials.accessToken);

    // Get user's sync configuration
    const syncConfig = await prisma.notionSyncConfig.findUnique({
      where: { userId }
    });

    if (!syncConfig) {
      return NextResponse.json(
        { error: 'Notion sync configuration not found' },
        { status: 404 }
      );
    }

    // Perform sync based on direction
    if (direction === 'from-notion') {
      await notionSync.syncFromNotion({
        userId,
        notionDatabaseId: syncConfig.databaseId,
        templates: syncConfig.templates
      });
    } else if (direction === 'to-notion') {
      await notionSync.syncToNotion({
        userId,
        notionDatabaseId: syncConfig.databaseId,
        templates: syncConfig.templates
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid sync direction' },
        { status: 400 }
      );
    }

    // Update last synced timestamp
    await prisma.notionSyncConfig.update({
      where: { userId },
      data: { lastSyncedAt: new Date() }
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Notion sync error:', error);

    if (error instanceof PlatformError) {
      return NextResponse.json(
        { error: error.message, code: error.code, context: error.context },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to sync with Notion' },
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

    // Get sync configuration and status
    const syncConfig = await prisma.notionSyncConfig.findUnique({
      where: { userId },
      select: {
        databaseId: true,
        templates: true,
        lastSyncedAt: true,
        syncEnabled: true,
        autoSyncInterval: true
      }
    });

    if (!syncConfig) {
      return NextResponse.json(
        { error: 'Notion configuration not found' },
        { status: 404 }
      );
    }

    // Get recent sync history
    const syncHistory = await prisma.notionSyncHistory.findMany({
      where: { userId },
      orderBy: { syncedAt: 'desc' },
      take: 10,
      select: {
        direction: true,
        status: true,
        syncedAt: true,
        error: true
      }
    });

    return NextResponse.json({
      config: syncConfig,
      history: syncHistory
    });
  } catch (error) {
    console.error('Notion config retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Notion configuration' },
      { status: 500 }
    );
  }
}