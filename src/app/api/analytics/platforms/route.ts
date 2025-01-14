import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PlatformType } from '@/components/PostCreator'
import {
  getPlatformAnalytics,
  getComparativePlatformAnalytics,
  AnalyticsPeriod
} from '@/lib/analytics/platformAnalytics'

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') as PlatformType
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const compare = searchParams.get('compare') === 'true'

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start and end dates are required' },
        { status: 400 }
      )
    }

    const period: AnalyticsPeriod = {
      start: new Date(startDate),
      end: new Date(endDate)
    }

    if (compare) {
      // Get analytics for all platforms
      const analytics = await getComparativePlatformAnalytics(
        session.user.id,
        period
      )

      return NextResponse.json(analytics)
    } else if (platform) {
      // Get analytics for specific platform
      const analytics = await getPlatformAnalytics(
        session.user.id,
        platform,
        period
      )

      return NextResponse.json(analytics)
    } else {
      return NextResponse.json(
        { error: 'Platform parameter is required when not comparing' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    )
  }
}