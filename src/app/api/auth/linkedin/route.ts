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
      const authUrl = PlatformFactory.getAuthUrl('LinkedIn')
      return NextResponse.redirect(authUrl)
    }

    const platform = PlatformFactory.getPlatform('LinkedIn')
    const tokenData = await platform.authorize(code)
    const userData = await platform.getUser(tokenData.accessToken)

    // Store the token data in the database
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'linkedin',
          providerAccountId: userData.id
        }
      },
      update: {
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
        expires_at: tokenData.expiresAt?.getTime(),
        token_type: tokenData.tokenType,
        scope: tokenData.scope
      },
      create: {
        userId: session.user.id,
        type: 'oauth',
        provider: 'linkedin',
        providerAccountId: userData.id,
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
        expires_at: tokenData.expiresAt?.getTime(),
        token_type: tokenData.tokenType,
        scope: tokenData.scope
      }
    })

    return NextResponse.redirect('/settings/connections')
  } catch (error) {
    console.error('LinkedIn auth error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate with LinkedIn' },
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
        provider: 'linkedin'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('LinkedIn disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect LinkedIn account' },
      { status: 500 }
    )
  }
}