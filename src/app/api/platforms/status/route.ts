import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { PlatformFactory } from '@/lib/platforms'
import { PlatformType } from '@/components/PostCreator'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accounts = await prisma.account.findMany({
      where: {
        userId: session.user.id,
        provider: {
          in: ['twitter', 'linkedin']
        }
      }
    })

    const statuses: Record<string, any> = {}

    // Get status for each implemented platform
    for (const platform of ['Twitter', 'LinkedIn'] as PlatformType[]) {
      if (!PlatformFactory.isImplemented(platform)) continue

      const account = accounts.find(
        a => a.provider.toLowerCase() === platform.toLowerCase()
      )

      if (!account?.access_token) {
        statuses[platform] = {
          isConnected: false
        }
        continue
      }

      // Check if token needs refresh
      if (account.expires_at && account.expires_at < Date.now()) {
        if (!account.refresh_token) {
          statuses[platform] = {
            isConnected: false
          }
          continue
        }

        try {
          // Refresh token
          const platformInstance = PlatformFactory.getPlatform(platform)
          const newTokenData = await platformInstance.refreshToken(account.refresh_token)

          // Update token in database
          await prisma.account.update({
            where: { id: account.id },
            data: {
              access_token: newTokenData.accessToken,
              refresh_token: newTokenData.refreshToken,
              expires_at: newTokenData.expiresAt?.getTime()
            }
          })

          account.access_token = newTokenData.accessToken
        } catch (error) {
          console.error(`Failed to refresh ${platform} token:`, error)
          statuses[platform] = {
            isConnected: false
          }
          continue
        }
      }

      try {
        // Get user profile data
        const platformInstance = PlatformFactory.getPlatform(platform)
        const userData = await platformInstance.getUser(account.access_token)

        statuses[platform] = {
          isConnected: true,
          profileData: {
            username: userData.username,
            displayName: userData.displayName,
            profileImage: userData.profileImage
          }
        }
      } catch (error) {
        console.error(`Failed to get ${platform} user data:`, error)
        statuses[platform] = {
          isConnected: false
        }
      }
    }

    return NextResponse.json(statuses)
  } catch (error) {
    console.error('Platform status error:', error)
    return NextResponse.json(
      { error: 'Failed to get platform statuses' },
      { status: 500 }
    )
  }
}