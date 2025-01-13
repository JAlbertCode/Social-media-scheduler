'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { PlatformConnection } from '@/components/PlatformConnection'
import { PlatformType } from '@/components/PostCreator'

interface PlatformStatus {
  isConnected: boolean
  profileData?: {
    username: string
    displayName?: string
    profileImage?: string
  }
}

type PlatformStatuses = {
  [key in PlatformType]?: PlatformStatus
}

export default function ConnectionsPage() {
  const { data: session } = useSession()
  const [platformStatuses, setPlatformStatuses] = useState<PlatformStatuses>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlatformStatuses = async () => {
      try {
        const response = await fetch('/api/platforms/status')
        if (response.ok) {
          const data = await response.json()
          setPlatformStatuses(data)
        }
      } catch (error) {
        console.error('Failed to fetch platform statuses:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchPlatformStatuses()
    }
  }, [session])

  const handleConnect = async (platform: PlatformType) => {
    const response = await fetch(`/api/auth/${platform.toLowerCase()}`)
    if (response.ok) {
      const { url } = await response.json()
      window.location.href = url
    } else {
      throw new Error('Failed to start authentication')
    }
  }

  const handleDisconnect = async (platform: PlatformType) => {
    const response = await fetch(
      `/api/auth/${platform.toLowerCase()}`,
      { method: 'DELETE' }
    )

    if (!response.ok) {
      throw new Error('Failed to disconnect')
    }

    setPlatformStatuses(current => ({
      ...current,
      [platform]: { isConnected: false }
    }))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          Loading platform connections...
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Platform Connections</h1>

        <div className="space-y-4">
          {(['Twitter', 'LinkedIn'] as PlatformType[]).map(platform => (
            <PlatformConnection
              key={platform}
              platform={platform}
              isConnected={platformStatuses[platform]?.isConnected ?? false}
              profileData={platformStatuses[platform]?.profileData}
              onConnect={() => handleConnect(platform)}
              onDisconnect={() => handleDisconnect(platform)}
            />
          ))}
        </div>

        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">Coming Soon</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['Instagram', 'TikTok', 'YouTube'].map(platform => (
              <div
                key={platform}
                className="bg-white rounded-lg p-4 border opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span>{platform}</span>
                  <span className="text-xs text-gray-500">Coming soon</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}