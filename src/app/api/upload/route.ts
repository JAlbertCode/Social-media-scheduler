import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get user's Google credentials from database
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id as string,
        provider: 'google',
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Google account not connected' }, { status: 400 });
    }

    // Set up Google Drive client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Upload file to Google Drive
    const buffer = await file.arrayBuffer();
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        mimeType: file.type,
      },
      media: {
        mimeType: file.type,
        body: buffer,
      },
    });

    // Save file metadata to our database
    const media = await prisma.media.create({
      data: {
        userId: session.user.id as string,
        type: file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO',
        url: `https://drive.google.com/uc?id=${response.data.id}`,
        googleDriveId: response.data.id,
        mimeType: file.type,
        size: file.size,
      },
    });

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}