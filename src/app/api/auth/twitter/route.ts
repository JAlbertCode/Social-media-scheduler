import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { PlatformFactory } from '@/lib/platforms'
import crypto from 'crypto'

// PKCE Challenge generator for OAuth 2.0
function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url')
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url')
  return { verifier, challenge }
}

// Store PKCE verifier temporarily (in production, use Redis or similar)
const PKCE_STORE = new Map<string, string>()

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    if (!code) {
      // Start OAuth flow - generate PKCE and redirect to Twitter
      const { verifier, challenge } = generatePKCE()
      const state = crypto.randomBytes(16).toString('hex')
      
      // Store verifier for later
      PKCE_STORE.set(state, verifier)

      const platform = PlatformFactory.getPlatform('Twitter')
      const authUrl = new URL(platform.getAuthUrl())
      authUrl.searchParams.set('code_challenge', challenge)
      authUrl.searchParams.set('state', state)

      return NextResponse.redirect(authUrl)
    }

    // Handle OAuth callback
    if (!state || !PKCE_STORE.has(state)) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
    }

    const verifier = PKCE_STORE.get(state)!
    PKCE_STORE.delete(state) // Clean up

    const platform = PlatformFactory.getPlatform('Twitter')
    const tokenData = await platform.authorize(code, verifier)
    const userData = await platform.getUser(tokenData.accessToken)

    // Store or update Twitter connection
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'twitter',
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
        provider: 'twitter',
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

    // Store Twitter-specific preferences
    await prisma.platformPreferences.upsert({
      where: {
        userId_platform: {
          userId: session.user.id,
          platform: 'Twitter'
        }
      },
      update: {
        defaultThreadStyle: 'numbered',
        autoReplyToThread: true,
        threadPacing: 0, // 0 means post all tweets immediately
        includeTrailingHashtags: true
      },
      create: {
        userId: session.user.id,
        platform: 'Twitter',
        defaultThreadStyle: 'numbered',
        autoReplyToThread: true,
        threadPacing: 0,
        includeTrailingHashtags: true
      }
    })

    return NextResponse.redirect('/settings/connections')
  } catch (error) {
    console.error('Twitter auth error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate with Twitter' },
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

    // Update Twitter preferences
    await prisma.platformPreferences.update({
      where: {
        userId_platform: {
          userId: session.user.id,
          platform: 'Twitter'
        }
      },
      data: {
        defaultThreadStyle: data.defaultThreadStyle,
        autoReplyToThread: data.autoReplyToThread,
        threadPacing: data.threadPacing,
        includeTrailingHashtags: data.includeTrailingHashtags
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Twitter preferences update error:', error)
    return NextResponse.json(
      { error: 'Failed to update Twitter preferences' },
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

    // Remove Twitter connection and preferences
    await Promise.all([
      prisma.account.deleteMany({
        where: {
          userId: session.user.id,
          provider: 'twitter'
        }
      }),
      prisma.platformPreferences.delete({
        where: {
          userId_platform: {
            userId: session.user.id,
            platform: 'Twitter'
          }
        }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Twitter disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Twitter account' },
      { status: 500 }
    )
  }
}