import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { PlatformFactory } from '@/lib/platforms'

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    if (!code) {
      // Redirect to YouTube authorization
      const authUrl = PlatformFactory.getAuthUrl('YouTube')
      return NextResponse.redirect(authUrl)
    }

    // Exchange code for tokens
    const platform = PlatformFactory.getPlatform('YouTube')
    const tokenData = await platform.authorize(code)

    // Get user profile
    const userData = await platform.getUser(tokenData.accessToken)

    // Store or update the YouTube connection
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'youtube',
          providerAccountId: userData.id
        }
      },
      update: {
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
        expires_at: tokenData.expiresAt?.getTime(),
        token_type: tokenData.tokenType,
        scope: tokenData.scope,
        user: {
          connect: {
            id: session.user.id
          }
        }
      },
      create: {
        provider: 'youtube',
        providerAccountId: userData.id,
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
        expires_at: tokenData.expiresAt?.getTime(),
        token_type: tokenData.tokenType,
        scope: tokenData.scope,
        user: {
          connect: {
            id: session.user.id
          }
        }
      }
    })

    // Redirect back to connections page
    return NextResponse.redirect('/settings/connections')
  } catch (error) {
    console.error('YouTube auth error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate with YouTube' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove YouTube connection
    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: 'youtube'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('YouTube disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect YouTube account' },
      { status: 500 }
    )
  }
}