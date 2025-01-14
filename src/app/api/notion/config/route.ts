import { NextRequest, NextResponse } from 'next/server';
import { PlatformError } from '@/lib/utils/errors';
import { prisma } from '@/lib/prisma';
import { NotionService } from '@/lib/services/notion';

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      accessToken,
      databaseId,
      templates,
      syncEnabled = true,
      autoSyncInterval = 3600 // Default to 1 hour
    } = await req.json();

    if (!userId || !accessToken || !databaseId) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Validate Notion access token and database ID
    try {
      const notion = new NotionService(accessToken);
      await notion.getPages(databaseId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid Notion credentials or database ID' },
        { status: 400 }
      );
    }

    // Create or update Notion credentials
    await prisma.notionCredential.upsert({
      where: { userId },
      create: {
        userId,
        accessToken
      },
      update: {
        accessToken
      }
    });

    // Create or update sync configuration
    const config = await prisma.notionSyncConfig.upsert({
      where: { userId },
      create: {
        userId,
        databaseId,
        templates,
        syncEnabled,
        autoSyncInterval
      },
      update: {
        databaseId,
        templates,
        syncEnabled,
        autoSyncInterval
      }
    });

    return NextResponse.json({
      status: 'success',
      config: {
        databaseId: config.databaseId,
        templates: config.templates,
        syncEnabled: config.syncEnabled,
        autoSyncInterval: config.autoSyncInterval
      }
    });
  } catch (error) {
    console.error('Notion config update error:', error);

    if (error instanceof PlatformError) {
      return NextResponse.json(
        { error: error.message, code: error.code, context: error.context },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update Notion configuration' },
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

    // Get user's Notion configuration
    const config = await prisma.notionSyncConfig.findUnique({
      where: { userId },
      select: {
        databaseId: true,
        templates: true,
        syncEnabled: true,
        autoSyncInterval: true,
        lastSyncedAt: true
      }
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Notion configuration not found' },
        { status: 404 }
      );
    }

    // Check connection status
    const credentials = await prisma.notionCredential.findUnique({
      where: { userId }
    });

    let connectionStatus = 'disconnected';
    if (credentials) {
      try {
        const notion = new NotionService(credentials.accessToken);
        await notion.getPages(config.databaseId);
        connectionStatus = 'connected';
      } catch (error) {
        connectionStatus = 'error';
      }
    }

    return NextResponse.json({
      ...config,
      connectionStatus
    });
  } catch (error) {
    console.error('Notion config retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve Notion configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete Notion credentials and configuration
    await prisma.$transaction([
      prisma.notionCredential.delete({
        where: { userId }
      }),
      prisma.notionSyncConfig.delete({
        where: { userId }
      })
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Notion config deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete Notion configuration' },
      { status: 500 }
    );
  }
}