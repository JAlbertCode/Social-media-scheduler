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
      // Redirect to Instagram authorization
      const authUrl = PlatformFactory.getAuthUrl('Instagram')
      return NextResponse.redirect(authUrl)
    }

    // Exchange code for tokens
    const platform = PlatformFactory.getPlatform('Instagram')
    const tokenData = await platform.authorize(code)

    // Get user profile to get Instagram user ID
    const userData = await platform.getUser(tokenData.accessToken)

    // Store or update the Instagram connection
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'instagram',
          providerAccountId: userData.id
        }
      },
      update: {
        access_token: tokenData.accessToken,
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
        provider: 'instagram',
        providerAccountId: userData.id,
        access_token: tokenData.accessToken,
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
    console.error('Instagram auth error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate with Instagram' },
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

    // Remove Instagram connection
    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: 'instagram'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Instagram disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Instagram account' },
      { status: 500 }
    )
  }
}