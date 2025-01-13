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
      const authUrl = PlatformFactory.getAuthUrl('Twitter')
      return NextResponse.redirect(authUrl)
    }

    const platform = PlatformFactory.getPlatform('Twitter')
    const tokenData = await platform.authorize(code)

    // Store the token data in the database
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'twitter',
          providerAccountId: (await platform.getUser(tokenData.accessToken)).id
        }
      },
      update: {
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
        expires_at: tokenData.expiresAt?.getTime(),
        token_type: tokenData.tokenType,
      },
      create: {
        userId: session.user.id,
        type: 'oauth',
        provider: 'twitter',
        providerAccountId: (await platform.getUser(tokenData.accessToken)).id,
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
        expires_at: tokenData.expiresAt?.getTime(),
        token_type: tokenData.tokenType,
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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: 'twitter'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Twitter disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Twitter account' },
      { status: 500 }
    )
  }
}