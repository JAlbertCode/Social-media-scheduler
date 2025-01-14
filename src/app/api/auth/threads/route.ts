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

    // Check if user has Instagram connected first
    const instagramAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'instagram'
      }
    })

    if (!instagramAccount) {
      return NextResponse.json(
        { error: 'Instagram account must be connected first' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    if (!code) {
      // Redirect to Threads/Instagram authorization
      const platform = PlatformFactory.getPlatform('Threads')
      const authUrl = platform.getAuthUrl()
      return NextResponse.redirect(authUrl)
    }

    // Exchange code for tokens
    const platform = PlatformFactory.getPlatform('Threads')
    const tokenData = await platform.authorize(code)

    // Get user profile
    const userData = await platform.getUser(tokenData.accessToken)

    // Store or update the Threads connection
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'threads',
          providerAccountId: userData.id
        }
      },
      update: {
        access_token: tokenData.accessToken,
        expires_at: tokenData.expiresAt?.getTime(),
        scope: tokenData.scope,
        user: {
          connect: {
            id: session.user.id
          }
        }
      },
      create: {
        provider: 'threads',
        providerAccountId: userData.id,
        access_token: tokenData.accessToken,
        expires_at: tokenData.expiresAt?.getTime(),
        scope: tokenData.scope,
        user: {
          connect: {
            id: session.user.id
          }
        }
      }
    })

    // Set up platform preferences
    await prisma.platformPreferences.upsert({
      where: {
        userId_platform: {
          userId: session.user.id,
          platform: 'Threads'
        }
      },
      update: {
        defaultThreadStyle: 'continuous', // 'continuous' or 'numbered'
        autoReplyToThread: true,
        includeTrailingHashtags: true,
        shareToInstagram: false // whether to cross-post to Instagram by default
      },
      create: {
        userId: session.user.id,
        platform: 'Threads',
        defaultThreadStyle: 'continuous',
        autoReplyToThread: true,
        includeTrailingHashtags: true,
        shareToInstagram: false
      }
    })

    return NextResponse.redirect('/settings/connections')
  } catch (error) {
    console.error('Threads auth error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate with Threads' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Update Threads preferences
    await prisma.platformPreferences.update({
      where: {
        userId_platform: {
          userId: session.user.id,
          platform: 'Threads'
        }
      },
      data: {
        defaultThreadStyle: data.defaultThreadStyle,
        autoReplyToThread: data.autoReplyToThread,
        includeTrailingHashtags: data.includeTrailingHashtags,
        shareToInstagram: data.shareToInstagram
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Threads preferences update error:', error)
    return NextResponse.json(
      { error: 'Failed to update Threads preferences' },
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

    // Remove Threads connection and preferences
    await Promise.all([
      prisma.account.deleteMany({
        where: {
          userId: session.user.id,
          provider: 'threads'
        }
      }),
      prisma.platformPreferences.delete({
        where: {
          userId_platform: {
            userId: session.user.id,
            platform: 'Threads'
          }
        }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Threads disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Threads account' },
      { status: 500 }
    )
  }
}